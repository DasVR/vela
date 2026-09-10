//! Vela — a small, fast, personal browser.
//!
//! Architecture: one OS window ("main"). The chrome strip is a child
//! webview ("strip") fixed at 92 logical px. Every tab is its own real
//! native webview filling the rest of the window; only the active one is
//! visible. A background poller mirrors (url, title) into the strip and
//! persists history/session.
//!
//! Security: app commands are callable from ANY webview we host —
//! including external websites loaded in tabs. Every command below
//! therefore gates on who is calling: the chrome strip / palette labels,
//! or a webview whose CURRENT url is our own app origin. An external
//! page cannot forge either.

mod palette;
mod shield;
mod store;
mod tabs;

use std::sync::Arc;
use std::time::Duration;

use tauri::{Emitter, Manager, Webview, WindowEvent};

use tabs::{TabMgr, CHROME_H};

/// labels that are always trusted: our own chrome
fn caller_is_chrome(wv: &Webview) -> bool {
    matches!(wv.label(), "strip" | "palette")
}

/// true when the calling webview is currently showing our own app origin
/// (start page / strip / palette in dev or production form)
fn caller_is_app(app: &tauri::AppHandle, wv: &Webview) -> bool {
    let origin = tabs::app_origin(app);
    match wv.url() {
        Ok(u) => tabs::same_origin(&u, &origin),
        Err(_) => false,
    }
}

fn empty_session() -> store::SessionState {
    store::SessionState {
        history: vec![],
        bookmarks: vec![],
        tabs: vec![],
        active_id: None,
        theme: "light".into(),
    }
}

// ----- tab commands ---------------------------------------------------------

#[tauri::command]
fn create_webview_tab(
    app: tauri::AppHandle,
    mgr: tauri::State<'_, Arc<TabMgr>>,
    id: Option<String>,
    url: String,
    activate: bool,
) -> Result<String, String> {
    let id = id.unwrap_or_else(|| mgr.next_id());
    let window = app
        .get_window("main")
        .ok_or_else(|| "main window missing".to_string())?;
    let wv = tabs::build_tab_webview(&app, &window, &id, &url).map_err(|e| e.to_string())?;
    mgr.register(&id, &url, wv.clone());
    if activate {
        mgr.set_active(&app, &id);
    } else {
        let _ = wv.hide();
    }
    let _ = app.emit("tab://created", serde_json::json!({ "id": id, "url": url }));
    Ok(id)
}

#[tauri::command]
fn activate_tab(
    app: tauri::AppHandle,
    mgr: tauri::State<'_, Arc<TabMgr>>,
    id: String,
) -> Result<(), String> {
    mgr.set_active(&app, &id);
    Ok(())
}

#[tauri::command]
fn close_tab(
    app: tauri::AppHandle,
    mgr: tauri::State<'_, Arc<TabMgr>>,
    id: String,
) -> Result<(), String> {
    mgr.remove(&id);
    let _ = app;
    Ok(())
}

#[tauri::command]
fn load_in_tab(
    app: tauri::AppHandle,
    mgr: tauri::State<'_, Arc<TabMgr>>,
    wv: Webview,
    id: String,
    url: String,
) -> Result<(), String> {
    // the start page may navigate its own tab; the strip may navigate any
    let allowed = caller_is_chrome(&wv) || (id == wv.label() && caller_is_app(&app, &wv));
    if !allowed {
        return Err("not permitted".into());
    }
    let tab = mgr.webview(&id).ok_or_else(|| "no such tab".to_string())?;
    let target = if url.starts_with("vela://") {
        tabs::start_url(&app)
    } else {
        tauri::Url::parse(&url).map_err(|e| e.to_string())?
    };
    tab.navigate(target).map_err(|e| e.to_string())?;
    mgr.set_url(&id, &url);
    Ok(())
}

#[tauri::command]
fn reload_tab(mgr: tauri::State<'_, Arc<TabMgr>>, id: String) -> Result<(), String> {
    let wv = mgr.webview(&id).ok_or_else(|| "no such tab".to_string())?;
    wv.eval("location.reload()").map_err(|e| e.to_string())
}

#[tauri::command]
fn go_back(mgr: tauri::State<'_, Arc<TabMgr>>, id: String) -> Result<(), String> {
    let wv = mgr.webview(&id).ok_or_else(|| "no such tab".to_string())?;
    wv.eval("history.back()").map_err(|e| e.to_string())
}

#[tauri::command]
fn go_forward(mgr: tauri::State<'_, Arc<TabMgr>>, id: String) -> Result<(), String> {
    let wv = mgr.webview(&id).ok_or_else(|| "no such tab".to_string())?;
    wv.eval("history.forward()").map_err(|e| e.to_string())
}

