import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Images, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  TrendingUp,
  Menu,
  X
} from 'lucide-react';
import { NavigationPage } from '../../types';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  activeTradeId?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, activeTradeId }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'journal' as NavigationPage, label: 'Trading Journal', icon: BookOpen },
    ...(activeTradeId ? [{ id: 'trade-detail' as NavigationPage, label: 'Trade Detail', icon: FileText }] : []),
    { id: 'gallery' as NavigationPage, label: 'Screenshot Gallery', icon: Images },
    { id: 'analytics' as NavigationPage, label: 'Analytics', icon: BarChart3 },
    { id: 'risk' as NavigationPage, label: 'Risk Management', icon: ShieldAlert },
    { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (page: NavigationPage) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0A0A0A] border-b border-[#2D2D2D] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF7A00] to-[#FF8E26] flex items-center justify-center text-white shadow-md shadow-[#FF7A00]/20">
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm tracking-wide flex items-center gap-1">
              TRADING JOURNAL <span className="text-[9px] px-1 py-0.2 rounded bg-[#FF7A00]/15 text-[#FF7A00] font-semibold border border-[#FF7A00]/30">PRO</span>
            </h1>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-[#8B8B8B] hover:text-white bg-[#151515] border border-[#2D2D2D] rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay Backdrop */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer Container & Desktop Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto w-64 bg-[#0A0A0A] border-r border-[#2D2D2D] flex flex-col h-screen select-none shrink-0 transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 lg:h-16 flex items-center justify-between px-5 border-b border-[#2D2D2D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FF8E26] flex items-center justify-center text-white shadow-lg shadow-[#FF7A00]/20">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm lg:text-base tracking-wide flex items-center gap-1.5">
                TRADING JOURNAL <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FF7A00]/15 text-[#FF7A00] font-semibold border border-[#FF7A00]/30">PRO</span>
              </h1>
              <p className="text-[10px] text-[#8B8B8B] tracking-wider font-medium uppercase">Offline Terminal</p>
            </div>
          </div>

          <button 
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-[#8B8B8B] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-150 relative group ${
                  isActive
                    ? 'bg-[#151515] text-white shadow-sm font-bold'
                    : 'text-[#8B8B8B] hover:text-white hover:bg-[#151515]/60'
                }`}
              >
                {/* Active Orange Left Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF7A00] rounded-r-full shadow-[0_0_8px_#FF7A00]" />
                )}

                <Icon
                  className={`w-4 h-4 lg:w-5 lg:h-5 transition-colors duration-150 ${
                    isActive ? 'text-[#FF7A00]' : 'text-[#8B8B8B] group-hover:text-white'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-3.5 border-t border-[#2D2D2D] bg-[#070707] text-[11px] text-[#8B8B8B] space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50] animate-pulse" />
              Offline Mode
            </span>
            <span className="text-[9px] bg-[#202020] text-[#B8B8B8] px-1.5 py-0.5 rounded font-mono">v2.4</span>
          </div>
          <p className="text-[10px] text-[#666666] truncate">All data saved to IndexedDB</p>
        </div>
      </aside>
    </>
  );
};

