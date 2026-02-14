import { formatDistanceToNow } from "date-fns";
import { Undo2, ArrowRight, Trash2, CircleCheck } from "lucide-react";
import { FileIcon } from "@/components/common/FileIcon";
import type { MoveRecord } from "@/lib/types";

interface RecentActivityProps {
  records: MoveRecord[];
  onUndo: (id: string) => void;
  onClear: () => void;
  isDarkMode?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileName(path: string): string {
  return path.split(/[/\\]/).pop() || path;
}

function getFolderName(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts.length > 1 ? parts[parts.length - 2] : "";
}

export function RecentActivity({ records, onUndo, onClear, isDarkMode }: RecentActivityProps) {
  const cardBg = isDarkMode ? "bg-gray-900" : "bg-white";
  const borderColor = isDarkMode ? "border-white" : "border-black";
  const shadowStyle = isDarkMode 
    ? "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" 
    : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
  const textColor = isDarkMode ? "text-white" : "text-black";
  const textMuted = isDarkMode ? "text-white/60" : "text-black/60";

  if (records.length === 0) {
    return (
      <div className={`${cardBg} border-2 ${borderColor} ${shadowStyle} p-8 text-center`}>
        <p className={`font-semibold ${isDarkMode ? "text-white/70" : "text-black/70"}`}>
          No recent activity. Sorted files will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={`${cardBg} border-2 ${borderColor} ${shadowStyle} overflow-hidden`}>
      <div className={`flex items-center justify-between p-4 border-b-2 ${borderColor} bg-violet-200`}>
        <h3 className="font-bold text-black">
          Recent Activity
        </h3>
        <button
          onClick={onClear}
          className="text-sm font-bold text-black bg-pink-300 border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>

      <div className={`divide-y-2 ${isDarkMode ? "divide-white/10" : "divide-black/10"} max-h-96 overflow-y-auto`}>
        {records.map((record) => {
          const fileName = getFileName(record.original_path);
          const destFolder = getFolderName(record.new_path);

          return (
            <div
              key={record.id}
              className={`p-4 transition-colors ${isDarkMode ? "hover:bg-gray-800" : "hover:bg-yellow-100"}`}
            >
              <div className="flex items-center gap-3">
                <CircleCheck className="w-6 h-6 text-black flex-shrink-0 bg-lime-300 border-2 border-black p-0.5" aria-label="Moved" />
                <FileIcon filename={fileName} className="w-6 h-6" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold ${textColor} truncate`}>
                      {fileName}
                    </p>
                    <ArrowRight className={`w-4 h-4 ${textMuted} flex-shrink-0`} />
                    <span className={`font-bold ${textColor}`}>
                      {destFolder}/
                    </span>
                  </div>
                  <div className={`flex items-center gap-3 mt-1 text-xs font-semibold ${textMuted}`}>
                    <span>{formatFileSize(record.file_size)}</span>
                    <span>
                      {formatDistanceToNow(new Date(record.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                {record.can_undo && (
                  <button
                    onClick={() => onUndo(record.id)}
                    className="p-2.5 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4 text-black" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
