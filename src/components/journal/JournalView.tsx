import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Copy, 
  Edit3, 
  ArrowUpDown, 
  FileText,
  SlidersHorizontal,
  Calendar,
  Table
} from 'lucide-react';
import { Trade, TradeDirection, TradeResult, TradeStatus } from '../../types';
import { JournalCalendarView } from './JournalCalendarView';

interface JournalViewProps {
  trades: Trade[];
  onSelectTrade: (tradeId: string) => void;
  onOpenAddModal: (tradeToEdit?: Trade) => void;
  onDuplicateTrade: (trade: Trade) => void;
  onDeleteTrade: (tradeId: string) => void;
  currencySymbol: string;
}

export const JournalView: React.FC<JournalViewProps> = ({
  trades,
  onSelectTrade,
  onOpenAddModal,
  onDuplicateTrade,
  onDeleteTrade,
  currencySymbol,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterPair, setFilterPair] = useState<string>('ALL');
  const [filterDirection, setFilterDirection] = useState<string>('ALL');
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'date' | 'pnl' | 'rr' | 'pair'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Extract unique pairs
  const uniquePairs = Array.from(new Set(trades.map(t => t.pair)));

  // Filter logic
  const filteredTrades = trades.filter((t) => {
    const matchesSearch =
      t.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.analysis?.strategy || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPair = filterPair === 'ALL' || t.pair === filterPair;
    const matchesDirection = filterDirection === 'ALL' || t.direction === filterDirection;
    const matchesResult = filterResult === 'ALL' || t.result === filterResult;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;

    return matchesSearch && matchesPair && matchesDirection && matchesResult && matchesStatus;
  });

  // Sort logic
  const sortedTrades = [...filteredTrades].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') {
      comparison = new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    } else if (sortField === 'pnl') {
      comparison = a.pnl - b.pnl;
    } else if (sortField === 'rr') {
      comparison = a.rr - b.rr;
    } else if (sortField === 'pair') {
      comparison = a.pair.localeCompare(b.pair);
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const toggleSort = (field: 'date' | 'pnl' | 'rr' | 'pair') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Export filtered trades to CSV
  const handleExportCSV = () => {
    if (sortedTrades.length === 0) return;
    const headers = ['ID', 'Pair', 'Date', 'Time', 'Direction', 'Status', 'Entry', 'StopLoss', 'TakeProfit', 'RR', 'RiskPercent', 'PNL', 'Result', 'Strategy', 'Notes'];
    const rows = sortedTrades.map((t) => [
      t.id,
      t.pair,
      t.date,
      t.time || '',
      t.direction,
      t.status,
      t.entryPrice,
      t.stopLoss,
      t.takeProfit,
      t.rr,
      t.riskPercent,
      t.pnl,
      t.result,
      `"${(t.analysis?.strategy || '').replace(/"/g, '""')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trading_journal_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Controls & Filters Bar */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-5 space-y-3 sm:space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">Trading Journal Ledger</h3>
            <p className="text-[10px] sm:text-xs text-[#8B8B8B]">Showing {sortedTrades.length} of {trades.length} recorded positions</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Table vs Calendar */}
            <div className="flex items-center bg-[#111111] border border-[#2D2D2D] p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#FF7A00] text-white shadow-sm'
                    : 'text-[#8B8B8B] hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Ledger Table</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-[#FF7A00] text-white shadow-sm'
                    : 'text-[#8B8B8B] hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendar View</span>
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-[#202020] hover:bg-[#2D2D2D] text-[#B8B8B8] hover:text-white font-semibold text-xs rounded-lg transition-colors border border-[#343434] cursor-pointer hidden sm:block"
              title="Export filtered trades to CSV"
            >
              Export CSV
            </button>
            <button
              onClick={() => onOpenAddModal()}
              className="flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#FF8E26] text-white font-bold text-[11px] sm:text-xs px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg transition-all shadow-md shadow-[#FF7A00]/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add New Trade
            </button>
          </div>
        </div>

        {/* Quick Filter Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-[#8B8B8B] uppercase font-bold mr-1">Presets:</span>
          {[
            { label: 'All', onClick: () => { setFilterResult('ALL'); setFilterDirection('ALL'); setFilterStatus('ALL'); } },
            { label: 'Wins Only', onClick: () => { setFilterResult('Win'); setFilterDirection('ALL'); setFilterStatus('ALL'); } },
            { label: 'Losses Only', onClick: () => { setFilterResult('Loss'); setFilterDirection('ALL'); setFilterStatus('ALL'); } },
            { label: 'Longs', onClick: () => { setFilterDirection('Long'); setFilterResult('ALL'); setFilterStatus('ALL'); } },
            { label: 'Shorts', onClick: () => { setFilterDirection('Short'); setFilterResult('ALL'); setFilterStatus('ALL'); } },
            { label: 'Ongoing', onClick: () => { setFilterStatus('Ongoing'); setFilterResult('ALL'); setFilterDirection('ALL'); } },
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={preset.onClick}
              className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] hover:text-white text-[#8B8B8B] text-[10px] font-semibold rounded-lg border border-[#2D2D2D] transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Search & Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-[#2D2D2D]">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pair, notes, strategy..."
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#777777] outline-none"
            />
          </div>

          {/* Filter Pair */}
          <div>
            <select
              value={filterPair}
              onChange={(e) => setFilterPair(e.target.value)}
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-xs text-white outline-none"
            >
              <option value="ALL">All Pairs ({uniquePairs.length})</option>
              {uniquePairs.map((pair) => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
          </div>

          {/* Filter Direction */}
          <div>
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value)}
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-xs text-white outline-none"
            >
              <option value="ALL">All Directions</option>
              <option value="Long">Long Positions</option>
              <option value="Short">Short Positions</option>
            </select>
          </div>

          {/* Filter Result */}
          <div>
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-xs text-white outline-none"
            >
              <option value="ALL">All Outcomes</option>
              <option value="Win">Win</option>
              <option value="Loss">Loss</option>
              <option value="Break Even">Break Even</option>
              <option value="Pending">Pending / Ongoing</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-xs text-white outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Journal View Body */}
      {viewMode === 'calendar' ? (
        <JournalCalendarView
          trades={sortedTrades}
          onSelectTrade={onSelectTrade}
          onOpenAddModal={onOpenAddModal}
          currencySymbol={currencySymbol}
        />
      ) : (
        /* Main Journal Table */
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] sm:text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#111111] text-[#8B8B8B] uppercase border-b border-[#2D2D2D] select-none">
                <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('pair')}>
                  <div className="flex items-center gap-1">Pair <ArrowUpDown className="w-3 h-3 text-[#FF7A00]" /></div>
                </th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('date')}>
                  <div className="flex items-center gap-1">Date & Time <ArrowUpDown className="w-3 h-3 text-[#FF7A00]" /></div>
                </th>
                <th className="py-2.5 px-3">Direction</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Entry</th>
                <th className="py-2.5 px-3">Stop Loss</th>
                <th className="py-2.5 px-3">Take Profit</th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('rr')}>
                  <div className="flex items-center gap-1">RR <ArrowUpDown className="w-3 h-3 text-[#FF7A00]" /></div>
                </th>
                <th className="py-2.5 px-3">Risk %</th>
                <th className="py-2.5 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('pnl')}>
                  <div className="flex items-center gap-1">PNL ($) <ArrowUpDown className="w-3 h-3 text-[#FF7A00]" /></div>
                </th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D2D]">
              {sortedTrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-[#8B8B8B]">
                    No trades match your search filter criteria.
                  </td>
                </tr>
              ) : (
                sortedTrades.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-[#1C1C1C] transition-colors group cursor-pointer"
                    onClick={() => onSelectTrade(t.id)}
                  >
                    <td className="py-2.5 px-3 font-bold text-white font-mono">{t.pair}</td>
                    <td className="py-2.5 px-3 text-[#B8B8B8] font-mono">
                      {t.date} <span className="text-[#666666] text-[9px]">{t.time}</span>
                    </td>
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
                    <td className="py-2.5 px-3 text-[#B8B8B8]">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold ${t.status === 'Ongoing' ? 'bg-[#4A90E2]/20 text-[#4A90E2]' : 'bg-[#202020] text-[#9E9E9E]'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-white font-mono">{t.entryPrice}</td>
                    <td className="py-2.5 px-3 text-[#FF7A00] font-mono">{t.stopLoss}</td>
                    <td className="py-2.5 px-3 text-[#4CAF50] font-mono">{t.takeProfit}</td>
                    <td className="py-2.5 px-3 text-white font-mono font-bold">1 : {t.rr}</td>
                    <td className="py-2.5 px-3 text-[#B8B8B8] font-mono">{t.riskPercent}%</td>
                    <td className={`py-2.5 px-3 font-mono font-bold ${t.pnl >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'}`}>
                      {currencySymbol}{t.pnl.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${
                          t.result === 'Win'
                            ? 'bg-[#4CAF50] text-white'
                            : t.result === 'Loss'
                            ? 'bg-[#FF7A00] text-white'
                            : 'bg-[#808080] text-white'
                        }`}
                      >
                        {t.status === 'Ongoing' ? 'ONGOING' : t.result}
                      </span>
                    </td>

                    {/* Quick Row Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Open Detail Page"
                          onClick={() => onSelectTrade(t.id)}
                          className="p-1.5 text-[#8B8B8B] hover:text-[#FF7A00] hover:bg-[#202020] rounded transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Edit Trade"
                          onClick={() => onOpenAddModal(t)}
                          className="p-1.5 text-[#8B8B8B] hover:text-white hover:bg-[#202020] rounded transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Duplicate Trade"
                          onClick={() => onDuplicateTrade(t)}
                          className="p-1.5 text-[#8B8B8B] hover:text-[#4A90E2] hover:bg-[#202020] rounded transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete Trade"
                          onClick={() => {
                            if (window.confirm(`Delete trade #${t.id} (${t.pair})?`)) {
                              onDeleteTrade(t.id);
                            }
                          }}
                          className="p-1.5 text-[#8B8B8B] hover:text-[#F44336] hover:bg-[#202020] rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
};
