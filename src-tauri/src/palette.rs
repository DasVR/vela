//! The command palette: a small borderless always-on-top window above the
//! main one. Built lazily on first open, hidden (not destroyed) on close.

use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

const PALETTE_W: f64 = 560.0;
const PALETTE_H: f64 = 400.0;

fn palette_url(app: &AppHandle) -> WebviewUrl {
    if tauri::is_dev() {
        if let Some(dev) = app.config().build.dev_url.clone() {
            if let Ok(joined) = dev.join("palette") {
                return WebviewUrl::External(joined);
            }
        }
    }
    WebviewUrl::App("palette.html".into())
}

fn ensure_palette(app: &AppHandle) -> tauri::Result<tauri::WebviewWindow> {
    if let Some(w) = app.get_webview_window("palette") {
        return Ok(w);
    }
    let win = WebviewWindowBuilder::new(app, "palette", palette_url(app))
        .title("Vela palette")
        .inner_size(PALETTE_W, PALETTE_H)
        .decorations(false)
        .resizable(false)
        .visible(false)
        .always_on_top(true)
        .skip_taskbar(true);

    #[cfg(target_os = "macos")]
    let win = win.transparent(true).title_bar_style(tauri::TitleBarStyle::Overlay);

    let win = win.build()?;

    // click-away / focus-loss closes it
    let app2 = app.clone();
    win.on_window_event(move |event| {
        if let tauri::WindowEvent::Focused(false) = event {
            if let Some(w) = app2.get_webview_window("palette") {
                let _ = w.hide();
            }
        }
    });
    Ok(win)
}

#[tauri::command]
pub fn open_palette(app: AppHandle) -> Result<(), String> {
    let pal = ensure_palette(&app).map_err(|e| e.to_string())?;
    let main = app
        .get_window("main")
        .ok_or_else(|| "main window missing".to_string())?;
    let (mw, _mh) = match main.inner_size() {
        Ok(s) => (s.width as i32, s.height as i32),
        Err(_) => (1280, 800),
    };
    let (x, y) = main
        .outer_position()
        .map(|p| (p.x, p.y))
        .unwrap_or((100, 100));
    let _ = pal.set_position(tauri::PhysicalPosition::new(
        x + ((mw as f64 - PALETTE_W) as i32 / 2),
        y + 80,
    ));
    let _ = pal.show();
    let _ = pal.set_focus();
    Ok(())
}

#[tauri::command]
pub fn close_palette(app: AppHandle) -> Result<(), String> {
    if let Some(pal) = app.get_webview_window("palette") {
        let _ = pal.hide();
    }
    Ok(())
}
