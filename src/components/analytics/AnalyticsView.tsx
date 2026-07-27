import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart2, 
  Flame, 
  Trophy, 
  Award, 
  Calendar as CalendarIcon, 
  TrendingDown, 
  PieChart as PieIcon 
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

import { Trade, RiskSettings } from '../../types';
import { calculateOverallStats, generateEquityCurveData, generateMonthlyPnlData } from '../../utils/calculations';

interface AnalyticsViewProps {
  trades: Trade[];
  riskSettings: RiskSettings;
  currencySymbol: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ trades, riskSettings, currencySymbol }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const stats = calculateOverallStats(trades, riskSettings);
  const equityData = generateEquityCurveData(trades, riskSettings.startingBalance);
  const monthlyData = generateMonthlyPnlData(trades);

  // Profit by Pair
  const pairPnlMap: Record<string, { pnl: number; count: number; wins: number }> = {};
  trades.filter(t => t.status === 'Closed').forEach(t => {
    if (!pairPnlMap[t.pair]) {
      pairPnlMap[t.pair] = { pnl: 0, count: 0, wins: 0 };
    }
    pairPnlMap[t.pair].pnl += t.pnl;
    pairPnlMap[t.pair].count += 1;
    if (t.result === 'Win') pairPnlMap[t.pair].wins += 1;
  });

  const pairData = Object.entries(pairPnlMap).map(([pair, val]) => ({
    pair,
    pnl: Math.round(val.pnl),
    winRate: Math.round((val.wins / val.count) * 100),
    trades: val.count,
  }));

  // Daily PnL for Calendar Heatmap
  const dailyPnlMap: Record<string, { pnl: number; trades: number }> = {};
  trades.filter(t => t.status === 'Closed').forEach(t => {
    const dayKey = t.date; // "YYYY-MM-DD"
    if (!dailyPnlMap[dayKey]) dailyPnlMap[dayKey] = { pnl: 0, trades: 0 };
    dailyPnlMap[dayKey].pnl += t.pnl;
    dailyPnlMap[dayKey].trades += 1;
  });

  // Calendar Day Generator for Selected Month
  const year = parseInt(selectedMonth.slice(0, 4));
  const month = parseInt(selectedMonth.slice(5, 7)) - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${selectedMonth}-${day < 10 ? '0' + day : day}`;
    calendarDays.push({
      day,
      dateStr,
      data: dailyPnlMap[dateStr] || { pnl: 0, trades: 0 },
    });
  }

  // Compact PnL formatting helper for mobile grid cells
  const formatCompactPnL = (num: number) => {
    const abs = Math.abs(num);
    const sign = num >= 0 ? '+' : '-';
    if (abs >= 10000) {
      return `${sign}${currencySymbol}${(abs / 1000).toFixed(1)}k`;
    }
    return `${sign}${currencySymbol}${abs.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Overview Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-4">
          <span className="text-[10px] text-[#8B8B8B] uppercase block mb-1">Avg Risk:Reward</span>
          <span className="text-xl font-bold text-[#FF7A00] font-mono">1 : {stats.avgRR}</span>
        </div>
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3 sm:p-4">
          <span className="text-[10px] sm:text-xs text-[#8B8B8B] uppercase block mb-0.5 sm:mb-1">Average Win</span>
          <span className="text-sm sm:text-lg lg:text-xl font-bold text-[#4CAF50] font-mono">{currencySymbol}{stats.avgWin}</span>
        </div>
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3 sm:p-4">
          <span className="text-[10px] sm:text-xs text-[#8B8B8B] uppercase block mb-0.5 sm:mb-1">Average Loss</span>
          <span className="text-sm sm:text-lg lg:text-xl font-bold text-[#FF7A00] font-mono">{currencySymbol}{stats.avgLoss}</span>
        </div>
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3 sm:p-4">
          <span className="text-[10px] sm:text-xs text-[#8B8B8B] uppercase block mb-0.5 sm:mb-1">Winning Streak</span>
          <span className="text-sm sm:text-lg lg:text-xl font-bold text-[#4CAF50] font-mono flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#4CAF50]" /> {stats.winningStreak}
          </span>
        </div>
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3 sm:p-4">
          <span className="text-[10px] sm:text-xs text-[#8B8B8B] uppercase block mb-0.5 sm:mb-1">Losing Streak</span>
          <span className="text-sm sm:text-lg lg:text-xl font-bold text-[#FF7A00] font-mono">{stats.losingStreak}</span>
        </div>
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3 sm:p-4">
          <span className="text-[10px] sm:text-xs text-[#8B8B8B] uppercase block mb-0.5 sm:mb-1">Best Pair</span>
          <span className="text-sm sm:text-lg lg:text-xl font-bold text-white font-mono">{stats.bestPair}</span>
        </div>
      </div>

      {/* Curves Section: Equity Curve & Drawdown Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Balance & Equity Curve */}
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-5 space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FF7A00]" /> Balance Growth Curve
          </h3>
          <div className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="trade" stroke="#666" tick={{ fill: '#8B8B8B', fontSize: 10 }} />
                <YAxis stroke="#666" tick={{ fill: '#8B8B8B', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#2D2D2D', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="balance" stroke="#4CAF50" strokeWidth={2} fill="#4CAF50" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drawdown Curve */}
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-5 space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-[#FF7A00]" /> Drawdown Trajectory (%)
          </h3>
          <div className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="trade" stroke="#666" tick={{ fill: '#8B8B8B', fontSize: 10 }} />
                <YAxis stroke="#666" tick={{ fill: '#8B8B8B', fontSize: 10 }} domain={[0, 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#2D2D2D', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="drawdown" stroke="#FF7A00" strokeWidth={2} fill="#FF7A00" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Profit by Pair & Monthly Profit Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit by Pair Bar Chart */}
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-5 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#FF7A00]" /> Profit Breakdown by Pair
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pairData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="pair" stroke="#666" tick={{ fill: '#8B8B8B', fontSize: 10 }} />
                <YAxis stroke="#666" tick={{ fill: '#8B8B8B', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#2D2D2D', borderRadius: '8px' }} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {pairData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#4CAF50' : '#FF7A00'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Performance Bar Chart */}
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-5 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#FF7A00]" /> Monthly PNL Chart
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="month" stroke="#666" tick={{ fill: '#8B8B8B', fontSize: 10 }} />
                <YAxis stroke="#666" tick={{ fill: '#8B8B8B', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#2D2D2D', borderRadius: '8px' }} />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#4CAF50' : '#FF7A00'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Monthly Trading Calendar Heatmap */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-5 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#FF7A00]" /> Monthly Performance Calendar
            </h3>
            <p className="text-[11px] sm:text-xs text-[#8B8B8B]">Daily PNL heatmap and trade frequency</p>
          </div>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] text-xs text-white px-3 py-1.5 rounded-lg outline-none font-mono cursor-pointer self-start sm:self-auto"
          />
        </div>

        {/* Calendar Grid Header (Days of week) */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-bold text-[#8B8B8B] uppercase border-b border-[#2D2D2D] pb-1.5">
          <span><span className="sm:hidden">S</span><span className="hidden sm:inline">Sun</span></span>
          <span><span className="sm:hidden">M</span><span className="hidden sm:inline">Mon</span></span>
          <span><span className="sm:hidden">T</span><span className="hidden sm:inline">Tue</span></span>
          <span><span className="sm:hidden">W</span><span className="hidden sm:inline">Wed</span></span>
          <span><span className="sm:hidden">T</span><span className="hidden sm:inline">Thu</span></span>
          <span><span className="sm:hidden">F</span><span className="hidden sm:inline">Fri</span></span>
          <span><span className="sm:hidden">S</span><span className="hidden sm:inline">Sat</span></span>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="bg-[#0c0c0e]/30 rounded-lg h-12 xs:h-14 sm:h-20" />;
            }

            const pnl = cell.data.pnl;
            const tradeCount = cell.data.trades;

            let bgColor = 'bg-[#111111] border-[#2D2D2D]';
            if (tradeCount > 0) {
              if (pnl > 0) bgColor = 'bg-[#4CAF50]/15 border-[#4CAF50]/40 text-[#4CAF50]';
              else if (pnl < 0) bgColor = 'bg-[#FF7A00]/15 border-[#FF7A00]/40 text-[#FF7A00]';
              else bgColor = 'bg-[#808080]/15 border-[#808080]/40 text-white';
            }

            return (
              <div
                key={cell.dateStr}
                className={`border p-1 sm:p-2 rounded-lg sm:rounded-xl h-12 xs:h-14 sm:h-20 flex flex-col justify-between transition-colors overflow-hidden ${bgColor}`}
              >
                <div className="flex items-center justify-between text-[9px] sm:text-[11px] font-mono text-[#8B8B8B]">
                  <span className="font-bold text-white">{cell.day}</span>
                  {tradeCount > 0 && <span className="text-[8px] sm:text-[9px] px-1 bg-black/40 rounded">{tradeCount}<span className="hidden sm:inline"> t</span></span>}
                </div>

                {tradeCount > 0 ? (
                  <div className="font-mono font-bold text-[9px] xs:text-[10px] sm:text-xs truncate text-right">
                    <span className="sm:hidden">{formatCompactPnL(pnl)}</span>
                    <span className="hidden sm:inline">{pnl >= 0 ? '+' : ''}{currencySymbol}{pnl.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="text-[8px] sm:text-[10px] text-[#666666] text-right hidden xs:block">No Trades</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