#[tauri::command]
fn list_tabs(app: tauri::AppHandle, wv: Webview) -> Vec<tabs::TabInfo> {
    if !caller_is_chrome(&wv) && !caller_is_app(&app, &wv) {
        return vec![];
    }
    app.state::<Arc<TabMgr>>().infos()
}

// ----- data commands (gated) ------------------------------------------------

#[tauri::command]
fn report_title(app: tauri::AppHandle, wv: Webview, title: String) {
    mgr_set_title(&app, wv.label(), &title);
}

fn mgr_set_title(app: &tauri::AppHandle, id: &str, title: &str) {
    use tauri::Manager;
    if let Some(mgr) = app.try_state::<Arc<TabMgr>>() {
        mgr.set_title(id, title);
    }
}

#[tauri::command]
fn restore_session(app: tauri::AppHandle, wv: Webview) -> store::SessionState {
    if !caller_is_chrome(&wv) {
        // external pages get nothing
        return empty_session();
    }
    app.state::<Arc<store::Store>>().restore_session()
}

#[derive(serde::Serialize)]
struct StartState {
    recents: Vec<store::HistoryEntry>,
    bookmarks: Vec<store::Bookmark>,
    theme: String,
}

#[tauri::command]
fn start_state(app: tauri::AppHandle, wv: Webview) -> StartState {
    if !caller_is_app(&app, &wv) {
        return StartState {
            recents: vec![],
            bookmarks: vec![],
            theme: "light".into(),
        };
    }
    let s = app.state::<Arc<store::Store>>().restore_session();
    StartState {
        recents: s.history.into_iter().take(8).collect(),
        bookmarks: s.bookmarks,
        theme: s.theme,
    }
}

#[tauri::command]
fn add_history(app: tauri::AppHandle, wv: Webview, url: String, title: String) {
    if !caller_is_chrome(&wv) {
        return;
    }
    let _ = url;
    let _ = title;
    let _ = app;
    // history is written by the poller; kept for API compat
}

#[tauri::command]
fn add_bookmark(app: tauri::AppHandle, wv: Webview, bookmark: store::Bookmark) {
    if !caller_is_chrome(&wv) {
        return;
    }
    app.state::<Arc<store::Store>>().add_bookmark(&bookmark);
}

#[tauri::command]
fn remove_bookmark(app: tauri::AppHandle, wv: Webview, url: String) {
    if !caller_is_chrome(&wv) {
        return;
    }
    app.state::<Arc<store::Store>>().remove_bookmark(&url);
}

#[tauri::command]
fn clear_history(app: tauri::AppHandle, wv: Webview) {
    if !caller_is_chrome(&wv) {
        return;
    }
    app.state::<Arc<store::Store>>().clear_history();
}

#[tauri::command]
fn set_theme(app: tauri::AppHandle, wv: Webview, theme: String) {
    if !caller_is_chrome(&wv) {
        return;
    }
    app.state::<Arc<store::Store>>().set_kv("theme", &theme);
}

// ----- poller: mirror tab state into the strip + persist ---------------------

fn run_poller(app: tauri::AppHandle, store: Arc<store::Store>, mgr: Arc<TabMgr>) {
    std::thread::spawn(move || {
        let mut last: std::collections::HashMap<String, (String, String)> =
            std::collections::HashMap::new();
        let mut tick: u32 = 0;
        loop {
            std::thread::sleep(Duration::from_millis(700));
            tick = tick.wrapping_add(1);
            let origin = tabs::app_origin(&app);
            for label in mgr.labels() {
                let Some(wv) = mgr.webview(&label) else {
                    continue;
                };
                let Ok(u) = wv.url() else { continue };
                let title = mgr.title_of(&label).unwrap_or_default();
                let norm = tabs::normalize_url(&u, &origin);
                let ent = (norm.clone(), title.clone());
                let prev = last.insert(label.clone(), ent.clone());
                if prev.as_ref() != Some(&ent) {
                    let url_changed = prev.map(|p| p.0 != norm).unwrap_or(true);
                    let _ = app.emit(
                        "tab://loaded",
                        serde_json::json!({ "id": label, "url": norm, "title": title }),
                    );
                    if url_changed && (norm.starts_with("http://") || norm.starts_with("https://"))
                    {
                        store.add_history(&norm, &ent.1, chrono_ms());
                    }
                }
                mgr.observe(&label, &norm, &ent.1);
            }
            if tick % 8 == 0 {
                let infos = mgr.infos();
                let active = mgr.active();
                store.save_session(
                    &infos
                        .iter()
                        .map(|t| store::TabSave {
                            id: t.id.clone(),
                            url: t.url.clone(),
                            title: t.title.clone(),
                        })
                        .collect::<Vec<_>>(),
                    active.as_deref(),
                );
            }
        }
    });
}

