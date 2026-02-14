import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { SortRule, Condition } from "@/lib/types";

interface RuleEditorProps {
  rule: SortRule | null;
  onSave: (rule: SortRule) => void;
  onClose: () => void;
  isDarkMode?: boolean;
}

const conditionTypes = [
  { value: "Extension", label: "File Extension" },
  { value: "NameContains", label: "Name Contains" },
  { value: "NameRegex", label: "Name Regex" },
  { value: "SizeGreaterThan", label: "Size Greater Than" },
  { value: "SizeLessThan", label: "Size Less Than" },
];

function createEmptyCondition(type: string): Condition {
  switch (type) {
    case "Extension":
      return { type: "Extension", value: [] };
    case "NameContains":
      return { type: "NameContains", value: "" };
    case "NameRegex":
      return { type: "NameRegex", value: "" };
    case "SizeGreaterThan":
      return { type: "SizeGreaterThan", value: 0 };
    case "SizeLessThan":
      return { type: "SizeLessThan", value: 0 };
    default:
      return { type: "Extension", value: [] };
  }
}

export function RuleEditor({ rule, onSave, onClose, isDarkMode: _isDarkMode }: RuleEditorProps) {
  // Dark mode is passed but modal always uses light theme for consistency
  void _isDarkMode;
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [priority, setPriority] = useState(50);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [extensionInput, setExtensionInput] = useState("");

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setDestination(rule.destination_folder);
      setPriority(rule.priority);
      setConditions(rule.conditions);
      
      // Set extension input for existing extension conditions
      const extCondition = rule.conditions.find(c => c.type === "Extension");
      if (extCondition && extCondition.type === "Extension") {
        setExtensionInput(extCondition.value.join(", "));
      }
    } else {
      setName("");
      setDestination("");
      setPriority(50);
      setConditions([{ type: "Extension", value: [] }]);
      setExtensionInput("");
    }
  }, [rule]);

  const handleSave = () => {
    if (!name.trim() || !destination.trim()) return;

    const newRule: SortRule = {
      id: rule?.id || uuidv4(),
      name: name.trim(),
      destination_folder: destination.trim(),
      priority,
      enabled: rule?.enabled ?? true,
      is_default: false,
      conditions: conditions.filter(c => {
        if (c.type === "Extension") return c.value.length > 0;
        if (c.type === "NameContains" || c.type === "NameRegex") return c.value !== "";
        return true;
      }),
    };

    onSave(newRule);
  };

  const updateCondition = (index: number, condition: Condition) => {
    const newConditions = [...conditions];
    newConditions[index] = condition;
    setConditions(newConditions);
  };

  const addCondition = () => {
    setConditions([...conditions, createEmptyCondition("NameContains")]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleExtensionInputChange = (value: string, index: number) => {
    setExtensionInput(value);
    const extensions = value
      .split(",")
      .map(e => e.trim().toLowerCase().replace(/^\./, ""))
      .filter(e => e);
    updateCondition(index, { type: "Extension", value: extensions });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b-2 border-black bg-cyan-300">
          <h3 className="text-lg font-bold text-black">
            {rule ? "Edit Rule" : "New Rule"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Rule Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 font-medium border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              placeholder="e.g., Screenshots"
            />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Destination Folder
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-2.5 font-medium border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              placeholder="e.g., Screenshots"
            />
            <p className="text-xs font-semibold text-black/60 mt-1">
              Folder will be created inside your destination root
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">
              Priority: {priority}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              className="w-full accent-black"
            />
            <p className="text-xs font-semibold text-black/60 mt-1">
              Higher priority rules are checked first
            </p>
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Conditions
            </label>

            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <div
                  key={index}
                  className="p-3 bg-main border-2 border-black"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <select
                      value={condition.type}
                      onChange={(e) => {
                        const newCondition = createEmptyCondition(e.target.value);
                        updateCondition(index, newCondition);
                        if (e.target.value !== "Extension") {
                          setExtensionInput("");
                        }
                      }}
                      className="flex-1 px-3 py-2 font-medium border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                    >
                      {conditionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    {conditions.length > 1 && (
                      <button
                        onClick={() => removeCondition(index)}
                        className="p-2 border-2 border-black bg-red-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {condition.type === "Extension" && (
                    <input
                      type="text"
                      value={extensionInput}
                      onChange={(e) => handleExtensionInputChange(e.target.value, index)}
                      className="w-full px-4 py-2.5 font-medium border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                      placeholder="jpg, png, gif (comma separated)"
                    />
                  )}

                  {(condition.type === "NameContains" ||
                    condition.type === "NameRegex") && (
                    <input
                      type="text"
                      value={condition.value}
                      onChange={(e) =>
                        updateCondition(index, {
                          ...condition,
                          value: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 font-medium border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                      placeholder={
                        condition.type === "NameContains"
                          ? "Text to match"
                          : "Regular expression"
                      }
                    />
                  )}

                  {(condition.type === "SizeGreaterThan" ||
                    condition.type === "SizeLessThan") && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={condition.value / (1024 * 1024)}
                        onChange={(e) =>
                          updateCondition(index, {
                            ...condition,
                            value: parseFloat(e.target.value) * 1024 * 1024,
                          })
                        }
                        className="flex-1 px-4 py-2.5 font-medium border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                        min="0"
                        step="0.1"
                      />
                      <span className="font-bold text-black">MB</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addCondition}
              className="mt-3 text-sm font-bold text-black bg-yellow-200 border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Condition
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t-2 border-black">
          <button
            onClick={onClose}
            className="px-4 py-2.5 font-bold border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2.5 font-bold border-2 border-black bg-lime-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!name.trim() || !destination.trim()}
          >
            {rule ? "Save Changes" : "Create Rule"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple UUID v4 generator
function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
