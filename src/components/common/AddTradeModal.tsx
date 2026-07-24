import React, { useState, useEffect } from 'react';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import { Trade, TradeDirection, TradeStatus, PsychologyState, TradeChecklist } from '../../types';
import { calculateRR, calculateTradePnL } from '../../utils/calculations';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Trade) => void;
  initialTrade?: Trade | null;
  currentBalance: number;
  currencySymbol: string;
}

export const AddTradeModal: React.FC<AddTradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTrade,
  currentBalance,
  currencySymbol,
}) => {
  const [pair, setPair] = useState<string>('EUR/USD');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>(new Date().toTimeString().slice(0, 5));
  const [direction, setDirection] = useState<TradeDirection>('Long');
  const [status, setStatus] = useState<TradeStatus>('Closed');
  
  const [entryPrice, setEntryPrice] = useState<string>('1.0850');
  const [stopLoss, setStopLoss] = useState<string>('1.0820');
  const [takeProfit, setTakeProfit] = useState<string>('1.0910');
  const [exitPrice, setExitPrice] = useState<string>('1.0910');
  const [riskPercent, setRiskPercent] = useState<string>('1.0');

  const [strategy, setStrategy] = useState<string>('Order Block Sweep');
  const [session, setSession] = useState<string>('London');
  const [psychology, setPsychology] = useState<PsychologyState>('Calm');
  const [notes, setNotes] = useState<string>('');

  const [screenshotBefore, setScreenshotBefore] = useState<string | undefined>(undefined);
  const [screenshotAfter, setScreenshotAfter] = useState<string | undefined>(undefined);

  const [checklist, setChecklist] = useState<TradeChecklist>({
    trendConfirmed: true,
    entryAccordingPlan: true,
    rrMin1to2: true,
    riskCalculated: true,
    newsChecked: true,
    liquidityChecked: true,
    supportResistanceConfirmed: true,
    noFomo: true,
    noRevengeTrade: true,
    noOvertrade: true,
  });

  // Populate form if editing an existing trade
  useEffect(() => {
    if (initialTrade) {
      setPair(initialTrade.pair);
      setDate(initialTrade.date);
      setTime(initialTrade.time || '12:00');
      setDirection(initialTrade.direction);
      setStatus(initialTrade.status);
      setEntryPrice(initialTrade.entryPrice.toString());
      setStopLoss(initialTrade.stopLoss.toString());
      setTakeProfit(initialTrade.takeProfit.toString());
      setExitPrice(initialTrade.exitPrice ? initialTrade.exitPrice.toString() : '');
      setRiskPercent(initialTrade.riskPercent.toString());
      setStrategy(initialTrade.analysis?.strategy || 'Order Block');
      setSession(initialTrade.analysis?.session || 'London');
      setPsychology(initialTrade.psychology || 'Calm');
      setNotes(initialTrade.notes || '');
      setScreenshotBefore(initialTrade.screenshotBefore);
      setScreenshotAfter(initialTrade.screenshotAfter);
      if (initialTrade.checklist) setChecklist(initialTrade.checklist);
    } else {
      // Default reset
      setPair('EUR/USD');
      setDate(new Date().toISOString().slice(0, 10));
      setTime(new Date().toTimeString().slice(0, 5));
      setDirection('Long');
      setStatus('Closed');
      setEntryPrice('1.0850');
      setStopLoss('1.0820');
      setTakeProfit('1.0910');
      setExitPrice('1.0910');
      setRiskPercent('1.0');
      setNotes('');
      setScreenshotBefore(undefined);
      setScreenshotAfter(undefined);
    }
  }, [initialTrade, isOpen]);

  // Derived auto-calculations
  const numEntry = parseFloat(entryPrice) || 0;
  const numSL = parseFloat(stopLoss) || 0;
  const numTP = parseFloat(takeProfit) || 0;
  const numExit = exitPrice ? parseFloat(exitPrice) : undefined;
  const numRisk = parseFloat(riskPercent) || 1.0;

  const autoRR = calculateRR(numEntry, numSL, numTP, direction);
  const pnlCalc = status === 'Closed'
    ? calculateTradePnL(numEntry, numExit ?? numTP, numSL, numTP, direction, numRisk, currentBalance)
    : { pnl: 0, pnlPercent: 0, result: 'Pending' as const };

  const distSL = numEntry && numSL ? Math.abs(numEntry - numSL).toFixed(4) : '0';
  const distTP = numEntry && numTP ? Math.abs(numTP - numEntry).toFixed(4) : '0';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (target === 'before') setScreenshotBefore(result);
      else setScreenshotAfter(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tradeId = initialTrade ? initialTrade.id : `trd-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const updatedTrade: Trade = {
      id: tradeId,
      pair: pair.trim().toUpperCase() || 'BTC/USDT',
      date,
      time,
      direction,
      status,
      entryPrice: numEntry,
      stopLoss: numSL,
      takeProfit: numTP,
      exitPrice: status === 'Closed' ? (numExit ?? numTP) : undefined,
      riskPercent: numRisk,
      riskAmount: (currentBalance * numRisk) / 100,
      pnl: pnlCalc.pnl,
      pnlPercent: pnlCalc.pnlPercent,
      rr: autoRR,
      result: status === 'Closed' ? pnlCalc.result : 'Pending',
      balanceBefore: currentBalance,
      balanceAfter: status === 'Closed' ? currentBalance + pnlCalc.pnl : currentBalance,
      notes,
      screenshotBefore,
      screenshotAfter,
      psychology,
      checklist,
      analysis: {
        trend: direction === 'Long' ? 'Uptrend' : 'Downtrend',
        session,
        marketStructure: 'BOS',
        breakout: true,
        pullback: true,
        liquidity: true,
        orderBlock: true,
        supportResistance: true,
        confluence: strategy,
        newsImpact: 'Low',
        strategy,
        tags: [pair, direction, strategy].filter(Boolean),
      },
      editHistory: [
        ...(initialTrade?.editHistory || []),
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          action: initialTrade ? 'Trade Updated' : 'Trade Created',
          details: `Entry ${numEntry}, SL ${numSL}, TP ${numTP}`,
        },
      ],
      createdAt: initialTrade?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    onSave(updatedTrade);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[16px] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-[#2D2D2D] flex items-center justify-between bg-[#111111]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {initialTrade ? 'Edit Trade Record' : 'Record New Trade'}
            </h3>
            <p className="text-[10px] sm:text-xs text-[#8B8B8B]">Enter position details, risk metrics & chart analysis</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8B8B8B] hover:text-white hover:bg-[#202020] transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Row 1: Pair, Date, Time, Direction, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Pair / Instrument</label>
              <input
                type="text"
                required
                value={pair}
                onChange={(e) => setPair(e.target.value)}
                placeholder="EUR/USD, BTC/USDT..."
                className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white outline-none uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Time</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Direction</label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#111111] border border-[#2D2D2D] rounded-lg">
                <button
                  type="button"
                  onClick={() => setDirection('Long')}
                  className={`py-1 rounded text-xs font-bold transition-colors ${
                    direction === 'Long'
                      ? 'bg-[#4CAF50] text-white shadow'
                      : 'text-[#8B8B8B] hover:text-white'
                  }`}
                >
                  LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('Short')}
                  className={`py-1 rounded text-xs font-bold transition-colors ${
                    direction === 'Short'
                      ? 'bg-[#FF7A00] text-white shadow'
                      : 'text-[#8B8B8B] hover:text-white'
                  }`}
                >
                  SHORT
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Trade Status</label>
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#111111] border border-[#2D2D2D] rounded-lg">
                <button
                  type="button"
                  onClick={() => setStatus('Ongoing')}
                  className={`py-1 rounded text-xs font-bold transition-colors ${
                    status === 'Ongoing'
                      ? 'bg-[#4A90E2] text-white shadow'
                      : 'text-[#8B8B8B] hover:text-white'
                  }`}
                >
                  Ongoing
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Closed')}
                  className={`py-1 rounded text-xs font-bold transition-colors ${
                    status === 'Closed'
                      ? 'bg-[#202020] text-white border border-[#343434]'
                      : 'text-[#8B8B8B] hover:text-white'
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Entry, SL, TP, Exit, Risk % */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-[#111111] p-4 rounded-xl border border-[#2D2D2D]">
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Entry Price</label>
              <input
                type="number"
                step="any"
                required
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-[#151515] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium text-[#FF7A00]">Stop Loss (SL)</label>
              <input
                type="number"
                step="any"
                required
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-[#151515] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium text-[#4CAF50]">Take Profit (TP)</label>
              <input
                type="number"
                step="any"
                required
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-[#151515] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">
                Exit Price {status === 'Ongoing' && '(Optional)'}
              </label>
              <input
                type="number"
                step="any"
                disabled={status === 'Ongoing'}
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder={status === 'Ongoing' ? 'Active Trade' : 'Exit price'}
                className="w-full bg-[#151515] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none disabled:opacity-40"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Risk %</label>
              <input
                type="number"
                step="0.1"
                required
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
                className="w-full bg-[#151515] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
              />
            </div>
          </div>

          {/* Calculated Auto Badges Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0A0A0A] p-3 rounded-xl border border-[#2D2D2D] text-xs">
            <div>
              <span className="text-[#8B8B8B] block">Calculated RR:</span>
              <span className="font-bold text-[#FF7A00] text-sm font-mono">1 : {autoRR}</span>
            </div>
            <div>
              <span className="text-[#8B8B8B] block">Distance SL / TP:</span>
              <span className="font-semibold text-white font-mono">{distSL} / {distTP}</span>
            </div>
            <div>
              <span className="text-[#8B8B8B] block">Est. PNL ($):</span>
              <span className={`font-bold text-sm font-mono ${pnlCalc.pnl >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'}`}>
                {currencySymbol}{pnlCalc.pnl.toLocaleString()} ({pnlCalc.pnlPercent}%)
              </span>
            </div>
            <div>
              <span className="text-[#8B8B8B] block">Result Status:</span>
              <span className="font-bold text-white uppercase">{status === 'Closed' ? pnlCalc.result : 'ONGOING'}</span>
            </div>
          </div>

          {/* Row 3: Strategy, Session, Psychology */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Strategy / Setup</label>
              <input
                type="text"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                placeholder="e.g. Order Block, Liquidity Sweep"
                className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Trading Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white outline-none"
              >
                <option value="Asian">Asian Session</option>
                <option value="London">London Session</option>
                <option value="New York">New York Session</option>
                <option value="London/NY Overlap">London / NY Overlap</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Trading Psychology</label>
              <select
                value={psychology}
                onChange={(e) => setPsychology(e.target.value as PsychologyState)}
                className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white outline-none"
              >
                <option value="Calm">Calm (Disciplined)</option>
                <option value="Confident">Confident</option>
                <option value="Fear">Fear</option>
                <option value="Greed">Greed</option>
                <option value="FOMO">FOMO (Chasing)</option>
                <option value="Revenge">Revenge Trade</option>
                <option value="Impatient">Impatient</option>
                <option value="Tired">Tired</option>
              </select>
            </div>
          </div>

          {/* Row 4: Interactive Checklist */}
          <div className="bg-[#111111] border border-[#2D2D2D] rounded-xl p-4">
            <h4 className="text-xs font-bold text-[#FF7A00] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Pre-Entry Checklist
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-[#B8B8B8]">
              {Object.entries({
                trendConfirmed: 'Trend Confirmed',
                entryAccordingPlan: 'Entry According Plan',
                rrMin1to2: 'RR ≥ 1:2',
                riskCalculated: 'Risk Calculated',
                newsChecked: 'News Checked',
                liquidityChecked: 'Liquidity Checked',
                supportResistanceConfirmed: 'Support/Resistance Confirmed',
                noFomo: 'No FOMO',
                noRevengeTrade: 'No Revenge Trade',
                noOvertrade: 'No Overtrade',
              }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer p-1 hover:text-white">
                  <input
                    type="checkbox"
                    checked={checklist[key as keyof TradeChecklist]}
                    onChange={(e) =>
                      setChecklist({ ...checklist, [key]: e.target.checked })
                    }
                    className="accent-[#FF7A00] w-4 h-4 rounded bg-[#151515] border-[#2D2D2D]"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Trading Notes & Rationale</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record market context, key confluences, entry execution and lessons..."
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg p-3 text-xs text-white outline-none resize-none"
            />
          </div>

          {/* Row 6: Screenshot Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Before Screenshot */}
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Screenshot Before Trade</label>
              <div className="border-2 border-dashed border-[#2D2D2D] hover:border-[#FF7A00] rounded-xl p-4 text-center bg-[#111111] transition-colors relative min-h-[110px] flex flex-col items-center justify-center">
                {screenshotBefore ? (
                  <div className="relative w-full h-24">
                    <img src={screenshotBefore} alt="Before Preview" className="w-full h-full object-contain rounded" />
                    <button
                      type="button"
                      onClick={() => setScreenshotBefore(undefined)}
                      className="absolute top-1 right-1 bg-black/80 text-[#F44336] p-1 rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 text-[#8B8B8B] mb-1" />
                    <span className="text-xs text-[#8B8B8B]">Click to upload Before chart</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'before')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* After Screenshot */}
            <div>
              <label className="block text-xs text-[#B8B8B8] mb-1 font-medium">Screenshot After Trade</label>
              <div className="border-2 border-dashed border-[#2D2D2D] hover:border-[#FF7A00] rounded-xl p-4 text-center bg-[#111111] transition-colors relative min-h-[110px] flex flex-col items-center justify-center">
                {screenshotAfter ? (
                  <div className="relative w-full h-24">
                    <img src={screenshotAfter} alt="After Preview" className="w-full h-full object-contain rounded" />
                    <button
                      type="button"
                      onClick={() => setScreenshotAfter(undefined)}
                      className="absolute top-1 right-1 bg-black/80 text-[#F44336] p-1 rounded-full text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    <Upload className="w-6 h-6 text-[#8B8B8B] mb-1" />
                    <span className="text-xs text-[#8B8B8B]">Click to upload After chart</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'after')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[#2D2D2D] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#343434] text-xs font-semibold text-[#B8B8B8] hover:bg-[#1D1D1D] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#FF7A00] hover:bg-[#FF8E26] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF7A00]/20"
            >
              {initialTrade ? 'Update Trade' : 'Save Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
