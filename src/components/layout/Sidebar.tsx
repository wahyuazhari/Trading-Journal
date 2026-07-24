import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Images, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  TrendingUp 
} from 'lucide-react';
import { NavigationPage } from '../../types';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  activeTradeId?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, activeTradeId }) => {
  const navItems = [
    { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal' as NavigationPage, label: 'Trading Journal', icon: BookOpen },
    ...(activeTradeId ? [{ id: 'trade-detail' as NavigationPage, label: 'Trade Detail', icon: FileText }] : []),
    { id: 'gallery' as NavigationPage, label: 'Screenshot Gallery', icon: Images },
    { id: 'analytics' as NavigationPage, label: 'Analytics', icon: BarChart3 },
    { id: 'risk' as NavigationPage, label: 'Risk Management', icon: ShieldAlert },
    { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0A0A0A] border-r border-[#2D2D2D] flex flex-col h-screen select-none shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[#2D2D2D] gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FF8E26] flex items-center justify-center text-white shadow-lg shadow-[#FF7A00]/20">
          <TrendingUp className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-white font-bold text-base tracking-wide flex items-center gap-1.5">
            TRADING JOURNAL <span className="text-xs px-1.5 py-0.5 rounded bg-[#FF7A00]/15 text-[#FF7A00] font-semibold border border-[#FF7A00]/30">PRO</span>
          </h1>
          <p className="text-[11px] text-[#8B8B8B] tracking-wider font-medium uppercase">Offline Terminal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-150 relative group ${
                isActive
                  ? 'bg-[#151515] text-white shadow-sm'
                  : 'text-[#8B8B8B] hover:text-white hover:bg-[#151515]/60'
              }`}
            >
              {/* Active Orange Left Indicator */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF7A00] rounded-r-full shadow-[0_0_8px_#FF7A00]" />
              )}

              <Icon
                className={`w-5 h-5 transition-colors duration-150 ${
                  isActive ? 'text-[#FF7A00]' : 'text-[#8B8B8B] group-hover:text-white'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#2D2D2D] bg-[#070707] text-xs text-[#8B8B8B] space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse" />
            Offline Mode
          </span>
          <span className="text-[10px] bg-[#202020] text-[#B8B8B8] px-1.5 py-0.5 rounded">v2.4</span>
        </div>
        <p className="text-[11px] text-[#666666] truncate">All data saved to IndexedDB</p>
      </div>
    </aside>
  );
};
