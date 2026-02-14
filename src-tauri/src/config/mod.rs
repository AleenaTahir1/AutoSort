pub mod schema;

use schema::Config;
use std::fs;
use std::path::PathBuf;

pub fn get_config_path() -> PathBuf {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("autosort");
    
    fs::create_dir_all(&config_dir).ok();
    config_dir.join("config.json")
}

pub fn load_config() -> Config {
    let path = get_config_path();
    
    if path.exists() {
        match fs::read_to_string(&path) {
            Ok(content) => {
                match serde_json::from_str(&content) {
                    Ok(config) => return config,
                    Err(e) => {
                        log::error!("Failed to parse config: {}", e);
                    }
                }
            }
            Err(e) => {
                log::error!("Failed to read config: {}", e);
            }
        }
    }
    
    let config = Config::default();
    save_config(&config).ok();
    config
}

pub fn save_config(config: &Config) -> Result<(), String> {
    let path = get_config_path();
    
    let content = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    fs::write(&path, content)
        .map_err(|e| format!("Failed to write config: {}", e))?;
    
    Ok(())
}
