import React, { useState, useEffect } from 'react';
import { Plus, ShieldAlert, Clock, Menu } from 'lucide-react';
import { NavigationPage, RiskSettings } from '../../types';

interface TopNavProps {
  currentPage: NavigationPage;
  onOpenAddModal: () => void;
  onOpenCmdK?: () => void;
  riskSettings: RiskSettings;
  currentDrawdown: number;
  onSearchChange?: (query: string) => void;
  onToggleMobileMenu?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  onOpenAddModal,
  riskSettings,
  currentDrawdown,
  onToggleMobileMenu,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const pageTitles: Record<NavigationPage, { title: string; subtitle: string }> = {
    dashboard: { title: 'Terminal Dashboard', subtitle: 'Real-time performance metrics' },
    journal: { title: 'Trading Journal', subtitle: 'Complete log of trades' },
    'trade-detail': { title: 'Trade Review', subtitle: 'In-depth analysis & AI review' },
    gallery: { title: 'Chart Gallery', subtitle: 'Visual catalog of setups' },
    analytics: { title: 'Analytics', subtitle: 'Equity curves & stats' },
    risk: { title: 'Risk Management', subtitle: 'Limits & capital protection' },
    settings: { title: 'Settings', subtitle: 'Backup, restore & config' },
  };

  const isDrawdownExceeded = currentDrawdown > riskSettings.maxDrawdownPercent;

  return (
    <header className="h-14 lg:h-16 bg-[#101010] border-b border-[#2D2D2D] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Mobile Menu & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-[#B8B8B8] hover:text-white bg-[#151515] border border-[#2D2D2D] rounded-lg transition-colors shrink-0 cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="min-w-0">
          <h2 className="text-white font-bold text-xs sm:text-base lg:text-lg tracking-tight truncate">
            {pageTitles[currentPage]?.title || 'Trading Journal Pro'}
          </h2>
          <p className="text-[10px] sm:text-xs text-[#8B8B8B] truncate max-w-[130px] sm:max-w-none hidden sm:block">
            {pageTitles[currentPage]?.subtitle || 'Offline Terminal'}
          </p>
        </div>
      </div>

      {/* Center: Alerts */}
      {isDrawdownExceeded && (
        <div className="flex items-center gap-1 bg-[#F44336]/15 border border-[#F44336]/40 text-[#F44336] px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[9px] sm:text-xs font-semibold animate-pulse shrink-0">
          <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span className="truncate max-w-[90px] sm:max-w-none">Drawdown ({currentDrawdown}%)</span>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#151515] border border-[#2D2D2D] rounded-lg text-xs text-[#B8B8B8] font-mono">
          <Clock className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>{time} UTC</span>
        </div>

        {/* Add Trade Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1 bg-[#FF7A00] hover:bg-[#FF8E26] text-white font-semibold text-xs px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all shadow-md shadow-[#FF7A00]/20 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          <span className="hidden xs:inline">Add Trade</span>
          <span className="xs:hidden">Trade</span>
        </button>
      </div>
    </header>
  );
};
