use std::fs;
use std::path::{Path, PathBuf};
use crate::config::schema::ConflictResolution;

pub struct MoveResult {
    pub source: PathBuf,
    pub destination: PathBuf,
    pub success: bool,
    pub error: Option<String>,
}

pub fn move_file(
    source: &Path,
    destination_root: &Path,
    destination_folder: &str,
    conflict_resolution: &ConflictResolution,
) -> MoveResult {
    let dest_dir = destination_root.join(destination_folder);
    
    // Create destination directory if it doesn't exist
    if let Err(e) = fs::create_dir_all(&dest_dir) {
        return MoveResult {
            source: source.to_path_buf(),
            destination: dest_dir,
            success: false,
            error: Some(format!("Failed to create directory: {}", e)),
        };
    }
    
    let file_name = source.file_name().unwrap_or_default();
    let mut dest_path = dest_dir.join(file_name);
    
    // Handle conflicts
    if dest_path.exists() {
        match conflict_resolution {
            ConflictResolution::Skip => {
                return MoveResult {
                    source: source.to_path_buf(),
                    destination: dest_path,
                    success: false,
                    error: Some("File already exists, skipped".to_string()),
                };
            }
            ConflictResolution::Rename => {
                dest_path = get_unique_path(&dest_path);
            }
            ConflictResolution::Overwrite => {
                // Will overwrite
            }
            ConflictResolution::Ask => {
                // For now, default to rename
                dest_path = get_unique_path(&dest_path);
            }
        }
    }
    
    // Perform the move
    match fs::rename(source, &dest_path) {
        Ok(_) => MoveResult {
            source: source.to_path_buf(),
            destination: dest_path,
            success: true,
            error: None,
        },
        Err(e) => {
            // Try copy + delete if rename fails (cross-device move)
            match fs::copy(source, &dest_path) {
                Ok(_) => {
                    if let Err(del_err) = fs::remove_file(source) {
                        log::warn!("Failed to delete source after copy: {}", del_err);
                    }
                    MoveResult {
                        source: source.to_path_buf(),
                        destination: dest_path,
                        success: true,
                        error: None,
                    }
                }
                Err(copy_err) => MoveResult {
                    source: source.to_path_buf(),
                    destination: dest_path,
                    success: false,
                    error: Some(format!("Move failed: {}, Copy failed: {}", e, copy_err)),
                },
            }
        }
    }
}

pub fn undo_move(source: &Path, original_location: &Path) -> Result<(), String> {
    if !source.exists() {
        return Err("Source file no longer exists".to_string());
    }
    
    if original_location.exists() {
        return Err("Original location already has a file".to_string());
    }
    
    fs::rename(source, original_location)
        .map_err(|e| format!("Failed to restore file: {}", e))
}

fn get_unique_path(path: &Path) -> PathBuf {
    let parent = path.parent().unwrap_or(Path::new("."));
    let stem = path.file_stem().unwrap_or_default().to_str().unwrap_or("");
    let extension = path.extension().map(|e| e.to_str().unwrap_or("")).unwrap_or("");
    
    let mut counter = 1;
    loop {
        let new_name = if extension.is_empty() {
            format!("{} ({})", stem, counter)
        } else {
            format!("{} ({}).{}", stem, counter, extension)
        };
        
        let new_path = parent.join(new_name);
        if !new_path.exists() {
            return new_path;
        }
        counter += 1;
        
        if counter > 1000 {
            // Safety limit
            return parent.join(format!("{}_{}", uuid::Uuid::new_v4(), path.file_name().unwrap_or_default().to_str().unwrap_or("")));
        }
    }
}
