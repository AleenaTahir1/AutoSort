use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub watch_folder: PathBuf,
    pub destination_root: PathBuf,
    pub grace_period_seconds: u64,
    pub rules: Vec<SortRule>,
    pub run_on_startup: bool,
    pub minimize_to_tray: bool,
    pub show_notifications: bool,
    pub dark_mode: bool,
    pub conflict_resolution: ConflictResolution,
    pub history_limit: usize,
    /// All-time count of files moved (persisted, not capped by history_limit)
    #[serde(default)]
    pub total_files_moved: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SortRule {
    pub id: String,
    pub name: String,
    pub enabled: bool,
    pub priority: i32,
    pub conditions: Vec<Condition>,
    pub destination_folder: String,
    pub is_default: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
pub enum Condition {
    Extension(Vec<String>),
    NameContains(String),
    NameRegex(String),
    SizeGreaterThan(u64),
    SizeLessThan(u64),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ConflictResolution {
    Rename,
    Skip,
    Overwrite,
    Ask,
}

impl Default for Config {
    fn default() -> Self {
        let downloads = dirs::download_dir().unwrap_or_else(|| PathBuf::from("."));
        
        Self {
            watch_folder: downloads.clone(),
            destination_root: downloads,
            grace_period_seconds: 5,
            rules: default_rules(),
            run_on_startup: false,
            minimize_to_tray: true,
            show_notifications: true,
            dark_mode: false,
            conflict_resolution: ConflictResolution::Rename,
            history_limit: 500,
            total_files_moved: 0,
        }
    }
}

impl SortRule {
    pub fn new(name: &str, extensions: Vec<&str>, destination: &str, priority: i32) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            enabled: true,
            priority,
            conditions: vec![Condition::Extension(
                extensions.into_iter().map(String::from).collect(),
            )],
            destination_folder: destination.to_string(),
            is_default: true,
        }
    }
}

pub fn default_rules() -> Vec<SortRule> {
    vec![
        SortRule::new(
            "Images",
            vec!["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "tiff", "raw", "heic"],
            "Images",
            100,
        ),
        SortRule::new(
            "Documents",
            vec!["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "odt", "ods", "odp", "csv", "epub"],
            "Documents",
            90,
        ),
        SortRule::new(
            "Installers",
            vec!["exe", "msi", "dmg", "pkg", "deb", "rpm", "appimage", "snap"],
            "Installers",
            80,
        ),
        SortRule::new(
            "Archives",
            vec!["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tgz"],
            "Archives",
            70,
        ),
        SortRule::new(
            "Audio",
            vec!["mp3", "wav", "flac", "aac", "ogg", "m4a", "wma", "opus"],
            "Audio",
            60,
        ),
        SortRule::new(
            "Video",
            vec!["mp4", "mkv", "avi", "mov", "wmv", "webm", "flv", "m4v"],
            "Video",
            50,
        ),
        SortRule::new(
            "Code",
            vec!["js", "ts", "jsx", "tsx", "py", "rs", "go", "java", "cpp", "c", "h", "hpp", "cs", "rb", "php", "swift", "kt"],
            "Code",
            40,
        ),
    ]
}
