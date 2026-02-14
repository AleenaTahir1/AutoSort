use crate::config::schema::{Config, SortRule};
use crate::config::{load_config, save_config};
use crate::engine::{History, MoveRecord, HistoryStats, undo_move};
use crate::watcher::{FileWatcher, PendingFile};
use parking_lot::Mutex;
use std::sync::Arc;
use tauri::State;

pub struct AppState {
    pub watcher: Mutex<FileWatcher>,
    pub history: Arc<History>,
}

#[tauri::command]
pub fn get_config(_state: State<AppState>) -> Config {
    load_config()
}

#[tauri::command]
pub fn save_app_config(config: Config, state: State<AppState>) -> Result<(), String> {
    save_config(&config)?;
    state.watcher.lock().update_config(config);
    Ok(())
}

#[tauri::command]
pub fn start_watcher(state: State<AppState>) -> Result<(), String> {
    state.watcher.lock().start()
}

#[tauri::command]
pub fn stop_watcher(state: State<AppState>) -> Result<(), String> {
    state.watcher.lock().stop();
    Ok(())
}

#[tauri::command]
pub fn pause_watcher(state: State<AppState>) -> Result<(), String> {
    state.watcher.lock().pause();
    Ok(())
}

#[tauri::command]
pub fn resume_watcher(state: State<AppState>) -> Result<(), String> {
    state.watcher.lock().resume();
    Ok(())
}

#[tauri::command]
pub fn get_watcher_status(state: State<AppState>) -> WatcherStatus {
    let watcher = state.watcher.lock();
    WatcherStatus {
        is_running: watcher.is_running(),
        is_paused: watcher.is_paused(),
    }
}

#[derive(serde::Serialize)]
pub struct WatcherStatus {
    pub is_running: bool,
    pub is_paused: bool,
}

#[tauri::command]
pub fn get_pending_files(state: State<AppState>) -> Vec<PendingFile> {
    state.watcher.lock().get_pending_files()
}

#[tauri::command]
pub fn cancel_pending_file(id: String, state: State<AppState>) -> bool {
    state.watcher.lock().cancel_pending(&id)
}

#[tauri::command]
pub fn move_file_now(id: String, state: State<AppState>) -> Result<(), String> {
    state.watcher.lock().move_now(&id)
}

#[tauri::command]
pub fn scan_folder(state: State<AppState>) -> Vec<PendingFile> {
    state.watcher.lock().scan_folder()
}

#[tauri::command]
pub fn get_history(state: State<AppState>) -> Vec<MoveRecord> {
    state.history.get_all()
}

#[tauri::command]
pub fn get_recent_history(count: usize, state: State<AppState>) -> Vec<MoveRecord> {
    state.history.get_recent(count)
}

#[tauri::command]
pub fn get_history_stats(state: State<AppState>) -> HistoryStats {
    let config = load_config();
    let from_history = state.history.stats();
    HistoryStats {
        total: config.total_files_moved as usize,
        today: from_history.today,
        this_week: from_history.this_week,
    }
}

#[tauri::command]
pub fn undo_file_move(id: String, state: State<AppState>) -> Result<(), String> {
    let record = state.history.find(&id)
        .ok_or_else(|| "Record not found".to_string())?;
    
    if !record.can_undo {
        return Err("This move has already been undone".to_string());
    }
    
    undo_move(&record.new_path, &record.original_path)?;
    state.history.mark_undone(&id);
    Ok(())
}

#[tauri::command]
pub fn clear_history(state: State<AppState>) -> Result<(), String> {
    state.history.clear();
    Ok(())
}

#[tauri::command]
pub fn get_rules() -> Vec<SortRule> {
    load_config().rules
}

#[tauri::command]
pub fn add_rule(rule: SortRule, state: State<AppState>) -> Result<(), String> {
    let mut config = load_config();
    config.rules.push(rule);
    save_config(&config)?;
    state.watcher.lock().update_config(config);
    Ok(())
}

#[tauri::command]
pub fn update_rule(rule: SortRule, state: State<AppState>) -> Result<(), String> {
    let mut config = load_config();
    if let Some(existing) = config.rules.iter_mut().find(|r| r.id == rule.id) {
        *existing = rule;
        save_config(&config)?;
        state.watcher.lock().update_config(config);
        Ok(())
    } else {
        Err("Rule not found".to_string())
    }
}

#[tauri::command]
pub fn delete_rule(id: String, state: State<AppState>) -> Result<(), String> {
    let mut config = load_config();
    let original_len = config.rules.len();
    config.rules.retain(|r| r.id != id);
    
    if config.rules.len() < original_len {
        save_config(&config)?;
        state.watcher.lock().update_config(config);
        Ok(())
    } else {
        Err("Rule not found".to_string())
    }
}

#[tauri::command]
pub fn reorder_rules(rule_ids: Vec<String>, state: State<AppState>) -> Result<(), String> {
    let mut config = load_config();
    
    // Create a new priority based on order
    for (index, id) in rule_ids.iter().enumerate() {
        if let Some(rule) = config.rules.iter_mut().find(|r| r.id == *id) {
            rule.priority = (rule_ids.len() - index) as i32 * 10;
        }
    }
    
    save_config(&config)?;
    state.watcher.lock().update_config(config);
    Ok(())
}

#[tauri::command]
pub fn test_rule(filename: String, rules: Vec<SortRule>) -> Option<String> {
    use crate::engine::match_file;
    use std::path::Path;
    
    let path = Path::new(&filename);
    match_file(path, &rules).map(|r| r.destination_folder.clone())
}

#[tauri::command]
pub fn get_default_downloads_folder() -> Option<String> {
    dirs::download_dir().map(|p| p.to_string_lossy().to_string())
}

#[tauri::command]
pub fn folder_exists(path: String) -> bool {
    std::path::Path::new(&path).is_dir()
}
