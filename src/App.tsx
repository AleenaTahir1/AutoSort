import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/common/Sidebar";
import { TitleBar } from "@/components/common/TitleBar";
import { Dashboard } from "@/components/Dashboard";
import { Rules } from "@/components/Rules";
import { Settings } from "@/components/Settings";
import { useConfig } from "@/hooks/useConfig";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { config } = useConfig();
  const [localDarkMode, setLocalDarkMode] = useState(false);

  // Sync local dark mode with config
  useEffect(() => {
    if (config) {
      setLocalDarkMode(config.dark_mode);
    }
  }, [config]);

  // Apply dark mode class to document
  useEffect(() => {
    if (localDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [localDarkMode]);

  // Callback for when settings change dark mode
  const handleDarkModeChange = useCallback((newValue: boolean) => {
    setLocalDarkMode(newValue);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard isDarkMode={localDarkMode} />;
      case "rules":
        return <Rules isDarkMode={localDarkMode} />;
      case "settings":
        return <Settings isDarkMode={localDarkMode} onDarkModeChange={handleDarkModeChange} />;
      default:
        return <Dashboard isDarkMode={localDarkMode} />;
    }
  };

  return (
    <div className={`fixed inset-0 flex flex-col ${localDarkMode ? "bg-gray-800" : "bg-main"}`}>
      {/* Title Bar - fixed at top */}
      <div className="flex-shrink-0">
        <TitleBar isDarkMode={localDarkMode} />
      </div>
      
      {/* Body - sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - fixed width, no scroll */}
        <div className="flex-shrink-0">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} isDarkMode={localDarkMode} />
        </div>
        
        {/* Main content - this is the ONLY scrollable area */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
