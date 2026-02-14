import { useState, useEffect, useCallback } from "react";
import { getConfig, saveConfig as saveConfigApi } from "@/lib/tauri";
import type { Config } from "@/lib/types";

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getConfig();
      setConfig(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (newConfig: Config) => {
    try {
      await saveConfigApi(newConfig);
      setConfig(newConfig);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save config");
      return false;
    }
  }, []);

  const updateConfig = useCallback(
    async (updates: Partial<Config>) => {
      if (!config) return false;
      const newConfig = { ...config, ...updates };
      return saveConfig(newConfig);
    },
    [config, saveConfig]
  );

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    saveConfig,
    updateConfig,
    reloadConfig: loadConfig,
  };
}
