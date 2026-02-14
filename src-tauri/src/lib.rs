pub mod commands;
pub mod config;
pub mod engine;
pub mod watcher;

use commands::AppState;
use config::load_config;
use engine::History;
use watcher::FileWatcher;
use parking_lot::Mutex;
use std::sync::Arc;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let config = load_config();
            let history = Arc::new(History::new(config.history_limit));
            let watcher = FileWatcher::new(config, history.clone());
            
            app.manage(AppState {
                watcher: Mutex::new(watcher),
                history,
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_config,
            commands::save_app_config,
            commands::start_watcher,
            commands::stop_watcher,
            commands::pause_watcher,
            commands::resume_watcher,
            commands::get_watcher_status,
            commands::get_pending_files,
            commands::cancel_pending_file,
            commands::move_file_now,
            commands::scan_folder,
            commands::get_history,
            commands::get_recent_history,
            commands::get_history_stats,
            commands::undo_file_move,
            commands::clear_history,
            commands::get_rules,
            commands::add_rule,
            commands::update_rule,
            commands::delete_rule,
            commands::reorder_rules,
            commands::test_rule,
            commands::get_default_downloads_folder,
            commands::folder_exists,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
