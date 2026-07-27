import React, { useState } from 'react';
import { ShieldAlert, Save, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { RiskSettings } from '../../types';

interface RiskViewProps {
  riskSettings: RiskSettings;
  currentDrawdown: number;
  onSaveRiskSettings: (settings: RiskSettings) => void;
  currencySymbol: string;
}

export const RiskView: React.FC<RiskViewProps> = ({
  riskSettings,
  currentDrawdown,
  onSaveRiskSettings,
  currencySymbol,
}) => {
  const [startingBalance, setStartingBalance] = useState<string>(riskSettings.startingBalance.toString());
  const [currentBalance, setCurrentBalance] = useState<string>(riskSettings.currentBalance.toString());
  const [riskPerTradePercent, setRiskPerTradePercent] = useState<string>(riskSettings.riskPerTradePercent.toString());
  const [maxDrawdownPercent, setMaxDrawdownPercent] = useState<string>(riskSettings.maxDrawdownPercent.toString());
  const [maxDailyDrawdownPercent, setMaxDailyDrawdownPercent] = useState<string>(
    riskSettings.maxDailyDrawdownPercent.toString()
  );
  const [targetMonthlyReturnPercent, setTargetMonthlyReturnPercent] = useState<string>(
    riskSettings.targetMonthlyReturnPercent.toString()
  );
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Position Size Calculator State
  const [calcEntry, setCalcEntry] = useState<string>('1.0850');
  const [calcSL, setCalcSL] = useState<string>('1.0820');
  const [calcRiskPct, setCalcRiskPct] = useState<string>(riskPerTradePercent);

  const numCurrentBal = parseFloat(currentBalance) || 10000;
  const numCalcRiskPct = parseFloat(calcRiskPct) || 1.0;
  const numCalcEntry = parseFloat(calcEntry) || 0;
  const numCalcSL = parseFloat(calcSL) || 0;

  const riskDollarAmount = (numCurrentBal * numCalcRiskPct) / 100;
  const priceDistance = Math.abs(numCalcEntry - numCalcSL);
  const positionUnits = priceDistance > 0 ? (riskDollarAmount / priceDistance).toFixed(2) : '0';

  const isLimitViolated = currentDrawdown > parseFloat(maxDrawdownPercent);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: RiskSettings = {
      ...riskSettings,
      startingBalance: parseFloat(startingBalance) || 10000,
      currentBalance: parseFloat(currentBalance) || 10000,
      riskPerTradePercent: parseFloat(riskPerTradePercent) || 1.0,
      maxDrawdownPercent: parseFloat(maxDrawdownPercent) || 10.0,
      maxDailyDrawdownPercent: parseFloat(maxDailyDrawdownPercent) || 3.0,
      targetMonthlyReturnPercent: parseFloat(targetMonthlyReturnPercent) || 8.0,
    };

    onSaveRiskSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Violation Alert Banner */}
      {isLimitViolated && (
        <div className="bg-[#F44336]/10 border border-[#F44336]/40 rounded-[14px] p-5 flex items-center gap-4 text-white">
          <div className="w-12 h-12 rounded-xl bg-[#F44336]/20 flex items-center justify-center text-[#F44336] shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base text-[#F44336]">Maximum Drawdown Threshold Exceeded!</h4>
            <p className="text-xs text-[#B8B8B8] mt-1">
              Your account current drawdown ({currentDrawdown}%) has surpassed your defined limit of{' '}
              {maxDrawdownPercent}%. Standard risk management mandates reducing position sizes or pausing trading temporarily.
            </p>
          </div>
        </div>
      )}

      {/* Main Risk Configuration Form */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-4">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#FF7A00]" /> Capital Protection & Risk Limits
            </h3>
            <p className="text-xs text-[#8B8B8B]">Configure drawdown thresholds and baseline equity settings</p>
          </div>
          {saveSuccess && (
            <span className="text-xs text-[#4CAF50] font-bold flex items-center gap-1 bg-[#4CAF50]/15 px-3 py-1 rounded-lg border border-[#4CAF50]/30">
              <CheckCircle className="w-4 h-4" /> Rules Saved
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs text-[#B8B8B8] font-medium mb-1.5">Starting Balance ({currencySymbol})</label>
              <input
                type="number"
                step="any"
                required
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[#B8B8B8] font-medium mb-1.5">Current Balance ({currencySymbol})</label>
              <input
                type="number"
                step="any"
                required
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[#B8B8B8] font-medium mb-1.5">Max Risk Per Trade (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={riskPerTradePercent}
                onChange={(e) => setRiskPerTradePercent(e.target.value)}
                className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[#FF7A00] font-medium mb-1.5">Max Account Drawdown (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={maxDrawdownPercent}
                onChange={(e) => setMaxDrawdownPercent(e.target.value)}
                className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[#FF7A00] font-medium mb-1.5">Max Daily Drawdown (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={maxDailyDrawdownPercent}
                onChange={(e) => setMaxDailyDrawdownPercent(e.target.value)}
                className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-[#4CAF50] font-medium mb-1.5">Target Monthly Return (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={targetMonthlyReturnPercent}
                onChange={(e) => setTargetMonthlyReturnPercent(e.target.value)}
                className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#FF7A00] hover:bg-[#FF8E26] text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-[#FF7A00]/20"
            >
              <Save className="w-4 h-4" /> Save Risk Settings
            </button>
          </div>
        </form>
      </div>

      {/* Position Size Calculator Tool */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-6 space-y-4">
        <div className="border-b border-[#2D2D2D] pb-3">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#FF7A00]" /> Position Size Calculator
          </h3>
          <p className="text-xs text-[#8B8B8B]">Calculate exact units/lots based on account risk rules</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-[#B8B8B8] font-medium mb-1">Planned Entry Price</label>
            <input
              type="number"
              step="any"
              value={calcEntry}
              onChange={(e) => setCalcEntry(e.target.value)}
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#FF7A00] font-medium mb-1">Planned Stop Loss</label>
            <input
              type="number"
              step="any"
              value={calcSL}
              onChange={(e) => setCalcSL(e.target.value)}
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[#B8B8B8] font-medium mb-1">Risk Percent (%)</label>
            <input
              type="number"
              step="0.1"
              value={calcRiskPct}
              onChange={(e) => setCalcRiskPct(e.target.value)}
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none"
            />
          </div>
        </div>

        {/* Calculation Outcome Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#111111] p-4 rounded-xl border border-[#2D2D2D] text-xs font-mono">
          <div>
            <span className="text-[#8B8B8B] block uppercase text-[10px]">Calculated Cash At Risk</span>
            <span className="font-bold text-base text-[#FF7A00]">
              {currencySymbol}{riskDollarAmount.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#666666] block font-sans">
              {numCalcRiskPct}% of {currencySymbol}{numCurrentBal.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[#8B8B8B] block uppercase text-[10px]">Price Delta / Stop Distance</span>
            <span className="font-bold text-base text-white">{priceDistance.toFixed(4)}</span>
            <span className="text-[10px] text-[#666666] block font-sans">
              Distance Entry to Stop Loss
            </span>
          </div>
          <div>
            <span className="text-[#8B8B8B] block uppercase text-[10px]">Recommended Lot / Position Size</span>
            <span className="font-bold text-base text-[#4CAF50]">{positionUnits} Units</span>
            <span className="text-[10px] text-[#4CAF50] block font-sans">
              ≈ {(parseFloat(positionUnits) / 100000).toFixed(2)} Standard Lots (100k)
            </span>
          </div>
        </div>

        {/* Interactive Risk Bar Indicator */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-[#8B8B8B]">Position Exposure Level:</span>
            <span className={`font-bold uppercase ${
              numCalcRiskPct <= 1.5 
                ? 'text-[#4CAF50]' 
                : numCalcRiskPct <= 3.0 
                ? 'text-[#FF7A00]' 
                : 'text-[#F44336]'
            }`}>
              {numCalcRiskPct <= 1.5 ? 'Conservative (Safe)' : numCalcRiskPct <= 3.0 ? 'Moderate Risk' : 'High Risk Exposure'}
            </span>
          </div>
          <div className="w-full bg-[#202020] h-2 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 ${
                numCalcRiskPct <= 1.5 
                  ? 'bg-[#4CAF50]' 
                  : numCalcRiskPct <= 3.0 
                  ? 'bg-[#FF7A00]' 
                  : 'bg-[#F44336]'
              }`}
              style={{ width: `${Math.min(numCalcRiskPct * 20, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
