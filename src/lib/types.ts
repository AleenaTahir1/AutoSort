export interface Config {
  watch_folder: string;
  destination_root: string;
  grace_period_seconds: number;
  rules: SortRule[];
  run_on_startup: boolean;
  minimize_to_tray: boolean;
  show_notifications: boolean;
  dark_mode: boolean;
  conflict_resolution: ConflictResolution;
  history_limit: number;
  /** All-time count of files moved (persisted) */
  total_files_moved?: number;
}

export interface SortRule {
  id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: Condition[];
  destination_folder: string;
  is_default: boolean;
}

export type Condition =
  | { type: "Extension"; value: string[] }
  | { type: "NameContains"; value: string }
  | { type: "NameRegex"; value: string }
  | { type: "SizeGreaterThan"; value: number }
  | { type: "SizeLessThan"; value: number };

export type ConflictResolution = "Rename" | "Skip" | "Overwrite" | "Ask";

export interface PendingFile {
  id: string;
  path: string;
  file_name: string;
  destination: string;
  rule_name: string;
  added_at: number;
  move_at: number;
  file_size: number;
}

export interface MoveRecord {
  id: string;
  original_path: string;
  new_path: string;
  rule_name: string;
  timestamp: string;
  file_size: number;
  can_undo: boolean;
}

export interface HistoryStats {
  total: number;
  today: number;
  this_week: number;
}

export interface WatcherStatus {
  is_running: boolean;
  is_paused: boolean;
}
