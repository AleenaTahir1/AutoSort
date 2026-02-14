use notify::{Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::mpsc::{channel, Receiver, Sender};
use std::time::Duration;
use parking_lot::RwLock;
use std::sync::Arc;
use chrono::Utc;
use uuid::Uuid;

use crate::config::schema::{Config as AppConfig, SortRule};
use crate::config::save_config as save_app_config;
use crate::engine::{match_file, move_file, History, MoveRecord};

#[derive(Debug, Clone, serde::Serialize)]
pub struct PendingFile {
    pub id: String,
    pub path: PathBuf,
    pub file_name: String,
    pub destination: String,
    pub rule_name: String,
    pub added_at: i64,
    pub move_at: i64,
    pub file_size: u64,
}

pub struct FileWatcher {
    watcher: Option<RecommendedWatcher>,
    pending_files: Arc<RwLock<HashMap<String, PendingFile>>>,
    history: Arc<History>,
    config: Arc<RwLock<AppConfig>>,
    is_running: Arc<RwLock<bool>>,
    is_paused: Arc<RwLock<bool>>,
}

impl FileWatcher {
    pub fn new(config: AppConfig, history: Arc<History>) -> Self {
        Self {
            watcher: None,
            pending_files: Arc::new(RwLock::new(HashMap::new())),
            history,
            config: Arc::new(RwLock::new(config)),
            is_running: Arc::new(RwLock::new(false)),
            is_paused: Arc::new(RwLock::new(false)),
        }
    }
    
    pub fn update_config(&self, config: AppConfig) {
        *self.config.write() = config;
    }
    
    pub fn start(&mut self) -> Result<(), String> {
        if *self.is_running.read() {
            return Ok(());
        }
        
        let config = self.config.read().clone();
        let watch_path = config.watch_folder.clone();
        
        if !watch_path.exists() {
            return Err(format!("Watch folder does not exist: {:?}", watch_path));
        }
        
        let pending_files = self.pending_files.clone();
        let app_config = self.config.clone();
        
        let (tx, rx): (Sender<Result<Event, notify::Error>>, Receiver<Result<Event, notify::Error>>) = channel();
        
        let mut watcher = RecommendedWatcher::new(
            move |res| {
                let _ = tx.send(res);
            },
            Config::default().with_poll_interval(Duration::from_secs(1)),
        ).map_err(|e| format!("Failed to create watcher: {}", e))?;
        
        watcher.watch(&watch_path, RecursiveMode::NonRecursive)
            .map_err(|e| format!("Failed to watch folder: {}", e))?;
        
        self.watcher = Some(watcher);
        *self.is_running.write() = true;
        
        // Spawn event handler thread
        let is_running = self.is_running.clone();
        let is_paused = self.is_paused.clone();
        
        std::thread::spawn(move || {
            while *is_running.read() {
                match rx.recv_timeout(Duration::from_millis(100)) {
                    Ok(Ok(event)) => {
                        if *is_paused.read() {
                            continue;
                        }
                        
                        for path in event.paths {
                            if path.is_file() && is_valid_file(&path) {
                                let config = app_config.read();
                                if let Some(rule) = match_file(&path, &config.rules) {
                                    add_pending_file(&pending_files, &path, rule, config.grace_period_seconds);
                                }
                            }
                        }
                    }
                    Ok(Err(e)) => {
                        log::error!("Watch error: {}", e);
                    }
                    Err(_) => {
                        // Timeout, continue loop
                    }
                }
            }
        });
        
        // Spawn grace period processor thread
        let pending_files = self.pending_files.clone();
        let app_config = self.config.clone();
        let history = self.history.clone();
        let is_running = self.is_running.clone();
        let is_paused = self.is_paused.clone();
        
        std::thread::spawn(move || {
            while *is_running.read() {
                if !*is_paused.read() {
                    process_pending_files(&pending_files, &app_config, &history);
                }
                std::thread::sleep(Duration::from_secs(1));
            }
        });
        
        log::info!("File watcher started for: {:?}", watch_path);
        Ok(())
    }
    
    pub fn stop(&mut self) {
        *self.is_running.write() = false;
        self.watcher = None;
        log::info!("File watcher stopped");
    }
    
    pub fn pause(&self) {
        *self.is_paused.write() = true;
    }
    
    pub fn resume(&self) {
        *self.is_paused.write() = false;
    }
    
    pub fn is_running(&self) -> bool {
        *self.is_running.read()
    }
    
    pub fn is_paused(&self) -> bool {
        *self.is_paused.read()
    }
    
    pub fn get_pending_files(&self) -> Vec<PendingFile> {
        self.pending_files.read().values().cloned().collect()
    }
    
    pub fn cancel_pending(&self, id: &str) -> bool {
        self.pending_files.write().remove(id).is_some()
    }
    
    pub fn move_now(&self, id: &str) -> Result<(), String> {
        let pending = {
            let mut files = self.pending_files.write();
            files.remove(id)
        };
        
        if let Some(pending) = pending {
            let config = self.config.read();
            let result = move_file(
                &pending.path,
                &config.destination_root,
                &pending.destination,
                &config.conflict_resolution,
            );
            
            if result.success {
                let record = MoveRecord {
                    id: Uuid::new_v4().to_string(),
                    original_path: result.source,
                    new_path: result.destination,
                    rule_name: pending.rule_name,
                    timestamp: Utc::now(),
                    file_size: pending.file_size,
                    can_undo: true,
                };
                self.history.add(record);
                {
                    let mut c = self.config.write();
                    c.total_files_moved = c.total_files_moved.saturating_add(1);
                    let to_save = c.clone();
                    drop(c);
                    let _ = save_app_config(&to_save);
                }
                Ok(())
            } else {
                Err(result.error.unwrap_or_else(|| "Unknown error".to_string()))
            }
        } else {
            Err("Pending file not found".to_string())
        }
    }
    
    pub fn scan_folder(&self) -> Vec<PendingFile> {
        let config = self.config.read();
        let mut added = Vec::new();
        
        if let Ok(entries) = std::fs::read_dir(&config.watch_folder) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_file() && is_valid_file(&path) {
                    if let Some(rule) = match_file(&path, &config.rules) {
                        if let Some(pending) = add_pending_file(&self.pending_files, &path, rule, config.grace_period_seconds) {
                            added.push(pending);
                        }
                    }
                }
            }
        }
        
        added
    }
}

