import {
  GripVertical,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Plus,
  FolderOpen,
} from "lucide-react";
import type { SortRule } from "@/lib/types";

interface RulesListProps {
  rules: SortRule[];
  onEdit: (rule: SortRule) => void;
  onDelete: (id: string) => void;
  onToggle: (rule: SortRule) => void;
  onAdd: () => void;
  isDarkMode?: boolean;
}

function getConditionSummary(rule: SortRule): string {
  const conditions = rule.conditions.map((c) => {
    switch (c.type) {
      case "Extension":
        return c.value.slice(0, 5).join(", ") + (c.value.length > 5 ? "..." : "");
      case "NameContains":
        return `contains "${c.value}"`;
      case "NameRegex":
        return `matches /${c.value}/`;
      case "SizeGreaterThan":
        return `> ${formatSize(c.value)}`;
      case "SizeLessThan":
        return `< ${formatSize(c.value)}`;
      default:
        return "";
    }
  });
  return conditions.join(" AND ");
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
}

export function RulesList({
  rules,
  onEdit,
  onDelete,
  onToggle,
  onAdd,
  isDarkMode,
}: RulesListProps) {
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

  const cardBg = isDarkMode ? "bg-gray-900" : "bg-white";
  const borderColor = isDarkMode ? "border-white" : "border-black";
  const shadowStyle = isDarkMode 
    ? "shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]" 
    : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
  const textColor = isDarkMode ? "text-white" : "text-black";
  const textMuted = isDarkMode ? "text-white/70" : "text-black/70";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-lg font-bold ${textColor}`}>
            Sorting Rules
          </h3>
          <p className={`text-sm font-semibold ${textMuted} mt-1`}>
            Rules are applied in priority order (highest first)
          </p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2.5 font-bold border-2 border-black bg-cyan-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-2 text-black"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      <div className="space-y-2">
        {sortedRules.map((rule) => (
          <div
            key={rule.id}
            className={`${cardBg} border-2 ${borderColor} ${shadowStyle} p-4 transition-opacity ${
              !rule.enabled ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`${isDarkMode ? "text-white/40" : "text-black/40"} cursor-grab`}>
                <GripVertical className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold ${textColor}`}>
                    {rule.name}
                  </h4>
                  {rule.is_default && (
                    <span className="text-xs font-bold px-2 py-0.5 bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                      Default
                    </span>
                  )}
                </div>
                <div className={`flex items-center gap-3 mt-1 text-sm font-semibold ${textMuted}`}>
                  <span className="flex items-center gap-1">
                    <FolderOpen className="w-3.5 h-3.5" />
                    {rule.destination_folder}/
                  </span>
                  <span className="truncate">{getConditionSummary(rule)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold w-12 text-right px-2 py-1 border ${
                  isDarkMode 
                    ? "text-white/50 bg-gray-800 border-white/20" 
                    : "text-black/50 bg-main border-black/20"
                }`}>
                  #{rule.priority}
                </span>

                <button
                  onClick={() => onToggle(rule)}
                  className={`p-2 border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
                    rule.enabled
                      ? "bg-lime-300"
                      : isDarkMode ? "bg-gray-700" : "bg-main"
                  }`}
                  title={rule.enabled ? "Disable" : "Enable"}
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-5 h-5 text-black" />
                  ) : (
                    <ToggleLeft className="w-5 h-5 text-black" />
                  )}
                </button>

                <button
                  onClick={() => onEdit(rule)}
                  className="p-2 border-2 border-black bg-violet-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 text-black" />
                </button>

                <button
                  onClick={() => onDelete(rule.id)}
                  className="p-2 border-2 border-black bg-red-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className={`${cardBg} border-2 ${borderColor} ${shadowStyle} p-8 text-center`}>
          <p className={`${textMuted} font-semibold`}>
            No rules configured. Add a rule to start organizing files.
          </p>
        </div>
      )}
    </div>
  );
}
