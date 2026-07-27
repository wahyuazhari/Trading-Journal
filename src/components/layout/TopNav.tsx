import React, { useState, useEffect } from 'react';
import { Plus, ShieldAlert, Clock } from 'lucide-react';
import { NavigationPage, RiskSettings } from '../../types';

interface TopNavProps {
  currentPage: NavigationPage;
  onOpenAddModal: () => void;
  onOpenCmdK?: () => void;
  riskSettings: RiskSettings;
  currentDrawdown: number;
  onSearchChange?: (query: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  onOpenAddModal,
  riskSettings,
  currentDrawdown,
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
    dashboard: { title: 'Terminal Dashboard', subtitle: 'Real-time performance metrics and overview' },
    journal: { title: 'Trading Journal', subtitle: 'Complete log of executed and ongoing trades' },
    'trade-detail': { title: 'Trade Detail Review', subtitle: 'In-depth trade analysis, chart comparison & AI review' },
    gallery: { title: 'Screenshot Gallery', subtitle: 'Visual catalog of chart setups and results' },
    analytics: { title: 'Performance Analytics', subtitle: 'Deep dive into equity curves, drawdowns, and streaks' },
    risk: { title: 'Risk Management', subtitle: 'Drawdown limits, capital protection & position sizing' },
    settings: { title: 'System Settings', subtitle: 'Data backup, restore, currency and interface configuration' },
  };

  const isDrawdownExceeded = currentDrawdown > riskSettings.maxDrawdownPercent;

  return (
    <header className="h-14 lg:h-16 bg-[#101010] border-b border-[#2D2D2D] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Title section */}
      <div>
        <h2 className="text-white font-bold text-sm sm:text-base lg:text-lg tracking-tight">
          {pageTitles[currentPage]?.title || 'Trading Journal Pro'}
        </h2>
        <p className="text-[10px] sm:text-xs text-[#8B8B8B] truncate max-w-[200px] sm:max-w-none">
          {pageTitles[currentPage]?.subtitle || 'Offline Terminal'}
        </p>
      </div>

      {/* Middle Search & Alerts */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Drawdown Risk Warning Badge */}
        {isDrawdownExceeded && (
          <div className="flex items-center gap-1.5 bg-[#F44336]/15 border border-[#F44336]/40 text-[#F44336] px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">Max Drawdown ({currentDrawdown}%)</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#151515] border border-[#2D2D2D] rounded-lg text-xs text-[#B8B8B8] font-mono">
          <Clock className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>{time} UTC</span>
        </div>

        {/* Add Trade Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#FF8E26] text-white font-semibold text-xs px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all shadow-md shadow-[#FF7A00]/20 active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          <span>Add Trade</span>
        </button>
      </div>
    </header>
  );
};
