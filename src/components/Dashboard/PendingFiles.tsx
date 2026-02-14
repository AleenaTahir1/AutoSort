import { useState, useEffect } from "react";
import { X, Play, Clock, FolderOpen, Loader2 } from "lucide-react";
import { FileIcon } from "@/components/common/FileIcon";
import type { PendingFile } from "@/lib/types";

interface PendingFilesProps {
  files: PendingFile[];
  onCancel: (id: string) => void;
  onMoveNow: (id: string) => void;
  isDarkMode?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function PendingFileCard({
  file,
  onCancel,
  onMoveNow,
  isDarkMode,
}: {
  file: PendingFile;
  onCancel: () => void;
  onMoveNow: () => void;
  isDarkMode?: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, file.move_at - now);
      setTimeLeft(remaining);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [file.move_at]);

  const totalDuration = file.move_at - file.added_at;
  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 100;
  const isMovedOrMoving = timeLeft <= 0;

  const cardBg = isDarkMode ? "bg-gray-900" : "bg-white";
  const borderColor = isDarkMode ? "border-white" : "border-black";
  const shadowStyle = isDarkMode 
    ? "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" 
    : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
  const textColor = isDarkMode ? "text-white" : "text-black";
  const textMuted = isDarkMode ? "text-white/70" : "text-black/70";

  return (
    <div className={`${cardBg} border-2 ${borderColor} ${shadowStyle} p-4 relative overflow-hidden`}>
      {/* Progress bar - neo-brutalism */}
      <div
        className={`absolute bottom-0 left-0 h-1.5 bg-lime-300 transition-all duration-1000 border-t-2 ${borderColor}`}
        style={{ width: `${progress}%` }}
      />

      <div className="flex items-center gap-4">
        <FileIcon filename={file.file_name} className="w-8 h-8" />

        <div className="flex-1 min-w-0">
          <p className={`font-bold ${textColor} truncate`}>
            {file.file_name}
          </p>
          <div className={`flex items-center gap-3 mt-1 text-sm font-semibold ${textMuted}`}>
            <span className="flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5" />
              {file.destination}/
            </span>
            <span>{formatFileSize(file.file_size)}</span>
          </div>
        </div>

        {isMovedOrMoving ? (
          <div className="flex items-center gap-2 text-sm font-bold bg-cyan-300 border-2 border-black px-3 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
            <Loader2 className="w-5 h-5 animate-spin" />
            Moving...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm font-bold bg-yellow-200 border-2 border-black px-2.5 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
              <Clock className="w-4 h-4" />
              {timeLeft}s
            </div>

            <button
              onClick={onMoveNow}
              className="p-2.5 border-2 border-black bg-lime-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              title="Move now"
            >
              <Play className="w-4 h-4" />
            </button>

            <button
              onClick={onCancel}
              className="p-2.5 border-2 border-black bg-pink-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PendingFiles({ files, onCancel, onMoveNow, isDarkMode }: PendingFilesProps) {
  const cardBg = isDarkMode ? "bg-gray-900" : "bg-white";
  const borderColor = isDarkMode ? "border-white" : "border-black";
  const shadowStyle = isDarkMode 
    ? "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" 
    : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
  const shadowSmall = isDarkMode 
    ? "shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]" 
    : "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
  const textMuted = isDarkMode ? "text-white/70" : "text-black/70";
  const iconMuted = isDarkMode ? "text-white/50" : "text-black/50";

  if (files.length === 0) {
    return (
      <div className={`${cardBg} border-2 ${borderColor} ${shadowStyle} p-8 text-center`}>
        <div className={`w-16 h-16 ${isDarkMode ? "bg-gray-800" : "bg-main"} border-2 ${borderColor} flex items-center justify-center mx-auto mb-4 ${shadowSmall}`}>
          <Clock className={`w-8 h-8 ${iconMuted}`} />
        </div>
        <p className={`font-semibold ${textMuted}`}>
          No files pending. New files will appear here before being sorted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <PendingFileCard
          key={file.id}
          file={file}
          onCancel={() => onCancel(file.id)}
          onMoveNow={() => onMoveNow(file.id)}
          isDarkMode={isDarkMode}
        />
      ))}
    </div>
  );
}
