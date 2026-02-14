use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
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

pub struct History {
    records: RwLock<VecDeque<MoveRecord>>,
    limit: usize,
}

impl History {
    pub fn new(limit: usize) -> Self {
        Self {
            records: RwLock::new(VecDeque::with_capacity(limit)),
            limit,
        }
    }
    
    pub fn add(&self, record: MoveRecord) {
        let mut records = self.records.write();
        
        if records.len() >= self.limit {
            records.pop_back();
        }
        
        records.push_front(record);
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
    }
    
    pub fn clear(&self) {
        self.records.write().clear();
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
