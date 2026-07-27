import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  Copy, 
  Trash2, 
  FileDown, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Images,
  History,
  Tag,
  CheckSquare,
  BarChart2
} from 'lucide-react';

import { Trade, TradeChecklist, NavigationPage, UserSettings } from '../../types';
import { generateOfflineAIReview } from '../../services/aiReview';
import { printTradePDF } from '../../services/export';
import { ImageSlider } from '../common/ImageSlider';
import { DEFAULT_CHECKLIST_ITEMS } from '../../services/db';

interface TradeDetailViewProps {
  trade: Trade;
  allTrades: Trade[];
  onBack: () => void;
  onEdit: (trade: Trade) => void;
  onDuplicate: (trade: Trade) => void;
  onDelete: (tradeId: string) => void;
  onSelectTrade: (tradeId: string) => void;
  onNavigate: (page: NavigationPage) => void;
  onUpdateTrade: (updatedTrade: Trade) => void;
  currencySymbol: string;
  userSettings?: UserSettings;
}

export const TradeDetailView: React.FC<TradeDetailViewProps> = ({
  trade,
  allTrades,
  onBack,
  onEdit,
  onDuplicate,
  onDelete,
  onSelectTrade,
  onNavigate,
  onUpdateTrade,
  currencySymbol,
  userSettings,
}) => {
  // Offline AI Review
  const aiReview = generateOfflineAIReview(trade);

  const activeItems = userSettings?.checklistItems && userSettings.checklistItems.length > 0
    ? userSettings.checklistItems
    : DEFAULT_CHECKLIST_ITEMS;

  const labelMap: Record<string, string> = {};
  DEFAULT_CHECKLIST_ITEMS.forEach((item) => { labelMap[item.id] = item.label; });
  activeItems.forEach((item) => { labelMap[item.id] = item.label; });

  const tradeChecklistKeys = Object.keys(trade.checklist || {});
  const allChecklistKeys = Array.from(
    new Set([...activeItems.map((i) => i.id), ...tradeChecklistKeys])
  );

  // Find previous and next trades for same pair or general timeline
  const pairTrades = allTrades.filter(t => t.pair === trade.pair);
  const currentIndex = pairTrades.findIndex(t => t.id === trade.id);
  const prevTrade = currentIndex > 0 ? pairTrades[currentIndex - 1] : null;
  const nextTrade = currentIndex >= 0 && currentIndex < pairTrades.length - 1 ? pairTrades[currentIndex + 1] : null;

  // Local checklist toggle
  const handleChecklistChange = (key: string) => {
    const updatedChecklist = {
      ...trade.checklist,
      [key]: !trade.checklist?.[key],
    };
    const updatedTrade: Trade = {
      ...trade,
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTrade(updatedTrade);
  };

  // Local psychology change
  const handlePsychologyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const updatedTrade: Trade = {
      ...trade,
      psychology: e.target.value as any,
      updatedAt: new Date().toISOString(),
    };
    onUpdateTrade(updatedTrade);
  };

  return (
    <div className="trade-detail-view space-y-6 pb-16">
      {/* Top Header Controls */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 bg-[#202020] hover:bg-[#2D2D2D] text-[#B8B8B8] hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-base sm:text-xl font-bold text-white font-mono">{trade.pair}</h2>
              <span
                className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold uppercase ${
                  trade.direction === 'Long'
                    ? 'bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30'
                    : 'bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30'
                }`}
              >
                {trade.direction}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold uppercase ${
                  trade.result === 'Win'
                    ? 'bg-[#4CAF50] text-white'
                    : trade.result === 'Loss'
                    ? 'bg-[#FF7A00] text-white'
                    : 'bg-[#808080] text-white'
                }`}
              >
                {trade.status === 'Ongoing' ? 'ONGOING' : trade.result}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#8B8B8B] mt-0.5">
              ID: <span className="font-mono text-white">#{trade.id}</span> | {trade.date} at {trade.time}
            </p>
          </div>
        </div>

        {/* Header Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onNavigate('gallery')}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#202020] hover:bg-[#2D2D2D] text-[#B8B8B8] hover:text-white rounded-lg text-[11px] sm:text-xs font-semibold transition-colors border border-[#343434]"
          >
            <Images className="w-3.5 h-3.5 text-[#FF7A00]" /> <span className="hidden xs:inline">Gallery</span>
          </button>
          <button
            onClick={() => printTradePDF(trade, currencySymbol)}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-[#202020] hover:bg-[#2D2D2D] text-[#B8B8B8] hover:text-white rounded-lg text-[11px] sm:text-xs font-semibold transition-colors border border-[#343434]"
          >
            <FileDown className="w-3.5 h-3.5 text-[#4CAF50]" /> <span className="hidden xs:inline">PDF</span>
          </button>
          <button
            onClick={() => onDuplicate(trade)}
            className="p-1.5 sm:p-2 bg-[#202020] hover:bg-[#2D2D2D] text-[#B8B8B8] hover:text-white rounded-lg text-xs transition-colors border border-[#343434]"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => onEdit(trade)}
            className="flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[#FF7A00] hover:bg-[#FF8E26] text-white rounded-lg text-[11px] sm:text-xs font-bold transition-all shadow-md shadow-[#FF7A00]/20"
          >
            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Edit
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Delete trade #${trade.id}?`)) onDelete(trade.id);
            }}
            className="p-1.5 sm:p-2 bg-[#202020] hover:bg-[#D32F2F] text-[#F44336] hover:text-white rounded-lg text-xs transition-colors border border-[#343434]"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Trade Summary Single Card */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF7A00]/15 flex items-center justify-center text-[#FF7A00] border border-[#FF7A00]/30">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Trade Execution & Financial Summary
              </h3>
              <p className="text-[11px] text-[#8B8B8B]">Complete execution metrics, risk parameters, and balance impact</p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#8B8B8B]">Status:</span>
            <span className={`font-bold px-2.5 py-0.5 rounded text-[11px] uppercase ${
              trade.status === 'Ongoing'
                ? 'bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30'
                : 'bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30'
            }`}>
              {trade.status}
            </span>
          </div>
        </div>

        {/* 3 Logical Metric Sections inside 1 Single Card Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: Price Levels */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-wider border-b border-[#262626] pb-2 flex items-center justify-between">
              <span>Price Levels</span>
              <span className="text-[10px] text-[#8B8B8B] font-mono font-normal">Execution</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#8B8B8B] uppercase block">Entry Price</span>
                <span className="text-sm font-bold text-white block mt-0.5">{trade.entryPrice}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8B8B8B] uppercase block">Exit Price</span>
                <span className="text-sm font-bold text-white block mt-0.5">{trade.exitPrice ?? 'Ongoing'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#FF7A00] uppercase block">Stop Loss</span>
                <span className="text-sm font-bold text-[#FF7A00] block mt-0.5">{trade.stopLoss}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#4CAF50] uppercase block">Take Profit</span>
                <span className="text-sm font-bold text-[#4CAF50] block mt-0.5">{trade.takeProfit}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Risk & Reward */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-wider border-b border-[#262626] pb-2 flex items-center justify-between">
              <span>Risk & Reward</span>
              <span className="text-[10px] text-[#8B8B8B] font-mono font-normal">Ratios</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#8B8B8B] uppercase block">Risk %</span>
                <span className="text-sm font-bold text-white block mt-0.5">{trade.riskPercent}%</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8B8B8B] uppercase block">Risk : Reward</span>
                <span className="text-sm font-bold text-[#FF7A00] block mt-0.5">1 : {trade.rr}</span>
              </div>
              <div className="col-span-2 pt-1">
                <span className="text-[10px] text-[#8B8B8B] uppercase block">Holding Time</span>
                <span className="text-sm font-bold text-white block mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF7A00]" /> {trade.holdingTime || '3h 15m'}
                </span>
              </div>
            </div>
          </div>

          {/* Column 3: Financial & Balance Impact */}
          <div className="bg-[#111111] border border-[#262626] rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-bold text-[#FF7A00] uppercase tracking-wider border-b border-[#262626] pb-2 flex items-center justify-between">
              <span>Financial Impact</span>
              <span className="text-[10px] text-[#8B8B8B] font-mono font-normal">Account</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="col-span-2 bg-[#171717] p-2.5 rounded-lg border border-[#2D2D2D]">
                <span className="text-[10px] text-[#8B8B8B] uppercase block">PnL ($) / (%)</span>
                <span className={`text-base font-bold block mt-0.5 ${trade.pnl >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'}`}>
                  {currencySymbol}{trade.pnl.toLocaleString()} <span className="text-xs font-normal">({trade.pnlPercent >= 0 ? '+' : ''}{trade.pnlPercent}%)</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8B8B8B] uppercase block">Balance Before</span>
                <span className="text-xs font-bold text-[#B8B8B8] block mt-0.5">{currencySymbol}{trade.balanceBefore?.toLocaleString() ?? '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8B8B8B] uppercase block">Balance After</span>
                <span className="text-xs font-bold text-white block mt-0.5">{currencySymbol}{trade.balanceAfter?.toLocaleString() ?? '-'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Before vs After Comparison Section */}
      <ImageSlider
        beforeImg={trade.screenshotBefore}
        afterImg={trade.screenshotAfter}
        pairName={trade.pair}
      />

      {/* Grid Layout: Offline AI Review & Trading Psychology / Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule-Based Offline AI Review Card */}
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF7A00]/20 flex items-center justify-center text-[#FF7A00]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Trade Performance Review</h3>
                <p className="text-[11px] text-[#8B8B8B]">Automated rule-based diagnostic breakdown</p>
              </div>
            </div>
            <div className="bg-[#202020] border border-[#343434] px-3 py-1 rounded-lg text-xs font-mono font-bold text-[#FF7A00]">
              Score: {aiReview.overallScore} / 100
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* Strengths */}
            <div>
              <h4 className="font-bold text-[#4CAF50] flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Key Strengths
              </h4>
              <ul className="space-y-1 pl-5 list-disc text-[#B8B8B8]">
                {aiReview.strengths.map((s, idx) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            {aiReview.weaknesses.length > 0 && (
              <div>
                <h4 className="font-bold text-[#FF7A00] flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" /> Areas for Improvement
                </h4>
                <ul className="space-y-1 pl-5 list-disc text-[#B8B8B8]">
                  {aiReview.weaknesses.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            <div>
              <h4 className="font-bold text-[#4A90E2] flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" /> Actionable Suggestions
              </h4>
              <ul className="space-y-1 pl-5 list-disc text-[#B8B8B8]">
                {aiReview.suggestions.map((sug, idx) => (
                  <li key={idx}>{sug}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Psychology & Interactive Checklist */}
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-5 space-y-4">
          {/* Psychology Dropdown */}
          <div className="border-b border-[#2D2D2D] pb-3">
            <label className="block text-xs text-[#8B8B8B] uppercase font-bold mb-1.5">
              Trading Psychology State
            </label>
            <select
              value={trade.psychology}
              onChange={handlePsychologyChange}
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-xs text-white outline-none font-semibold"
            >
              <option value="Calm">Calm (Disciplined & Focused)</option>
              <option value="Confident">Confident</option>
              <option value="Fear">Fear (Hesitant)</option>
              <option value="Greed">Greed (Over-extended TP)</option>
              <option value="FOMO">FOMO (Chasing Candles)</option>
              <option value="Revenge">Revenge Trade</option>
              <option value="Impatient">Impatient</option>
              <option value="Tired">Tired</option>
            </select>
          </div>

          {/* Interactive Checklist */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-[#FF7A00]" /> Trading Checklist Verification
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#B8B8B8]">
              {allChecklistKeys.map((key) => {
                const label = labelMap[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                const isChecked = Boolean(trade.checklist?.[key]);
                return (
                  <label
                    key={key}
                    onClick={() => handleChecklistChange(key)}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      isChecked
                        ? 'bg-[#4CAF50]/10 border-[#4CAF50]/30 text-white'
                        : 'bg-[#111111] border-[#2D2D2D] text-[#8B8B8B]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={isChecked}
                      className="accent-[#FF7A00] w-4 h-4 cursor-pointer"
                    />
                    <span>{label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Analysis Parameters & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Confluence Badges */}
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-[#FF7A00]" /> Technical Confluences & Strategy
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-[#111111] p-2.5 rounded-lg border border-[#2D2D2D]">
              <span className="text-[10px] text-[#8B8B8B] block uppercase">Session</span>
              <span className="font-bold text-white">{trade.analysis?.session || 'London'}</span>
            </div>
            <div className="bg-[#111111] p-2.5 rounded-lg border border-[#2D2D2D]">
              <span className="text-[10px] text-[#8B8B8B] block uppercase">Market Structure</span>
              <span className="font-bold text-white">{trade.analysis?.marketStructure || 'BOS'}</span>
            </div>
            <div className="bg-[#111111] p-2.5 rounded-lg border border-[#2D2D2D]">
              <span className="text-[10px] text-[#8B8B8B] block uppercase">Strategy</span>
              <span className="font-bold text-white">{trade.analysis?.strategy || 'Order Block'}</span>
            </div>
            <div className="bg-[#111111] p-2.5 rounded-lg border border-[#2D2D2D]">
              <span className="text-[10px] text-[#8B8B8B] block uppercase">News Impact</span>
              <span className="font-bold text-white">{trade.analysis?.newsImpact || 'Low'}</span>
            </div>
            <div className="bg-[#111111] p-2.5 rounded-lg border border-[#2D2D2D] col-span-2">
              <span className="text-[10px] text-[#8B8B8B] block uppercase">Primary Confluence</span>
              <span className="font-bold text-white">{trade.analysis?.confluence || 'Key level rejection'}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-5 space-y-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Trader Notes</h3>
          <p className="text-xs text-[#B8B8B8] leading-relaxed whitespace-pre-wrap bg-[#111111] p-3 rounded-lg border border-[#2D2D2D] min-h-[100px]">
            {trade.notes || 'No detailed notes logged.'}
          </p>
        </div>
      </div>

      {/* Edit History Timeline & Related Trades Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit History Log */}
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-[#FF7A00]" /> Audit & Edit History
          </h3>
          <div className="space-y-2 text-xs">
            {trade.editHistory && trade.editHistory.length > 0 ? (
              trade.editHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-[#111111] p-2.5 rounded-lg border border-[#2D2D2D]">
                  <span className="font-semibold text-white">{item.action}</span>
                  <span className="text-[11px] text-[#8B8B8B] font-mono">{item.timestamp}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8B8B8B]">Trade logged at {trade.createdAt?.slice(0, 10)}</p>
            )}
          </div>
        </div>

        {/* Related Trades Direct Navigation */}
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Related Pair Trades ({trade.pair})</h3>
            <p className="text-xs text-[#8B8B8B]">Seamlessly cycle between previous and next trades for {trade.pair}</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            {prevTrade ? (
              <button
                onClick={() => onSelectTrade(prevTrade.id)}
                className="flex-1 flex items-center gap-2 p-3 bg-[#111111] hover:bg-[#202020] border border-[#2D2D2D] rounded-xl text-xs text-left transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#FF7A00]" />
                <div>
                  <span className="text-[10px] text-[#8B8B8B] block">PREVIOUS TRADE</span>
                  <span className="font-bold text-white font-mono">#{prevTrade.id} ({prevTrade.date})</span>
                </div>
              </button>
            ) : (
              <div className="flex-1 p-3 bg-[#111111] border border-[#2D2D2D] rounded-xl text-xs text-[#666666]">
                No earlier trade for {trade.pair}
              </div>
            )}

            {nextTrade ? (
              <button
                onClick={() => onSelectTrade(nextTrade.id)}
                className="flex-1 flex items-center justify-end gap-2 p-3 bg-[#111111] hover:bg-[#202020] border border-[#2D2D2D] rounded-xl text-xs text-right transition-colors"
              >
                <div>
                  <span className="text-[10px] text-[#8B8B8B] block">NEXT TRADE</span>
                  <span className="font-bold text-white font-mono">#{nextTrade.id} ({nextTrade.date})</span>
                </div>
                <ChevronRight className="w-5 h-5 text-[#FF7A00]" />
              </button>
            ) : (
              <div className="flex-1 p-3 bg-[#111111] border border-[#2D2D2D] rounded-xl text-xs text-[#666666] text-right">
                Latest trade for {trade.pair}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
