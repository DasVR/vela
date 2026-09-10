//! Tab webview management: one real native webview per tab, parented to
//! the main window below the chrome strip.

use std::collections::HashMap;
use std::sync::Arc;

use parking_lot::{Mutex, RwLock};
use serde::Serialize;
use tauri::{AppHandle, Manager, Webview, WebviewUrl, Window};

/// logical px height of the chrome strip (tab rail 40 + toolbar 52)
pub const CHROME_H: f64 = 92.0;
pub const START: &str = "vela://start";

#[derive(Serialize, Clone)]
pub struct TabInfo {
    pub id: String,
    pub title: String,
    pub url: String,
}

struct TabState {
    url: String,
    title: String,
}

pub struct TabMgr {
    handles: Mutex<HashMap<String, Webview>>,
    states: RwLock<HashMap<String, TabState>>,
    order: RwLock<Vec<String>>,
    active: RwLock<Option<String>>,
    counter: std::sync::atomic::AtomicU64,
}

impl TabMgr {
    pub fn shared() -> Arc<Self> {
        Arc::new(Self {
            handles: Mutex::new(HashMap::new()),
            states: RwLock::new(HashMap::new()),
            order: RwLock::new(Vec::new()),
            active: RwLock::new(None),
            counter: std::sync::atomic::AtomicU64::new(1000),
        })
    }

    pub fn next_id(&self) -> String {
        format!(
            "tab-{}",
            self.counter
                .fetch_add(1, std::sync::atomic::Ordering::Relaxed)
        )
    }

    pub fn register(&self, id: &str, url: &str, wv: Webview) {
        self.handles.lock().insert(id.to_string(), wv);
        self.states.write().insert(
            id.to_string(),
            TabState {
                url: url.to_string(),
                title: String::new(),
            },
        );
        self.order.write().push(id.to_string());
    }

    pub fn remove(&self, id: &str) {
        if let Some(wv) = self.handles.lock().remove(id) {
            let _ = wv.close();
        }
        self.states.write().remove(id);
        self.order.write().retain(|l| l != id);
        if self.active.read().as_deref() == Some(id) {
            *self.active.write() = None;
        }
    }

    pub fn webview(&self, id: &str) -> Option<Webview> {
        self.handles.lock().get(id).cloned()
    }

    pub fn labels(&self) -> Vec<String> {
        self.order.read().clone()
    }

    pub fn set_active(&self, _app: &AppHandle, id: &str) {
        for l in self.labels() {
            if let Some(wv) = self.webview(&l) {
                if l == id {
                    let _ = wv.show();
                } else {
                    let _ = wv.hide();
                }
            }
        }
        *self.active.write() = Some(id.to_string());
    }

    pub fn active(&self) -> Option<String> {
        self.active.read().clone()
    }

    pub fn set_url(&self, id: &str, url: &str) {
        if let Some(st) = self.states.write().get_mut(id) {
            st.url = url.to_string();
        }
    }

    pub fn infos(&self) -> Vec<TabInfo> {
        let states = self.states.read();
        self.order
            .read()
            .iter()
            .filter_map(|id| {
                states.get(id).map(|st| TabInfo {
                    id: id.clone(),
                    title: st.title.clone(),
                    url: st.url.clone(),
                })
            })
            .collect()
    }

    /// poller: mirror a tab's live (url, title) into manager state
    pub fn observe(&self, id: &str, url: &str, title: &str) {
        if let Some(st) = self.states.write().get_mut(id) {
            st.url = url.to_string();
            st.title = title.to_string();
        }
    }

    /// last-known title for a tab (updated via observe/title events)
    pub fn title_of(&self, id: &str) -> Option<String> {
        self.states.read().get(id).map(|st| st.title.clone())
    }

    /// set a tab's title (called from the title event listener)
    pub fn set_title(&self, id: &str, title: &str) {
        if let Some(st) = self.states.write().get_mut(id) {
            st.title = title.to_string();
        }
    }
}

// ----- url helpers -----------------------------------------------------------

