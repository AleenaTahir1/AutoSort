use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::fs;
use std::path::PathBuf;
use parking_lot::RwLock;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoveRecord {
    pub id: String,
    pub original_path: PathBuf,
    pub new_path: PathBuf,
    pub rule_name: String,
    pub timestamp: DateTime<Utc>,
    pub file_size: u64,
    pub can_undo: bool,
}

fn get_history_path() -> PathBuf {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("autosort");
    fs::create_dir_all(&config_dir).ok();
    config_dir.join("history.json")
}

fn load_history_from_disk(limit: usize) -> VecDeque<MoveRecord> {
    let path = get_history_path();
    if path.exists() {
        match fs::read_to_string(&path) {
            Ok(content) => {
                match serde_json::from_str::<Vec<MoveRecord>>(&content) {
                    Ok(records) => {
                        let mut deque: VecDeque<MoveRecord> = records.into_iter().take(limit).collect();
                        deque.truncate(limit);
                        return deque;
                    }
                    Err(e) => {
                        log::error!("Failed to parse history: {}", e);
                    }
                }
            }
            Err(e) => {
                log::error!("Failed to read history: {}", e);
            }
        }
    }
    VecDeque::with_capacity(limit)
}

fn save_history_to_disk(records: &VecDeque<MoveRecord>) {
    let path = get_history_path();
    let vec: Vec<&MoveRecord> = records.iter().collect();
    match serde_json::to_string_pretty(&vec) {
        Ok(content) => {
            if let Err(e) = fs::write(&path, content) {
                log::error!("Failed to write history: {}", e);
            }
        }
        Err(e) => {
            log::error!("Failed to serialize history: {}", e);
        }
    }
}

pub struct History {
    records: RwLock<VecDeque<MoveRecord>>,
    limit: usize,
}

impl History {
    pub fn new(limit: usize) -> Self {
        let records = load_history_from_disk(limit);
        Self {
            records: RwLock::new(records),
            limit,
        }
    }
    
    pub fn add(&self, record: MoveRecord) {
        let mut records = self.records.write();
        
        if records.len() >= self.limit {
            records.pop_back();
        }
        
        records.push_front(record);
        save_history_to_disk(&records);
    }
    
    pub fn get_all(&self) -> Vec<MoveRecord> {
        self.records.read().iter().cloned().collect()
    }
    
    pub fn get_recent(&self, count: usize) -> Vec<MoveRecord> {
        self.records.read().iter().take(count).cloned().collect()
    }
    
    pub fn find(&self, id: &str) -> Option<MoveRecord> {
        self.records.read().iter().find(|r| r.id == id).cloned()
    }
    
    pub fn mark_undone(&self, id: &str) {
        let mut records = self.records.write();
        if let Some(record) = records.iter_mut().find(|r| r.id == id) {
            record.can_undo = false;
        }
        save_history_to_disk(&records);
    }
    
    pub fn clear(&self) {
        let mut records = self.records.write();
        records.clear();
        save_history_to_disk(&records);
    }
    
    pub fn stats(&self) -> HistoryStats {
        let records = self.records.read();
        let now = Utc::now();
        let today_start = now.date_naive().and_hms_opt(0, 0, 0).unwrap();
        let week_start = now - chrono::Duration::days(7);
        
        let today_count = records.iter()
            .filter(|r| r.timestamp.naive_utc() >= today_start)
            .count();
        
        let week_count = records.iter()
            .filter(|r| r.timestamp >= week_start)
            .count();
        
        HistoryStats {
            total: records.len(),
            today: today_count,
            this_week: week_count,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryStats {
    pub total: usize,
    pub today: usize,
    pub this_week: usize,
}
