import { useState, useEffect, useCallback } from "react";
import {
  startWatcher,
  stopWatcher,
  pauseWatcher,
  resumeWatcher,
  getWatcherStatus,
  getPendingFiles,
  scanFolder,
  cancelPendingFile,
  moveFileNow,
} from "@/lib/tauri";
import type { PendingFile, WatcherStatus } from "@/lib/types";

export function useWatcher() {
  const [status, setStatus] = useState<WatcherStatus>({
    is_running: false,
    is_paused: false,
  });
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    try {
      const newStatus = await getWatcherStatus();
      setStatus(newStatus);
    } catch (err) {
      console.error("Failed to get watcher status:", err);
    }
  }, []);

  const refreshPendingFiles = useCallback(async () => {
    try {
      const files = await getPendingFiles();
      setPendingFiles(files);
    } catch (err) {
      console.error("Failed to get pending files:", err);
    }
  }, []);

  const start = useCallback(async () => {
    try {
      await startWatcher();
      await refreshStatus();
      return true;
    } catch (err) {
      console.error("Failed to start watcher:", err);
      return false;
    }
  }, [refreshStatus]);

  const stop = useCallback(async () => {
    try {
      await stopWatcher();
      await refreshStatus();
      return true;
    } catch (err) {
      console.error("Failed to stop watcher:", err);
      return false;
    }
  }, [refreshStatus]);

  const pause = useCallback(async () => {
    try {
      await pauseWatcher();
      await refreshStatus();
      return true;
    } catch (err) {
      console.error("Failed to pause watcher:", err);
      return false;
    }
  }, [refreshStatus]);

  const resume = useCallback(async () => {
    try {
      await resumeWatcher();
      await refreshStatus();
      return true;
    } catch (err) {
      console.error("Failed to resume watcher:", err);
      return false;
    }
  }, [refreshStatus]);

  const scan = useCallback(async () => {
    try {
      const newFiles = await scanFolder();
      await refreshPendingFiles();
      return newFiles;
    } catch (err) {
      console.error("Failed to scan folder:", err);
      return [];
    }
  }, [refreshPendingFiles]);

  const cancelPending = useCallback(
    async (id: string) => {
      try {
        await cancelPendingFile(id);
        await refreshPendingFiles();
        return true;
      } catch (err) {
        console.error("Failed to cancel pending file:", err);
        return false;
      }
    },
    [refreshPendingFiles]
  );

  const moveNow = useCallback(
    async (id: string) => {
      try {
        await moveFileNow(id);
        await refreshPendingFiles();
        return true;
      } catch (err) {
        console.error("Failed to move file:", err);
        return false;
      }
    },
    [refreshPendingFiles]
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshStatus();
      await refreshPendingFiles();
      setLoading(false);
    };
    init();

    // Poll for updates every second
    const interval = setInterval(() => {
      refreshPendingFiles();
    }, 1000);

    return () => clearInterval(interval);
  }, [refreshStatus, refreshPendingFiles]);

  return {
    status,
    pendingFiles,
    loading,
    start,
    stop,
    pause,
    resume,
    scan,
    cancelPending,
    moveNow,
    refreshStatus,
    refreshPendingFiles,
  };
}