fn chrono_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

/// parse "26.2" style macOS product version; true when >= (major, minor)
#[cfg(target_os = "macos")]
fn macos_version_at_least(major: u32, minor: u32) -> bool {
    let out = std::process::Command::new("sw_vers")
        .arg("-productVersion")
        .output();
    let Ok(out) = out else { return false };
    let s = String::from_utf8_lossy(&out.stdout);
    let mut it = s.trim().split('.');
    let maj = it.next().and_then(|p| p.parse::<u32>().ok()).unwrap_or(0);
    let min = it.next().and_then(|p| p.parse::<u32>().ok()).unwrap_or(0);
    (maj, min) >= (major, minor)
}

pub fn run() {
    tauri::Builder::default()
        .manage::<Arc<TabMgr>>(tabs::TabMgr::shared())
        .invoke_handler(tauri::generate_handler![
            create_webview_tab,
            activate_tab,
            close_tab,
            load_in_tab,
            reload_tab,
            go_back,
            go_forward,
            list_tabs,
            report_title,
            restore_session,
            start_state,
            add_history,
            add_bookmark,
            remove_bookmark,
            clear_history,
            set_theme,
            palette::open_palette,
            palette::close_palette
        ])
        .setup(|app| {
            // one shared SQLite-backed store for poller + commands
            let store = store::Store::open(app.handle());
            app.manage(store.clone());

            let window = tauri::window::WindowBuilder::new(app, "main")
                .title("Vela")
                .inner_size(1280.0, 800.0)
                .min_inner_size(680.0, 480.0)
                .decorations(true)
                .resizable(true)
                .visible(true);

            #[cfg(target_os = "macos")]
            let window = window
                .title_bar_style(tauri::TitleBarStyle::Overlay)
                .hidden_title(true)
                .transparent(true);

            let window = window.build()?;

            // macOS: real liquid glass on the whole window (26+), vibrancy fallback
            #[cfg(target_os = "macos")]
            {
                use window_vibrancy::{apply_liquid_glass, apply_vibrancy, LiquidGlassOptions, NSGlassEffectViewStyle, NSVisualEffectMaterial};
                let applied = (|| -> Result<(), window_vibrancy::Error> {
                    // liquid glass needs macOS 26+
                    if macos_version_at_least(26, 0) {
                        let opts = LiquidGlassOptions::new(NSGlassEffectViewStyle::Clear)
                            .radius(26.0)
                            .opaque(false);
                        apply_liquid_glass(&window, opts)
                    } else {
                        apply_vibrancy(
                            &window,
                            NSVisualEffectMaterial::HudWindow,
                            None,
                            None,
                        )
                    }
                })();
                if let Err(e) = applied {
                    eprintln!("[vela] glass/vibrancy unavailable: {e:?}");
                }
            }

            // chrome strip webview, pinned to the top 92px
            let strip = tauri::webview::WebviewBuilder::new("strip", tabs::strip_url(app.handle()));
            let (w, _h) = tabs::content_size(&window);
            window.add_child(
                strip,
                tauri::LogicalPosition::new(0.0, 0.0),
                tauri::LogicalSize::new(w, CHROME_H),
            )?;

            // relayout on resize: strip stays 92px, tabs fill the rest
            let app_handle = app.handle().clone();
            window.on_window_event(move |event| {
                if let WindowEvent::Resized(_) = event {
                    if let Some(win) = app_handle.get_window("main") {
                        tabs::relayout(&app_handle, &win);
                    }
                }
            });

            // save session and exit cleanly on close
            let app_handle = app.handle().clone();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { .. } = event {
                    let store = app_handle.state::<Arc<store::Store>>();
                    let mgr = app_handle.state::<Arc<TabMgr>>();
                    let infos = mgr.infos();
                    let active = mgr.active();
                    store.save_session(
                        &infos
                            .iter()
                            .map(|t| store::TabSave {
                                id: t.id.clone(),
                                url: t.url.clone(),
                                title: t.title.clone(),
                            })
                            .collect::<Vec<_>>(),
                        active.as_deref(),
                    );
                    app_handle.exit(0);
                }
            });

            let app_handle = app.handle().clone();
            let store2 = store.clone();
            let mgr = app.state::<Arc<TabMgr>>().inner().clone();
            run_poller(app_handle, store2, mgr);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running vela");
}
