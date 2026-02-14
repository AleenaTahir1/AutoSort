import { useState, useEffect, useCallback } from "react";
import {
  getHistory,
  getRecentHistory,
  getHistoryStats,
  undoFileMove,
  clearHistory,
} from "@/lib/tauri";
import type { MoveRecord, HistoryStats } from "@/lib/types";

export function useHistory() {
  const [records, setRecords] = useState<MoveRecord[]>([]);
  const [stats, setStats] = useState<HistoryStats>({
    total: 0,
    today: 0,
    this_week: 0,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [historyData, statsData] = await Promise.all([
        getRecentHistory(50),
        getHistoryStats(),
      ]);
      setRecords(historyData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    try {
      const data = await getHistory();
      setRecords(data);
    } catch (err) {
      console.error("Failed to load all history:", err);
    }
  }, []);

  const undo = useCallback(
    async (id: string) => {
      try {
        await undoFileMove(id);
        await refresh();
        return true;
      } catch (err) {
        console.error("Failed to undo move:", err);
        return false;
      }
    },
    [refresh]
  );

  const clear = useCallback(async () => {
    try {
      await clearHistory();
      await refresh();
      return true;
    } catch (err) {
      console.error("Failed to clear history:", err);
      return false;
    }
  }, [refresh]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    };
    init();

    // Refresh stats periodically
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    records,
    stats,
    loading,
    refresh,
    loadAll,
    undo,
    clear,
  };
}
