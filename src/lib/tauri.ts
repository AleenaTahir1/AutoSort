import { invoke } from "@tauri-apps/api/core";
import type {
  Config,
  SortRule,
  PendingFile,
  MoveRecord,
  HistoryStats,
  WatcherStatus,
} from "./types";

// Config commands
export const getConfig = () => invoke<Config>("get_config");
export const saveConfig = (config: Config) =>
  invoke<void>("save_app_config", { config });

// Watcher commands
export const startWatcher = () => invoke<void>("start_watcher");
export const stopWatcher = () => invoke<void>("stop_watcher");
export const pauseWatcher = () => invoke<void>("pause_watcher");
export const resumeWatcher = () => invoke<void>("resume_watcher");
export const getWatcherStatus = () => invoke<WatcherStatus>("get_watcher_status");

// Pending files commands
export const getPendingFiles = () => invoke<PendingFile[]>("get_pending_files");
export const cancelPendingFile = (id: string) =>
  invoke<boolean>("cancel_pending_file", { id });
export const moveFileNow = (id: string) => invoke<void>("move_file_now", { id });
export const scanFolder = () => invoke<PendingFile[]>("scan_folder");

// History commands
export const getHistory = () => invoke<MoveRecord[]>("get_history");
export const getRecentHistory = (count: number) =>
  invoke<MoveRecord[]>("get_recent_history", { count });
export const getHistoryStats = () => invoke<HistoryStats>("get_history_stats");
export const undoFileMove = (id: string) => invoke<void>("undo_file_move", { id });
export const clearHistory = () => invoke<void>("clear_history");

// Rules commands
export const getRules = () => invoke<SortRule[]>("get_rules");
export const addRule = (rule: SortRule) => invoke<void>("add_rule", { rule });
export const updateRule = (rule: SortRule) => invoke<void>("update_rule", { rule });
export const deleteRule = (id: string) => invoke<void>("delete_rule", { id });
export const reorderRules = (ruleIds: string[]) =>
  invoke<void>("reorder_rules", { ruleIds });
export const testRule = (filename: string, rules: SortRule[]) =>
  invoke<string | null>("test_rule", { filename, rules });

// Utility commands
export const getDefaultDownloadsFolder = () =>
  invoke<string | null>("get_default_downloads_folder");
export const folderExists = (path: string) =>
  invoke<boolean>("folder_exists", { path });
