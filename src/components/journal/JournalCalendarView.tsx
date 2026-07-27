import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Clock,
  ArrowRight,
  Grid,
  ListFilter
} from 'lucide-react';
import { Trade } from '../../types';

interface JournalCalendarViewProps {
  trades: Trade[];
  onSelectTrade: (tradeId: string) => void;
  onOpenAddModal: (tradeToEdit?: Trade) => void;
  currencySymbol: string;
}

export const JournalCalendarView: React.FC<JournalCalendarViewProps> = ({
  trades,
  onSelectTrade,
  onOpenAddModal,
  currencySymbol,
}) => {
  const [calMode, setCalMode] = useState<'grid' | 'agenda'>('grid');

  // Determine initial month based on latest trade or current date
  const initialDate = useMemo(() => {
    if (trades.length > 0) {
      const dates = trades.map(t => new Date(t.date).getTime()).filter(t => !isNaN(t));
      if (dates.length > 0) {
        const latest = new Date(Math.max(...dates));
        return new Date(latest.getFullYear(), latest.getMonth(), 1);
      }
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, [trades]);

  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleTodayMonth = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map trades by date "YYYY-MM-DD"
  const tradesByDate = useMemo(() => {
    const map: Record<string, Trade[]> = {};
    trades.forEach((t) => {
      if (!t.date) return;
      if (!map[t.date]) {
        map[t.date] = [];
      }
      map[t.date].push(t);
    });
    return map;
  }, [trades]);

  // Calendar grid calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Monthly stats
  const monthlyStats = useMemo(() => {
    let monthPnL = 0;
    let monthTradesCount = 0;
    let winningDays = 0;
    let losingDays = 0;
    let winCount = 0;
    let lossCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTrades = tradesByDate[dateStr] || [];
      if (dayTrades.length > 0) {
        const dayPnL = dayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
        monthPnL += dayPnL;
        monthTradesCount += dayTrades.length;

        dayTrades.forEach((t) => {
          if (t.result === 'Win') winCount++;
          else if (t.result === 'Loss') lossCount++;
        });

        if (dayPnL > 0) winningDays++;
        else if (dayPnL < 0) losingDays++;
      }
    }

    const closedTrades = winCount + lossCount;
    const monthlyWinRate = closedTrades > 0 ? Math.round((winCount / closedTrades) * 100) : 0;

    return {
      monthPnL,
      monthTradesCount,
      winningDays,
      losingDays,
      winCount,
      lossCount,
      monthlyWinRate,
    };
  }, [year, month, daysInMonth, tradesByDate]);

  // Days in month that have trades (for Agenda mode)
  const activeDaysInMonth = useMemo(() => {
    const active: { dateStr: string; dayNum: number; trades: Trade[]; dayPnL: number }[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTrades = tradesByDate[dateStr] || [];
      if (dayTrades.length > 0) {
        const dayPnL = dayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
        active.push({ dateStr, dayNum: day, trades: dayTrades, dayPnL });
      }
    }
    return active;
  }, [year, month, daysInMonth, tradesByDate]);

  // Selected day's trades list
  const selectedDayTrades = selectedDayDate ? (tradesByDate[selectedDayDate] || []) : [];

  // Compact number formatting helper for small mobile grid cells
  const formatCompactPnL = (num: number) => {
    const abs = Math.abs(num);
    const sign = num >= 0 ? '+' : '-';
    if (abs >= 10000) {
      return `${sign}${currencySymbol}${(abs / 1000).toFixed(1)}k`;
    }
    return `${sign}${currencySymbol}${abs.toLocaleString()}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Calendar Top Controls & Monthly Performance Summary */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] rounded-xl shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {monthName}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#8B8B8B]">Performance calendar and daily trade markers</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* View Mode Switcher: Grid vs Agenda */}
            <div className="flex items-center bg-[#111111] border border-[#2D2D2D] p-1 rounded-lg">
              <button
                onClick={() => setCalMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  calMode === 'grid'
                    ? 'bg-[#FF7A00] text-white'
                    : 'text-[#8B8B8B] hover:text-white'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setCalMode('agenda')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  calMode === 'agenda'
                    ? 'bg-[#FF7A00] text-white'
                    : 'text-[#8B8B8B] hover:text-white'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Agenda</span>
              </button>
            </div>

            {/* Month Nav Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleTodayMonth}
                className="px-2.5 py-1 bg-[#202020] hover:bg-[#2A2A2A] text-xs font-semibold text-[#B8B8B8] hover:text-white rounded-lg border border-[#333333] transition-colors cursor-pointer"
              >
                Today
              </button>
              <div className="flex items-center bg-[#111111] border border-[#2D2D2D] rounded-lg p-0.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-[#202020] text-[#B8B8B8] hover:text-white rounded transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-[#202020] text-[#B8B8B8] hover:text-white rounded transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Summary Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3 border-t border-[#2D2D2D]">
          <div className="bg-[#111111] border border-[#2D2D2D] p-2.5 sm:p-3 rounded-xl">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#8B8B8B] block truncate">Monthly Net PnL</span>
            <span className={`text-sm sm:text-base font-bold font-mono ${monthlyStats.monthPnL >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'}`}>
              {currencySymbol}{monthlyStats.monthPnL.toLocaleString()}
            </span>
          </div>
          <div className="bg-[#111111] border border-[#2D2D2D] p-2.5 sm:p-3 rounded-xl">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#8B8B8B] block truncate">Monthly Win Rate</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-bold text-white font-mono">{monthlyStats.monthlyWinRate}%</span>
              <span className="text-[9px] sm:text-[10px] text-[#8B8B8B]">({monthlyStats.winCount}W/{monthlyStats.lossCount}L)</span>
            </div>
          </div>
          <div className="bg-[#111111] border border-[#2D2D2D] p-2.5 sm:p-3 rounded-xl">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#8B8B8B] block truncate">Winning vs Losing Days</span>
            <div className="flex items-center gap-1 text-xs font-bold font-mono truncate">
              <span className="text-[#4CAF50]">{monthlyStats.winningDays} W</span>
              <span className="text-[#8B8B8B]">/</span>
              <span className="text-[#FF7A00]">{monthlyStats.losingDays} L</span>
            </div>
          </div>
          <div className="bg-[#111111] border border-[#2D2D2D] p-2.5 sm:p-3 rounded-xl">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#8B8B8B] block truncate">Total Positions</span>
            <span className="text-sm sm:text-base font-bold text-white font-mono">{monthlyStats.monthTradesCount} Trades</span>
          </div>
        </div>
      </div>

      {/* Main View: Grid vs Agenda */}
      {calMode === 'grid' ? (
        /* Calendar Grid Container */
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-2 sm:p-4 overflow-hidden">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5 text-center text-[10px] sm:text-[11px] font-bold uppercase text-[#8B8B8B]">
            <div className="py-1 bg-[#101010] rounded"><span className="sm:hidden">S</span><span className="hidden sm:inline">Sun</span></div>
            <div className="py-1 bg-[#101010] rounded"><span className="sm:hidden">M</span><span className="hidden sm:inline">Mon</span></div>
            <div className="py-1 bg-[#101010] rounded"><span className="sm:hidden">T</span><span className="hidden sm:inline">Tue</span></div>
            <div className="py-1 bg-[#101010] rounded"><span className="sm:hidden">W</span><span className="hidden sm:inline">Wed</span></div>
            <div className="py-1 bg-[#101010] rounded"><span className="sm:hidden">T</span><span className="hidden sm:inline">Thu</span></div>
            <div className="py-1 bg-[#101010] rounded"><span className="sm:hidden">F</span><span className="hidden sm:inline">Fri</span></div>
            <div className="py-1 bg-[#101010] rounded"><span className="sm:hidden">S</span><span className="hidden sm:inline">Sat</span></div>
          </div>

          {/* Calendar days grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty padding cells before 1st of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div
                key={`empty_${idx}`}
                className="bg-[#101010]/30 border border-transparent rounded-lg sm:rounded-xl h-14 xs:h-16 sm:h-28 opacity-20"
              />
            ))}

            {/* Actual days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayTrades = tradesByDate[dateStr] || [];
              
              const isToday = (() => {
                const now = new Date();
                return (
                  now.getFullYear() === year &&
                  now.getMonth() === month &&
                  now.getDate() === dayNum
                );
              })();

              const isSelected = selectedDayDate === dateStr;

              // Day calculations
              const totalPnL = dayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
              const wins = dayTrades.filter(t => t.result === 'Win').length;
              const losses = dayTrades.filter(t => t.result === 'Loss').length;
              const be = dayTrades.filter(t => t.result === 'Break Even').length;
              const ongoing = dayTrades.filter(t => t.status === 'Ongoing').length;

              const hasTrades = dayTrades.length > 0;
              const isWinDay = hasTrades && totalPnL > 0;
              const isLossDay = hasTrades && totalPnL < 0;
              const isBeDay = hasTrades && totalPnL === 0;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDayDate(dateStr)}
                  className={`relative flex flex-col justify-between p-1 sm:p-2 rounded-lg sm:rounded-xl h-14 xs:h-16 sm:h-28 transition-all border cursor-pointer select-none group ${
                    isSelected
                      ? 'ring-2 ring-[#FF7A00] border-[#FF7A00] bg-[#1E1E1E]'
                      : isWinDay
                      ? 'bg-[#4CAF50]/10 border-[#4CAF50]/30 hover:border-[#4CAF50]/60'
                      : isLossDay
                      ? 'bg-[#FF7A00]/10 border-[#FF7A00]/30 hover:border-[#FF7A00]/60'
                      : isBeDay
                      ? 'bg-[#202020] border-[#383838]'
                      : 'bg-[#111111] border-[#252525] hover:border-[#383838]'
                  }`}
                >
                  {/* Header: Day number & count */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[10px] sm:text-xs font-mono font-bold px-1 py-0.2 rounded ${
                        isToday
                          ? 'bg-[#FF7A00] text-white'
                          : isSelected
                          ? 'text-[#FF7A00]'
                          : 'text-white'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {hasTrades && (
                      <span className="text-[8px] sm:text-[9px] font-mono text-[#8B8B8B] hidden sm:inline">
                        {dayTrades.length} {dayTrades.length === 1 ? 'trade' : 'trades'}
                      </span>
                    )}
                  </div>

                  {/* Cell Body: Mobile Compact vs Desktop Full */}
                  {hasTrades ? (
                    <div className="space-y-0.5 sm:space-y-1 my-auto w-full">
                      {/* PnL Indicator Pill */}
                      <div
                        className={`text-[9px] sm:text-[11px] font-mono font-bold px-1 py-0.2 sm:py-0.5 rounded text-center truncate ${
                          isWinDay
                            ? 'bg-[#4CAF50]/20 text-[#4CAF50]'
                            : isLossDay
                            ? 'bg-[#FF7A00]/20 text-[#FF7A00]'
                            : 'bg-[#333333] text-[#B8B8B8]'
                        }`}
                      >
                        <span className="sm:hidden">{formatCompactPnL(totalPnL)}</span>
                        <span className="hidden sm:inline">
                          {totalPnL >= 0 ? '+' : ''}{currencySymbol}{totalPnL.toLocaleString()}
                        </span>
                      </div>

                      {/* Desktop Trade Outcome Badges */}
                      <div className="hidden sm:flex items-center justify-center gap-1 flex-wrap">
                        {wins > 0 && (
                          <span className="px-1 py-0.2 bg-[#4CAF50] text-white text-[9px] font-bold rounded">
                            {wins}W
                          </span>
                        )}
                        {losses > 0 && (
                          <span className="px-1 py-0.2 bg-[#FF7A00] text-white text-[9px] font-bold rounded">
                            {losses}L
                          </span>
                        )}
                        {be > 0 && (
                          <span className="px-1 py-0.2 bg-[#777777] text-white text-[9px] font-bold rounded">
                            {be}BE
                          </span>
                        )}
                        {ongoing > 0 && (
                          <span className="px-1 py-0.2 bg-[#4A90E2] text-white text-[9px] font-bold rounded">
                            {ongoing}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="hidden sm:group-hover:flex items-center justify-center text-[10px] text-[#666666]">
                      No Trades
                    </div>
                  )}

                  {/* Footer hint */}
                  <div className="text-[8px] sm:text-[9px] text-right text-[#666666] group-hover:text-[#FF7A00] transition-colors hidden sm:block">
                    {hasTrades ? 'View trades' : '+ Log'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda Mode: Mobile Timeline Cards List */
        <div className="space-y-3">
          {activeDaysInMonth.length === 0 ? (
            <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-8 text-center text-xs text-[#8B8B8B]">
              No trades recorded in {monthName}.
            </div>
          ) : (
            activeDaysInMonth.map(({ dateStr, dayNum, trades: dayTrades, dayPnL }) => {
              const formattedDate = new Date(dateStr).toLocaleDateString('default', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });

              return (
                <div key={dateStr} className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#2B2B2B] pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-[#FF7A00] text-white px-2 py-0.5 rounded">
                        Day {dayNum}
                      </span>
                      <span className="text-xs font-bold text-white">{formattedDate}</span>
                      <span className="text-[10px] text-[#8B8B8B]">({dayTrades.length} trades)</span>
                    </div>

                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      dayPnL >= 0 ? 'bg-[#4CAF50]/15 text-[#4CAF50]' : 'bg-[#FF7A00]/15 text-[#FF7A00]'
                    }`}>
                      {dayPnL >= 0 ? '+' : ''}{currencySymbol}{dayPnL.toLocaleString()}
                    </span>
                  </div>

                  {/* Trades in this day */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {dayTrades.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onSelectTrade(t.id)}
                        className="bg-[#111111] border border-[#2A2A2A] hover:border-[#FF7A00] p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-xs">{t.pair}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              t.direction === 'LONG' ? 'bg-[#4CAF50]/20 text-[#4CAF50]' : 'bg-[#FF7A00]/20 text-[#FF7A00]'
                            }`}>
                              {t.direction}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8B8B8B] truncate mt-0.5">
                            RR 1:{t.rr} • {t.setup || 'No Setup'}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xs font-mono font-bold block ${
                            t.pnl >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'
                          }`}>
                            {t.pnl >= 0 ? '+' : ''}{currencySymbol}{t.pnl.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-[#8B8B8B] uppercase">{t.result}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Selected Day Trades Inspector Drawer / Detail Box */}
      {selectedDayDate && (
        <div className="bg-[#151515] border border-[#FF7A00]/40 rounded-[14px] p-4 sm:p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#FF7A00]" /> Trades on {selectedDayDate}
              </h4>
              <p className="text-[11px] sm:text-xs text-[#8B8B8B]">
                {selectedDayTrades.length === 0
                  ? 'No trades recorded on this date.'
                  : `${selectedDayTrades.length} positions recorded`}
              </p>
            </div>
            <button
              onClick={() => setSelectedDayDate(null)}
              className="text-xs text-[#8B8B8B] hover:text-white px-2.5 py-1 bg-[#202020] rounded border border-[#333333] cursor-pointer"
            >
              Close
            </button>
          </div>

          {selectedDayTrades.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#8B8B8B]">
              No trades logged for this specific day.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedDayTrades.map((trade) => (
                <div
                  key={trade.id}
                  onClick={() => onSelectTrade(trade.id)}
                  className="bg-[#111111] border border-[#2D2D2D] hover:border-[#FF7A00] p-3.5 rounded-xl transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-sm">{trade.pair}</span>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                        trade.result === 'Win'
                          ? 'bg-[#4CAF50] text-white'
                          : trade.result === 'Loss'
                          ? 'bg-[#FF7A00] text-white'
                          : 'bg-[#777777] text-white'
                      }`}
                    >
                      {trade.status === 'Ongoing' ? 'ONGOING' : trade.result}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#8B8B8B] font-mono">
                    <span>Dir: <strong className="text-white">{trade.direction}</strong></span>
                    <span>RR: <strong className="text-white">1:{trade.rr}</strong></span>
                    <span className={`font-bold ${trade.pnl >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{currencySymbol}{trade.pnl.toLocaleString()}
                    </span>
                  </div>

                  {trade.notes && (
                    <p className="text-[10px] text-[#777777] line-clamp-1 italic">
                      "{trade.notes}"
                    </p>
                  )}

                  <div className="pt-1 flex items-center justify-end text-[10px] text-[#FF7A00] font-bold gap-1 group-hover:translate-x-1 transition-transform">
                    View Full Analysis <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

