//! SQLite persistence: history, bookmarks, theme, session (open tabs).

use std::path::PathBuf;
use std::sync::Arc;

use parking_lot::Mutex;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tauri::Manager;

#[derive(Serialize, Deserialize, Clone)]
pub struct HistoryEntry {
    pub url: String,
    pub title: String,
    pub at: i64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Bookmark {
    pub url: String,
    pub title: String,
    pub at: i64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TabSave {
    pub id: String,
    pub url: String,
    pub title: String,
}

#[derive(Serialize, Clone)]
pub struct SessionState {
    pub history: Vec<HistoryEntry>,
    pub bookmarks: Vec<Bookmark>,
    pub tabs: Vec<TabSave>,
    #[serde(rename = "activeId")]
    pub active_id: Option<String>,
    pub theme: String,
}

pub struct Store {
    conn: Mutex<Connection>,
}

fn app_data_dir(app: &tauri::AppHandle) -> PathBuf {
    app.path()
        .app_data_dir()
        .unwrap_or_else(|_| std::env::temp_dir())
}

impl Store {
    /// open against the real on-disk location (called once in setup)
    pub fn open(app: &tauri::AppHandle) -> Arc<Self> {
        let dir = app_data_dir(app);
        let _ = std::fs::create_dir_all(&dir);
        let path = dir.join("vela.db");
        let conn = Connection::open(&path).expect("open vela.db");
        Self::migrated(Self {
            conn: Mutex::new(conn),
        })
    }

    fn migrated(self) -> Arc<Self> {
        {
            let conn = self.conn.lock();
            conn.execute_batch(
                "CREATE TABLE IF NOT EXISTS history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT NOT NULL, title TEXT NOT NULL, at INTEGER NOT NULL);
                 CREATE INDEX IF NOT EXISTS idx_history_at ON history(at DESC);
                 CREATE TABLE IF NOT EXISTS bookmarks (
                    url TEXT PRIMARY KEY, title TEXT NOT NULL, at INTEGER NOT NULL);
                 CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL);",
            )
            .expect("migrate vela.db");
        }
        Arc::new(self)
    }

    pub fn add_history(&self, url: &str, title: &str, at: i64) {
        let _ = self.conn.lock().execute(
            "INSERT INTO history (url, title, at) VALUES (?1, ?2, ?3)",
            rusqlite::params![url, title, at],
        );
    }

    pub fn clear_history(&self) {
        let _ = self.conn.lock().execute("DELETE FROM history", []);
    }

    pub fn history(&self, limit: i64) -> Vec<HistoryEntry> {
        let conn = self.conn.lock();
        let Ok(mut stmt) =
            conn.prepare("SELECT url, title, at FROM history ORDER BY at DESC, id DESC LIMIT ?1")
        else {
            return vec![];
        };
        stmt.query_map(rusqlite::params![limit], |row| {
            Ok(HistoryEntry {
                url: row.get(0)?,
                title: row.get(1)?,
                at: row.get(2)?,
            })
        })
        .map(|rows| rows.filter_map(Result::ok).collect())
        .unwrap_or_default()
    }

    pub fn add_bookmark(&self, b: &Bookmark) {
        let _ = self.conn.lock().execute(
            "INSERT INTO bookmarks (url, title, at) VALUES (?1, ?2, ?3)
             ON CONFLICT(url) DO UPDATE SET title=excluded.title, at=excluded.at",
            rusqlite::params![b.url, b.title, b.at],
        );
    }

    pub fn remove_bookmark(&self, url: &str) {
        let _ = self.conn.lock().execute(
            "DELETE FROM bookmarks WHERE url = ?1",
            rusqlite::params![url],
        );
    }

    pub fn bookmarks(&self) -> Vec<Bookmark> {
        let conn = self.conn.lock();
        let Ok(mut stmt) = conn.prepare("SELECT url, title, at FROM bookmarks ORDER BY at DESC")
        else {
            return vec![];
        };
        stmt.query_map([], |row| {
            Ok(Bookmark {
                url: row.get(0)?,
                title: row.get(1)?,
                at: row.get(2)?,
            })
        })
        .map(|rows| rows.filter_map(Result::ok).collect())
        .unwrap_or_default()
    }

    pub fn set_kv(&self, k: &str, v: &str) {
        let _ = self.conn.lock().execute(
            "INSERT INTO kv (k, v) VALUES (?1, ?2)
             ON CONFLICT(k) DO UPDATE SET v=excluded.v",
            rusqlite::params![k, v],
        );
    }

    pub fn get_kv(&self, k: &str) -> Option<String> {
        let conn = self.conn.lock();
        conn.query_row(
            "SELECT v FROM kv WHERE k = ?1",
            rusqlite::params![k],
            |row| row.get(0),
        )
        .ok()
    }

    pub fn save_session(&self, tabs: &[TabSave], active: Option<&str>) {
        if let Ok(json) = serde_json::to_string(tabs) {
            self.set_kv("session_tabs", &json);
        }
        self.set_kv("session_active", active.unwrap_or(""));
    }

    pub fn restore_session(&self) -> SessionState {
        let tabs: Vec<TabSave> = self
            .get_kv("session_tabs")
            .and_then(|j| serde_json::from_str(&j).ok())
            .unwrap_or_default();
        let active_raw = self.get_kv("session_active").unwrap_or_default();
        SessionState {
            history: self.history(500),
            bookmarks: self.bookmarks(),
            tabs,
            active_id: if active_raw.is_empty() {
                None
            } else {
                Some(active_raw)
            },
            theme: self.get_kv("theme").unwrap_or_else(|| "light".into()),
        }
    }
}