fn is_valid_file(path: &Path) -> bool {
    let file_name = path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("");
    
    // Skip hidden files, temp files, and partial downloads
    !file_name.starts_with('.') &&
    !file_name.ends_with(".crdownload") &&
    !file_name.ends_with(".part") &&
    !file_name.ends_with(".tmp") &&
    !file_name.ends_with(".download")
}

fn add_pending_file(
    pending_files: &Arc<RwLock<HashMap<String, PendingFile>>>,
    path: &Path,
    rule: &SortRule,
    grace_period: u64,
) -> Option<PendingFile> {
    // Check if already pending
    {
        let files = pending_files.read();
        if files.values().any(|f| f.path == path) {
            return None;
        }
    }
    
    let now = Utc::now().timestamp();
    let file_size = path.metadata().map(|m| m.len()).unwrap_or(0);
    
    let pending = PendingFile {
        id: Uuid::new_v4().to_string(),
        path: path.to_path_buf(),
        file_name: path.file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string(),
        destination: rule.destination_folder.clone(),
        rule_name: rule.name.clone(),
        added_at: now,
        move_at: now + grace_period as i64,
        file_size,
    };
    
    let result = pending.clone();
    pending_files.write().insert(pending.id.clone(), pending);
    Some(result)
}

fn process_pending_files(
    pending_files: &Arc<RwLock<HashMap<String, PendingFile>>>,
    app_config: &Arc<RwLock<AppConfig>>,
    history: &Arc<History>,
) {
    let now = Utc::now().timestamp();
    let config = app_config.read();
    
    let to_move: Vec<PendingFile> = {
        let files = pending_files.read();
        files.values()
            .filter(|f| f.move_at <= now)
            .cloned()
            .collect()
    };
    
    for pending in to_move {
        // Remove from pending
        pending_files.write().remove(&pending.id);
        
        // Check if file still exists
        if !pending.path.exists() {
            continue;
        }
        
        let result = move_file(
            &pending.path,
            &config.destination_root,
            &pending.destination,
            &config.conflict_resolution,
        );
        
        if result.success {
            let record = MoveRecord {
                id: Uuid::new_v4().to_string(),
                original_path: result.source,
                new_path: result.destination,
                rule_name: pending.rule_name,
                timestamp: Utc::now(),
                file_size: pending.file_size,
                can_undo: true,
            };
            history.add(record);
            {
                let mut c = app_config.write();
                c.total_files_moved = c.total_files_moved.saturating_add(1);
                let to_save = c.clone();
                drop(c);
                let _ = crate::config::save_config(&to_save);
            }
            log::info!("Moved file: {} -> {}", pending.file_name, pending.destination);
        } else {
            log::error!("Failed to move file: {} - {:?}", pending.file_name, result.error);
        }
    }
}
