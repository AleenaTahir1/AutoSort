import { useState } from "react";
import { Play, Pause, RefreshCw, Power, HelpCircle, X, Check } from "lucide-react";
import { Stats } from "./Stats";
import { PendingFiles } from "./PendingFiles";
import { RecentActivity } from "./RecentActivity";
import { useWatcher } from "@/hooks/useWatcher";
import { useHistory } from "@/hooks/useHistory";

interface DashboardProps {
  isDarkMode?: boolean;
}

export function Dashboard({ isDarkMode }: DashboardProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const {
    status,
    pendingFiles,
    start,
    stop,
    pause,
    resume,
    scan,
    cancelPending,
    moveNow,
  } = useWatcher();

  const { records, stats, undo, clear } = useHistory();

  const handleScan = async () => {
    setIsScanning(true);
    setScanMessage(null);
    const beforeCount = pendingFiles.length;
    await scan();
    // Small delay to let state update
    setTimeout(() => {
      setIsScanning(false);
      // Check if any new files were added
      if (pendingFiles.length === beforeCount) {
        setScanMessage("No matching files found");
        setTimeout(() => setScanMessage(null), 3000);
      }
    }, 500);
  };

  const handleToggle = async () => {
    if (status.is_running) {
      if (status.is_paused) {
        await resume();
      } else {
        await pause();
      }
    } else {
      await start();
    }
  };

  const cardBg = isDarkMode ? "bg-gray-900" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-black";
  const borderColor = isDarkMode ? "border-white" : "border-black";
  const shadowStyle = isDarkMode 
    ? "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" 
    : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";

  return (
    <div className={`p-6 space-y-4 min-h-full ${isDarkMode ? "bg-gray-800" : "bg-main"}`}>
      {/* Header with Help button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className={`text-2xl font-bold ${textColor}`}>Dashboard</h2>
          <button
            onClick={() => setShowHelp(true)}
            className={`p-1.5 rounded-full transition-colors ${
              isDarkMode ? "hover:bg-gray-700 text-white/60" : "hover:bg-black/10 text-black/60"
            }`}
            title="How it works"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Scan feedback message */}
          {scanMessage && (
            <span className={`text-sm font-semibold px-3 py-1.5 border-2 border-black bg-yellow-200 flex items-center gap-2`}>
              <Check className="w-4 h-4" />
              {scanMessage}
            </span>
          )}
          
          <button
            onClick={handleScan}
            disabled={isScanning}
            className={`px-4 py-2.5 font-bold border-2 border-black bg-cyan-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-2 text-black ${isScanning ? "opacity-70" : ""}`}
            title="Find existing files and add to queue"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning..." : "Scan"}
          </button>

          {status.is_running && (
            <button
              onClick={handleToggle}
              className={`px-4 py-2.5 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-2 text-black ${
                status.is_paused ? "bg-lime-300" : "bg-orange-300"
              }`}
              title={status.is_paused ? "Resume" : "Pause"}
            >
              {status.is_paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {status.is_paused ? "Resume" : "Pause"}
            </button>
          )}

          <button
            onClick={status.is_running ? stop : start}
            className={`px-4 py-2.5 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-2 text-black ${
              status.is_running ? "bg-pink-300" : "bg-white"
            }`}
            title={status.is_running ? "Stop watching" : "Start watching"}
          >
            <Power className="w-4 h-4" />
            {status.is_running ? "Stop" : "Start"}
          </button>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b-2 border-black bg-cyan-300">
              <h3 className="text-lg font-bold text-black">How it works</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4 text-sm font-semibold text-black/80">
              <div>
                <p className="font-bold text-black mb-2">Quick Start</p>
                <ol className="list-decimal list-inside space-y-1.5">
                  <li><strong>Scan</strong> — Find existing files matching your rules</li>
                  <li>Files wait for grace period, then move automatically</li>
                  <li><strong>Start</strong> — Watch for new files continuously</li>
                </ol>
              </div>
              <div>
                <p className="font-bold text-black mb-2">Controls</p>
                <ul className="space-y-1">
                  <li><strong>Scan</strong> — One-time scan of folder</li>
                  <li><strong>Start/Stop</strong> — Toggle file watching</li>
                  <li><strong>Pause/Resume</strong> — Pause file moving</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status indicator - compact */}
      <div className={`${cardBg} border-2 ${borderColor} ${shadowStyle} px-4 py-3`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 border-2 ${borderColor} ${
              status.is_running
                ? status.is_paused
                  ? "bg-orange-300"
                  : "bg-lime-300 animate-pulse"
                : isDarkMode ? "bg-white/20" : "bg-black/20"
            }`}
          />
          <span className={`font-semibold text-sm ${textColor}`}>
            {status.is_running
              ? status.is_paused
                ? "Paused"
                : "Watching..."
              : "Not watching"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <Stats stats={stats} isDarkMode={isDarkMode} />

      {/* Spacer to push Pending down */}
      <div className="h-4" />

      {/* Pending Files */}
      <div>
        <h3 className={`text-base font-bold ${textColor} mb-2`}>
          Pending ({pendingFiles.length})
        </h3>
        <PendingFiles
          files={pendingFiles}
          onCancel={cancelPending}
          onMoveNow={moveNow}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity records={records} onUndo={undo} onClear={clear} isDarkMode={isDarkMode} />
    </div>
  );
}
