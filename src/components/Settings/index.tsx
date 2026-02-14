import { useState, useEffect } from "react";
import {
  Folder,
  Clock,
  Bell,
  Moon,
  Sun,
  Monitor,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useConfig } from "@/hooks/useConfig";
import { open } from "@tauri-apps/plugin-dialog";
import type { ConflictResolution } from "@/lib/types";

interface SettingsProps {
  isDarkMode?: boolean;
  onDarkModeChange?: (value: boolean) => void;
}

export function Settings({ isDarkMode: propDarkMode, onDarkModeChange }: SettingsProps) {
  const { config, loading, updateConfig } = useConfig();
  const [watchFolder, setWatchFolder] = useState("");
  const [destRoot, setDestRoot] = useState("");
  const [gracePeriod, setGracePeriod] = useState(30);
  const [showNotifications, setShowNotifications] = useState(true);
  const [minimizeToTray, setMinimizeToTray] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [conflictResolution, setConflictResolution] =
    useState<ConflictResolution>("Rename");
  const [historyLimit, setHistoryLimit] = useState(100);
  const [hasChanges, setHasChanges] = useState(false);

  // Use prop or local state
  const isDarkMode = propDarkMode ?? darkMode;

  useEffect(() => {
    if (config) {
      setWatchFolder(config.watch_folder);
      setDestRoot(config.destination_root);
      setGracePeriod(config.grace_period_seconds);
      setShowNotifications(config.show_notifications);
      setMinimizeToTray(config.minimize_to_tray);
      setDarkMode(config.dark_mode);
      setConflictResolution(config.conflict_resolution);
      setHistoryLimit(config.history_limit);
    }
  }, [config]);

  useEffect(() => {
    if (config) {
      const changed =
        watchFolder !== config.watch_folder ||
        destRoot !== config.destination_root ||
        gracePeriod !== config.grace_period_seconds ||
        showNotifications !== config.show_notifications ||
        minimizeToTray !== config.minimize_to_tray ||
        darkMode !== config.dark_mode ||
        conflictResolution !== config.conflict_resolution ||
        historyLimit !== config.history_limit;
      setHasChanges(changed);
    }
  }, [
    config,
    watchFolder,
    destRoot,
    gracePeriod,
    showNotifications,
    minimizeToTray,
    darkMode,
    conflictResolution,
    historyLimit,
  ]);

  // Notify parent of dark mode changes immediately for live preview
  useEffect(() => {
    if (onDarkModeChange) {
      onDarkModeChange(darkMode);
    }
  }, [darkMode, onDarkModeChange]);

  const handleSelectFolder = async (type: "watch" | "dest") => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: type === "watch" ? "Select Watch Folder" : "Select Destination Root",
      });

      if (selected) {
        if (type === "watch") {
          setWatchFolder(selected as string);
        } else {
          setDestRoot(selected as string);
        }
      }
    } catch (err) {
      console.error("Failed to open folder picker:", err);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    const success = await updateConfig({
      watch_folder: watchFolder,
      destination_root: destRoot,
      grace_period_seconds: gracePeriod,
      show_notifications: showNotifications,
      minimize_to_tray: minimizeToTray,
      dark_mode: darkMode,
      conflict_resolution: conflictResolution,
      history_limit: historyLimit,
    });

    if (success) {
      setHasChanges(false);
    }
  };

  const cardBg = isDarkMode ? "bg-gray-900" : "bg-white";
  const borderColor = isDarkMode ? "border-white" : "border-black";
  const shadowStyle = isDarkMode 
    ? "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" 
    : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
  const textColor = isDarkMode ? "text-white" : "text-black";
  const textMuted = isDarkMode ? "text-white/70" : "text-black/70";
  const textFaint = isDarkMode ? "text-white/60" : "text-black/60";
  const inputBg = isDarkMode ? "bg-gray-800" : "bg-white";

  if (loading) {
    return (
      <div className={`p-6 flex items-center justify-center min-h-full ${isDarkMode ? "bg-gray-800" : "bg-main"}`}>
        <div className={`animate-spin h-8 w-8 border-2 ${borderColor} border-t-transparent`} />
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 min-h-full ${isDarkMode ? "bg-gray-800" : "bg-main"}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${textColor}`}>
            Settings
          </h2>
          <p className={`${textMuted} mt-1 font-semibold`}>
            Configure AutoSort behavior
          </p>
        </div>

        {hasChanges && (
          <button
            onClick={handleSave}
            className="px-4 py-2.5 font-bold border-2 border-black bg-lime-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-black"
          >
            Save Changes
          </button>
        )}
      </div>

      {/* Folders */}
      <div className={`${cardBg} border-2 ${borderColor} ${shadowStyle} p-6 space-y-4`}>
        <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
          <Folder className="w-5 h-5" />
          Folders
        </h3>

        <div>
          <label className={`block text-sm font-bold ${textColor} mb-1`}>
            Watch Folder
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={watchFolder}
              onChange={(e) => setWatchFolder(e.target.value)}
              className={`flex-1 px-4 py-2.5 font-medium border-2 ${borderColor} ${inputBg} ${isDarkMode ? "shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]" : "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"} focus:outline-none ${textColor}`}
              placeholder="Select folder to watch"
            />
            <button
              onClick={() => handleSelectFolder("watch")}
              className="px-4 py-2.5 font-bold border-2 border-black bg-cyan-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-black"
            >
              Browse
            </button>
          </div>
          <p className={`text-xs font-semibold ${textFaint} mt-1`}>
            New files in this folder will be automatically sorted
          </p>
        </div>

        <div>
          <label className={`block text-sm font-bold ${textColor} mb-1`}>
            Destination Root
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={destRoot}
              onChange={(e) => setDestRoot(e.target.value)}
              className={`flex-1 px-4 py-2.5 font-medium border-2 ${borderColor} ${inputBg} ${isDarkMode ? "shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]" : "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"} focus:outline-none ${textColor}`}
              placeholder="Select destination folder"
            />
            <button
              onClick={() => handleSelectFolder("dest")}
              className="px-4 py-2.5 font-bold border-2 border-black bg-cyan-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all text-black"
            >
              Browse
            </button>
          </div>
          <p className={`text-xs font-semibold ${textFaint} mt-1`}>
            Sorted files will be moved to subfolders within this directory
          </p>
        </div>
      </div>

      {/* Timing */}
      <div className={`${cardBg} border-2 ${borderColor} ${shadowStyle} p-6 space-y-4`}>
        <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
          <Clock className="w-5 h-5" />
          Timing
        </h3>

        <div>
          <label className={`block text-sm font-bold ${textColor} mb-1`}>
            Grace Period: {gracePeriod} seconds
          </label>
          <input
            type="range"
            min="0"
            max="300"
            step="5"
            value={gracePeriod}
            onChange={(e) => setGracePeriod(parseInt(e.target.value))}
            className={`w-full ${isDarkMode ? "accent-white" : "accent-black"}`}
          />
          <div className={`flex justify-between text-xs font-semibold ${textFaint} mt-1`}>
            <span>Instant</span>
            <span>5 minutes</span>
          </div>
          <p className={`text-xs font-semibold ${textFaint} mt-2`}>
            Time to wait before moving files. Set to 0 for instant sorting.
          </p>
        </div>
      </div>

      {/* Conflict Resolution */}
      <div className={`${cardBg} border-2 ${borderColor} ${shadowStyle} p-6 space-y-4`}>
        <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
          <AlertTriangle className="w-5 h-5" />
          Conflict Resolution
        </h3>

        <div>
          <label className={`block text-sm font-bold ${textColor} mb-2`}>
            When a file with the same name exists:
          </label>
          <div className="space-y-2">
            {[
              { value: "Rename", label: "Rename (add number)", desc: "file.pdf → file (1).pdf" },
              { value: "Skip", label: "Skip", desc: "Don't move the file" },
              { value: "Overwrite", label: "Overwrite", desc: "Replace existing file" },
            ].map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-3 border-2 cursor-pointer transition-all ${
                  conflictResolution === option.value
                    ? "border-black bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    : `${isDarkMode ? "border-white/30 hover:bg-gray-700" : "border-black/30 hover:bg-main"}`
                }`}
              >
                <input
                  type="radio"
                  name="conflict"
                  value={option.value}
                  checked={conflictResolution === option.value}
                  onChange={(e) =>
                    setConflictResolution(e.target.value as ConflictResolution)
                  }
                  className="sr-only"
                />
                <div>
                  <p className={conflictResolution === option.value ? "font-bold text-black" : `font-bold ${textColor}`}>
                    {option.label}
                  </p>
                  <p className={conflictResolution === option.value ? "text-sm font-semibold text-black/70" : `text-sm font-semibold ${textMuted}`}>
                    {option.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className={`${cardBg} border-2 ${borderColor} ${shadowStyle} p-6 space-y-4`}>
        <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
          <Monitor className="w-5 h-5" />
          Appearance
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className={`font-bold ${textColor}`}>
              Dark Mode
            </p>
            <p className={`text-sm font-semibold ${textMuted}`}>
              Use dark theme for the interface
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2.5 border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
              darkMode
                ? "bg-violet-300"
                : "bg-orange-200"
            }`}
          >
            {darkMode ? (
              <Moon className="w-5 h-5 text-black" />
            ) : (
              <Sun className="w-5 h-5 text-black" />
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className={`${cardBg} border-2 ${borderColor} ${shadowStyle} p-6 space-y-4`}>
        <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
          <Bell className="w-5 h-5" />
          Notifications
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className={`font-bold ${textColor}`}>
              Show Notifications
            </p>
            <p className={`text-sm font-semibold ${textMuted}`}>
              Display system notifications when files are sorted
            </p>
          </div>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative w-14 h-7 border-2 border-black transition-colors ${
              showNotifications ? "bg-lime-300" : isDarkMode ? "bg-gray-700" : "bg-main"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-black transition-transform ${
                showNotifications ? "left-8" : "left-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className={`font-bold ${textColor}`}>
              Minimize to Tray
            </p>
            <p className={`text-sm font-semibold ${textMuted}`}>
              Keep running in system tray when window is closed
            </p>
          </div>
          <button
            onClick={() => setMinimizeToTray(!minimizeToTray)}
            className={`relative w-14 h-7 border-2 border-black transition-colors ${
              minimizeToTray ? "bg-lime-300" : isDarkMode ? "bg-gray-700" : "bg-main"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-black transition-transform ${
                minimizeToTray ? "left-8" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* History */}
      <div className={`${cardBg} border-2 ${borderColor} ${shadowStyle} p-6 space-y-4`}>
        <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
          <RefreshCw className="w-5 h-5" />
          History
        </h3>

        <div>
          <label className={`block text-sm font-bold ${textColor} mb-1`}>
            History Limit: {historyLimit} records
          </label>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={historyLimit}
            onChange={(e) => setHistoryLimit(parseInt(e.target.value))}
            className={`w-full ${isDarkMode ? "accent-white" : "accent-black"}`}
          />
          <p className={`text-xs font-semibold ${textFaint} mt-1`}>
            Maximum number of move records to keep for undo functionality
          </p>
        </div>
      </div>
    </div>
  );
}
