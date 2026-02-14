import { Calendar, CalendarDays, Database } from "lucide-react";
import type { HistoryStats } from "@/lib/types";

interface StatsProps {
  stats: HistoryStats;
  isDarkMode?: boolean;
}

export function Stats({ stats, isDarkMode }: StatsProps) {
  const cardBg = isDarkMode ? "bg-gray-900" : "bg-white";
  const borderColor = isDarkMode ? "border-white" : "border-black";
  const shadowStyle = isDarkMode 
    ? "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" 
    : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
  const shadowSmall = isDarkMode 
    ? "shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]" 
    : "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
  const textColor = isDarkMode ? "text-white" : "text-black";
  const textMuted = isDarkMode ? "text-white/70" : "text-black/70";

  const statItems = [
    { label: "Today", value: stats.today, icon: Calendar, bg: "bg-lime-300" },
    { label: "Week", value: stats.this_week, icon: CalendarDays, bg: "bg-cyan-300" },
    { label: "Total", value: stats.total, icon: Database, bg: "bg-pink-300" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={`${cardBg} border-2 ${borderColor} ${shadowStyle} p-3`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 border-2 border-black ${item.bg} ${shadowSmall}`}>
                <Icon className="w-4 h-4 text-black" />
              </div>
              <div>
                <p className={`text-xl font-bold ${textColor}`}>{item.value}</p>
                <p className={`text-xs font-semibold ${textMuted}`}>{item.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
