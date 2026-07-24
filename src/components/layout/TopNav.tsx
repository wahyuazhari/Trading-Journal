import React, { useState, useEffect } from 'react';
import { Plus, Search, ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { NavigationPage, RiskSettings } from '../../types';

interface TopNavProps {
  currentPage: NavigationPage;
  onOpenAddModal: () => void;
  riskSettings: RiskSettings;
  currentDrawdown: number;
  onSearchChange?: (query: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  onOpenAddModal,
  riskSettings,
  currentDrawdown,
  onSearchChange,
}) => {
  const [time, setTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <header className="h-16 bg-[#101010] border-b border-[#2D2D2D] px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Title section */}
      <div>
        <h2 className="text-white font-bold text-lg tracking-tight">
          {pageTitles[currentPage]?.title || 'Trading Journal Pro'}
        </h2>
        <p className="text-xs text-[#8B8B8B]">
          {pageTitles[currentPage]?.subtitle || 'Offline Terminal'}
        </p>
      </div>

      {/* Middle Search & Alerts */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        {(currentPage === 'journal' || currentPage === 'gallery') && (
          <div className="relative w-64 hidden sm:block">
            <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search pair, strategy, notes..."
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#777777] outline-none transition-colors"
            />
          </div>
        )}

        {/* Drawdown Risk Warning Badge */}
        {isDrawdownExceeded && (
          <div className="flex items-center gap-2 bg-[#F44336]/15 border border-[#F44336]/40 text-[#F44336] px-3 py-1 rounded-lg text-xs font-semibold animate-pulse">
            <ShieldAlert className="w-4 h-4" />
            <span>Max Drawdown Exceeded ({currentDrawdown}%)</span>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#151515] border border-[#2D2D2D] rounded-lg text-xs text-[#B8B8B8] font-mono">
          <Clock className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>{time} UTC</span>
        </div>

        {/* Add Trade Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 bg-[#FF7A00] hover:bg-[#FF8E26] text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-md shadow-[#FF7A00]/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Trade</span>
        </button>
      </div>
    </header>
  );
};
