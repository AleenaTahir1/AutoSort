import { useState, useEffect } from "react";
import { RulesList } from "./RulesList";
import { RuleEditor } from "./RuleEditor";
import { getRules, addRule, updateRule, deleteRule } from "@/lib/tauri";
import type { SortRule } from "@/lib/types";

interface RulesProps {
  isDarkMode?: boolean;
}

export function Rules({ isDarkMode }: RulesProps) {
  const [rules, setRules] = useState<SortRule[]>([]);
  const [editingRule, setEditingRule] = useState<SortRule | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRules = async () => {
    try {
      const data = await getRules();
      setRules(data);
    } catch (err) {
      console.error("Failed to load rules:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleAdd = () => {
    setEditingRule(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (rule: SortRule) => {
    setEditingRule(rule);
    setIsEditorOpen(true);
  };

  const handleSave = async (rule: SortRule) => {
    try {
      if (editingRule) {
        await updateRule(rule);
      } else {
        await addRule(rule);
      }
      await loadRules();
      setIsEditorOpen(false);
    } catch (err) {
      console.error("Failed to save rule:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      await deleteRule(id);
      await loadRules();
    } catch (err) {
      console.error("Failed to delete rule:", err);
    }
  };

  const handleToggle = async (rule: SortRule) => {
    try {
      await updateRule({ ...rule, enabled: !rule.enabled });
      await loadRules();
    } catch (err) {
      console.error("Failed to toggle rule:", err);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 flex items-center justify-center min-h-full ${isDarkMode ? "bg-gray-800" : "bg-main"}`}>
        <div className={`animate-spin h-8 w-8 border-2 ${isDarkMode ? "border-white" : "border-black"} border-t-transparent`} />
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-full ${isDarkMode ? "bg-gray-800" : "bg-main"}`}>
      <RulesList
        rules={rules}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        onAdd={handleAdd}
        isDarkMode={isDarkMode}
      />

      {isEditorOpen && (
        <RuleEditor
          rule={editingRule}
          onSave={handleSave}
          onClose={() => setIsEditorOpen(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
