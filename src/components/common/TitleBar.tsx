import { useState, useEffect } from "react";
import { Minus, Square, X, Copy } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface TitleBarProps {
  isDarkMode?: boolean;
}

export function TitleBar({ isDarkMode }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    // Check initial maximized state
    appWindow.isMaximized().then(setIsMaximized);
  }, [appWindow]);

  const handleMinimize = async () => {
    try {
      await appWindow.minimize();
    } catch (err) {
      console.error("Failed to minimize:", err);
    }
  };

  const handleMaximize = async () => {
    try {
      const maximized = await appWindow.isMaximized();
      if (maximized) {
        await appWindow.unmaximize();
        setIsMaximized(false);
      } else {
        await appWindow.maximize();
        setIsMaximized(true);
      }
    } catch (err) {
      console.error("Failed to maximize:", err);
    }
  };

  const handleClose = async () => {
    try {
      await appWindow.close();
    } catch (err) {
      console.error("Failed to close:", err);
    }
  };

  return (
    <div
      data-tauri-drag-region
      className={`h-10 flex items-center justify-between select-none border-b-2 flex-shrink-0 ${
        isDarkMode ? "bg-gray-900 border-white" : "bg-white border-black"
      }`}
    >
      {/* App Title with Logo */}
      <div data-tauri-drag-region className="flex items-center gap-2 px-3">
        <img src="/logo.png" alt="AutoSort" className="w-6 h-6 object-contain" />
        <span className={`text-sm font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
          AutoSort
        </span>
      </div>

      {/* Window Controls */}
      <div className="flex h-full">
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          className={`w-12 h-full flex items-center justify-center transition-colors ${
            isDarkMode
              ? "hover:bg-gray-700 text-white"
              : "hover:bg-yellow-200 text-black"
          }`}
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Maximize/Restore */}
        <button
          onClick={handleMaximize}
          className={`w-12 h-full flex items-center justify-center transition-colors ${
            isDarkMode
              ? "hover:bg-gray-700 text-white"
              : "hover:bg-lime-200 text-black"
          }`}
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <Copy className="w-3.5 h-3.5" />
          ) : (
            <Square className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className={`w-12 h-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors ${
            isDarkMode ? "text-white" : "text-black"
          }`}
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
