import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  BarChart2, 
  ShieldAlert, 
  Scale, 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

import { Trade, RiskSettings, NavigationPage } from '../../types';
import { 
  calculateOverallStats, 
  generateEquityCurveData, 
  generateMonthlyPnlData 
} from '../../utils/calculations';

interface DashboardViewProps {
  trades: Trade[];
  riskSettings: RiskSettings;
  onNavigate: (page: NavigationPage) => void;
  onSelectTrade: (tradeId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  trades,
  riskSettings,
  onNavigate,
  onSelectTrade,
}) => {
  const stats = calculateOverallStats(trades, riskSettings);
  const equityData = generateEquityCurveData(trades, riskSettings.startingBalance);
  const monthlyData = generateMonthlyPnlData(trades);

  const winCount = trades.filter(t => t.result === 'Win').length;
  const lossCount = trades.filter(t => t.result === 'Loss').length;
  const beCount = trades.filter(t => t.result === 'Break Even').length;

  const winLossPieData = [
    { name: 'Win', value: winCount, color: '#4CAF50' },
    { name: 'Loss', value: lossCount, color: '#FF7A00' },
    { name: 'Break Even', value: beCount, color: '#808080' },
  ].filter(d => d.value > 0);

  const recentTrades = trades.slice(0, 10);

  // Check if current drawdown exceeds limit
  const isDrawdownAlert = stats.currentDrawdown > riskSettings.maxDrawdownPercent;

  return (
    <div className="space-y-6 pb-12">
      {/* Risk Alert Warning Banner if Drawdown exceeded */}
      {isDrawdownAlert && (
        <div className="bg-[#F44336]/10 border border-[#F44336]/40 rounded-[14px] p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F44336]/20 flex items-center justify-center text-[#F44336]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#F44336]">Risk Violation Warning</h4>
              <p className="text-xs text-[#B8B8B8]">
                Current drawdown ({stats.currentDrawdown}%) exceeds your max drawdown limit of {riskSettings.maxDrawdownPercent}%. Reduce risk exposure.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('risk')}
            className="px-4 py-2 bg-[#F44336] hover:bg-[#D32F2F] text-white text-xs font-bold rounded-lg transition-colors"
          >
            Adjust Risk Rules
          </button>
        </div>
      )}

      {/* 1. Summary Cards (Exactly 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Current Balance */}
        <div className="bg-[#151515] border border-[#2D2D2D] hover:border-[#1D1D1D] rounded-[14px] p-3.5 sm:p-5 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-xs text-[#8B8B8B] font-medium uppercase tracking-wider">Current Balance</span>
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF7A00]" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-bold text-white font-mono tracking-tight">
            {riskSettings.currencySymbol}{stats.currentBalance.toLocaleString()}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#8B8B8B] mt-0.5 sm:mt-1 truncate">
            Start: {riskSettings.currencySymbol}{riskSettings.startingBalance.toLocaleString()}
          </div>
        </div>

        {/* Card 2: Total Trades */}
        <div className="bg-[#151515] border border-[#2D2D2D] hover:border-[#1D1D1D] rounded-[14px] p-3.5 sm:p-5 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-xs text-[#8B8B8B] font-medium uppercase tracking-wider">Total Trades</span>
            <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A90E2]" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-bold text-white font-mono tracking-tight">
            {stats.totalTrades}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#8B8B8B] mt-0.5 sm:mt-1 truncate">
            Closed Positions
          </div>
        </div>

        {/* Card 3: Win Rate */}
        <div className="bg-[#151515] border border-[#2D2D2D] hover:border-[#1D1D1D] rounded-[14px] p-3.5 sm:p-5 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-xs text-[#8B8B8B] font-medium uppercase tracking-wider">Win Rate</span>
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4CAF50]" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-bold text-[#4CAF50] font-mono tracking-tight">
            {stats.winRate}%
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#8B8B8B] mt-0.5 sm:mt-1 truncate">
            {winCount}W / {lossCount}L
          </div>
        </div>

        {/* Card 4: Net Profit */}
        <div className="bg-[#151515] border border-[#2D2D2D] hover:border-[#1D1D1D] rounded-[14px] p-3.5 sm:p-5 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-xs text-[#8B8B8B] font-medium uppercase tracking-wider">Net Profit</span>
            <TrendingUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${stats.netProfit >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'}`} />
          </div>
          <div className={`text-base sm:text-xl lg:text-2xl font-bold font-mono tracking-tight ${stats.netProfit >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'}`}>
            {stats.netProfit >= 0 ? '+' : ''}{riskSettings.currencySymbol}{stats.netProfit.toLocaleString()}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#8B8B8B] mt-0.5 sm:mt-1 truncate">
            {stats.netProfitPercent >= 0 ? '+' : ''}{stats.netProfitPercent}% Return
          </div>
        </div>

        {/* Card 5: Current Drawdown */}
        <div className="bg-[#151515] border border-[#2D2D2D] hover:border-[#1D1D1D] rounded-[14px] p-3.5 sm:p-5 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-xs text-[#8B8B8B] font-medium uppercase tracking-wider">Drawdown</span>
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF7A00]" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-bold text-[#FF7A00] font-mono tracking-tight">
            {stats.currentDrawdown}%
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#8B8B8B] mt-0.5 sm:mt-1 truncate">
            Peak DD: {stats.maxDrawdown}%
          </div>
        </div>

        {/* Card 6: Profit Factor */}
        <div className="bg-[#151515] border border-[#2D2D2D] hover:border-[#1D1D1D] rounded-[14px] p-3.5 sm:p-5 transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-xs text-[#8B8B8B] font-medium uppercase tracking-wider">Profit Factor</span>
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFB366]" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-bold text-white font-mono tracking-tight">
            {stats.profitFactor}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#8B8B8B] mt-0.5 sm:mt-1 truncate">
            Win / Loss Ratio
          </div>
        </div>
      </div>

      {/* 2. Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Equity Curve (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-5">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Account Equity Curve</h3>
              <p className="text-[10px] sm:text-xs text-[#8B8B8B]">Cumulative account growth trajectory</p>
            </div>
            <div className="text-[10px] sm:text-xs font-mono text-[#FF7A00] font-bold">
              Peak: {riskSettings.currencySymbol}{Math.max(...equityData.map(d => d.balance)).toLocaleString()}
            </div>
          </div>
          <div className="h-52 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF7A00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="trade" stroke="#666666" tick={{ fill: '#8B8B8B', fontSize: 10 }} />
                <YAxis stroke="#666666" tick={{ fill: '#8B8B8B', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111111', borderColor: '#2D2D2D', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  formatter={(value: any) => [`${riskSettings.currencySymbol}${Number(value).toLocaleString()}`, 'Balance']}
                />
                <Area type="monotone" dataKey="balance" stroke="#FF7A00" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Win vs Loss Donut Chart */}
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-0.5">Win vs Loss Ratio</h3>
            <p className="text-[10px] sm:text-xs text-[#8B8B8B] mb-2 sm:mb-4">Distribution of completed trades</p>
          </div>
          <div className="h-44 sm:h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={winLossPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {winLossPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111111', borderColor: '#2D2D2D', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-lg sm:text-2xl font-bold text-white">{stats.winRate}%</span>
              <span className="block text-[9px] sm:text-[10px] text-[#8B8B8B] uppercase">Win Rate</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 sm:pt-3 border-t border-[#2D2D2D] text-center text-xs">
            <div>
              <span className="text-[#4CAF50] font-bold block text-xs sm:text-sm">{winCount}</span>
              <span className="text-[#8B8B8B] text-[9px] sm:text-[10px]">WINS</span>
            </div>
            <div>
              <span className="text-[#FF7A00] font-bold block text-xs sm:text-sm">{lossCount}</span>
              <span className="text-[#8B8B8B] text-[9px] sm:text-[10px]">LOSSES</span>
            </div>
            <div>
              <span className="text-[#808080] font-bold block text-xs sm:text-sm">{beCount}</span>
              <span className="text-[#8B8B8B] text-[9px] sm:text-[10px]">BREAK EVEN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly PnL Bar Chart */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-5">
        <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-0.5">Monthly PNL Performance</h3>
        <p className="text-[10px] sm:text-xs text-[#8B8B8B] mb-3 sm:mb-4">Net profit or loss grouped by month</p>
        <div className="h-48 sm:h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="month" stroke="#666666" tick={{ fill: '#8B8B8B', fontSize: 10 }} />
              <YAxis stroke="#666666" tick={{ fill: '#8B8B8B', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111111', borderColor: '#2D2D2D', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                formatter={(val: any) => [`${riskSettings.currencySymbol}${Number(val).toLocaleString()}`, 'PNL']}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#4CAF50' : '#FF7A00'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Recent Trades Table (Latest 10 Trades) */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Recent Executed Trades</h3>
            <p className="text-[10px] sm:text-xs text-[#8B8B8B]">Latest 10 logged trade positions</p>
          </div>
          <button
            onClick={() => onNavigate('journal')}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 bg-[#202020] hover:bg-[#2D2D2D] text-white text-[11px] sm:text-xs font-semibold rounded-lg transition-colors border border-[#343434] whitespace-nowrap shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#FF7A00]" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] sm:text-xs border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-[#111111] text-[#8B8B8B] uppercase border-b border-[#2D2D2D]">
                <th className="py-2.5 px-3">Pair</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Direction</th>
                <th className="py-2.5 px-3">Risk:Reward</th>
                <th className="py-2.5 px-3">PNL ($)</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D2D]">
              {recentTrades.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => onSelectTrade(t.id)}
                  className="hover:bg-[#1C1C1C] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-white font-mono">{t.pair}</td>
                  <td className="py-2.5 px-3 text-[#B8B8B8]">{t.date}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase ${
                        t.direction === 'Long'
                          ? 'bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30'
                          : 'bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30'
                      }`}
                    >
                      {t.direction}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-white font-mono">1 : {t.rr}</td>
                  <td className={`py-2.5 px-3 font-mono font-bold ${t.pnl >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'}`}>
                    {riskSettings.currencySymbol}{t.pnl.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${
                        t.result === 'Win'
                          ? 'bg-[#4CAF50] text-white'
                          : t.result === 'Loss'
                          ? 'bg-[#FF7A00] text-white'
                          : 'bg-[#202020] text-[#B8B8B8]'
                      }`}
                    >
                      {t.status === 'Ongoing' ? 'ONGOING' : t.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
