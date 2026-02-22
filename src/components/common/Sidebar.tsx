import {
  LayoutDashboard,
  ListFilter,
  Settings,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isDarkMode?: boolean;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "rules", label: "Rules", icon: ListFilter },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange, isDarkMode }: SidebarProps) {
  return (
    <aside className={`w-64 h-full border-r-2 flex flex-col overflow-hidden ${
      isDarkMode ? "bg-gray-900 border-white" : "bg-white border-black"
    }`}>
      {/* Logo */}
      <div className={`p-4 border-b-2 flex-shrink-0 ${isDarkMode ? "border-white" : "border-black"}`}>
        <div className="flex items-center gap-3">
          <img src="/icon.svg" alt="AutoSort" className="w-10 h-10" />
          <div>
            <h1 className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
              AutoSort
            </h1>
            <p className={`text-xs font-medium ${isDarkMode ? "text-white/70" : "text-black/70"}`}>
              Files Organizer
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-hidden">
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-bold border-2 transition-all ${
                    isActive
                      ? "bg-lime-300 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-md"
                      : isDarkMode
                        ? "border-transparent text-white/80 hover:bg-gray-800 hover:border-white/30 rounded-md"
                        : "border-transparent text-black/80 hover:bg-main hover:border-black/30 rounded-md"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