/// the app's own origin: dev-server URL in dev; in production, the origin
/// of the strip webview (tauri:// on Linux/macOS, https://tauri.localhost
/// on Windows)
pub fn app_origin(app: &AppHandle) -> tauri::Url {
    if tauri::is_dev() {
        if let Some(dev) = app.config().build.dev_url.clone() {
            return dev;
        }
        return tauri::Url::parse("http://localhost:1420/").unwrap();
    }
    if let Some(wv) = app.get_webview("strip") {
        if let Ok(u) = wv.url() {
            let mut base = format!("{}://{}", u.scheme(), u.host_str().unwrap_or(""));
            if let Some(p) = u.port() {
                base = format!("{base}:{p}");
            }
            base.push('/');
            if let Ok(origin) = tauri::Url::parse(&base) {
                return origin;
            }
        }
    }
    tauri::Url::parse("http://tauri.localhost/").unwrap()
}

/// true when `u` is served from the app's own origin (strip, start page)
pub fn same_origin(u: &tauri::Url, origin: &tauri::Url) -> bool {
    u.scheme() == origin.scheme() && u.host_str() == origin.host_str() && u.port() == origin.port()
}

/// what the strip should display for a tab: start marker or real URL
pub fn normalize_url(u: &tauri::Url, origin: &tauri::Url) -> String {
    if same_origin(u, origin) {
        START.to_string()
    } else {
        u.to_string()
    }
}

/// dev/prod aware URL for the strip webview
pub fn strip_url(app: &AppHandle) -> WebviewUrl {
    if tauri::is_dev() {
        if let Some(dev) = app.config().build.dev_url.clone() {
            return WebviewUrl::External(dev);
        }
    }
    WebviewUrl::App("index.html".into())
}

/// full URL of the prerendered start page
pub fn start_url(app: &AppHandle) -> tauri::Url {
    let origin = app_origin(app);
    if tauri::is_dev() {
        origin.join("start").unwrap_or(origin)
    } else {
        origin.join("start.html").unwrap_or(origin)
    }
}

/// logical (w, h) of the window content area
pub fn content_size(window: &Window) -> (f64, f64) {
    let scale = window.scale_factor().unwrap_or(1.0);
    match window.inner_size() {
        Ok(s) => (
            (s.width as f64 / scale).round(),
            (s.height as f64 / scale).round(),
        ),
        Err(_) => (1280.0, 800.0),
    }
}

/// build one tab webview
pub fn build_tab_webview(
    app: &AppHandle,
    window: &Window,
    id: &str,
    url: &str,
) -> tauri::Result<Webview> {
    let wv_url = if url.starts_with("vela://") {
        if tauri::is_dev() {
            WebviewUrl::External(start_url(app))
        } else {
            WebviewUrl::App("start.html".into())
        }
    } else {
        match tauri::Url::parse(url) {
            Ok(u) => WebviewUrl::External(u),
            Err(_) => WebviewUrl::App("start.html".into()),
        }
    };

    let builder = tauri::webview::WebviewBuilder::new(id, wv_url)
        .initialization_script(crate::shield::COSMETIC_JS);

    let (w, h) = content_size(window);
    window.add_child(
        builder,
        tauri::LogicalPosition::new(0.0, CHROME_H),
        tauri::LogicalSize::new(w, (h - CHROME_H).max(120.0)),
    )
}

/// resize: strip stays 92px, every tab webview fills the rest
pub fn relayout(app: &AppHandle, window: &Window) {
    let (w, h) = content_size(window);
    if let Some(strip) = app.get_webview("strip") {
        let _ = strip.set_bounds(tauri::Rect {
            position: tauri::Position::Logical(tauri::LogicalPosition::new(0.0, 0.0)),
            size: tauri::Size::Logical(tauri::LogicalSize::new(w, CHROME_H)),
        });
    }
    let mgr = app.state::<Arc<TabMgr>>();
    for label in mgr.labels() {
        if let Some(wv) = mgr.webview(&label) {
            let _ = wv.set_bounds(tauri::Rect {
                position: tauri::Position::Logical(tauri::LogicalPosition::new(0.0, CHROME_H)),
                size: tauri::Size::Logical(tauri::LogicalSize::new(w, (h - CHROME_H).max(120.0))),
            });
        }
    }
}
