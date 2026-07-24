import { Trade, RiskSettings } from '../types';

export interface CalculatedStats {
  currentBalance: number;
  totalTrades: number;
  winRate: number; // percentage e.g. 75.0
  netProfit: number;
  netProfitPercent: number;
  currentDrawdown: number; // percentage e.g. 2.4
  maxDrawdown: number;
  profitFactor: number;
  grossProfit: number;
  grossLoss: number;
  avgWin: number;
  avgLoss: number;
  avgRR: number;
  winningStreak: number;
  losingStreak: number;
  bestPair: string;
  worstPair: string;
}

/**
 * Calculate RR given trade entry, SL, TP, direction
 */
export function calculateRR(
  entry: number,
  sl: number,
  tp: number,
  direction: 'Long' | 'Short'
): number {
  if (!entry || !sl || !tp || entry === sl) return 0;

  const riskDist = Math.abs(entry - sl);
  const rewardDist = Math.abs(tp - entry);

  if (riskDist === 0) return 0;
  const rr = rewardDist / riskDist;
  return Number(rr.toFixed(2));
}

/**
 * Calculate PNL for a trade
 */
export function calculateTradePnL(
  entry: number,
  exit: number | undefined,
  sl: number,
  tp: number,
  direction: 'Long' | 'Short',
  riskPercent: number,
  balance: number
): { pnl: number; pnlPercent: number; result: 'Win' | 'Loss' | 'Break Even' | 'Pending' } {
  if (exit === undefined || exit === null || isNaN(exit)) {
    return { pnl: 0, pnlPercent: 0, result: 'Pending' };
  }

  const riskAmount = (balance * riskPercent) / 100;
  const riskDist = Math.abs(entry - sl);

  if (riskDist === 0) {
    return { pnl: 0, pnlPercent: 0, result: 'Pending' };
  }

  let pnl = 0;
  if (direction === 'Long') {
    pnl = ((exit - entry) / riskDist) * riskAmount;
  } else {
    pnl = ((entry - exit) / riskDist) * riskAmount;
  }

  pnl = Math.round(pnl * 100) / 100;
  const pnlPercent = Number(((pnl / balance) * 100).toFixed(2));

  let result: 'Win' | 'Loss' | 'Break Even' | 'Pending' = 'Break Even';
  if (pnl > 1) result = 'Win';
  else if (pnl < -1) result = 'Loss';

  return { pnl, pnlPercent, result };
}

/**
 * Overall Statistics Calculator across all trades
 */
export function calculateOverallStats(trades: Trade[], riskSettings: RiskSettings): CalculatedStats {
  const closedTrades = trades.filter(t => t.status === 'Closed');
  const totalTrades = closedTrades.length;

  if (totalTrades === 0) {
    return {
      currentBalance: riskSettings.startingBalance,
      totalTrades: 0,
      winRate: 0,
      netProfit: 0,
      netProfitPercent: 0,
      currentDrawdown: 0,
      maxDrawdown: 0,
      profitFactor: 0,
      grossProfit: 0,
      grossLoss: 0,
      avgWin: 0,
      avgLoss: 0,
      avgRR: 0,
      winningStreak: 0,
      losingStreak: 0,
      bestPair: 'N/A',
      worstPair: 'N/A',
    };
  }

  let winsCount = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let totalRR = 0;
  let totalWinPnl = 0;
  let totalLossPnl = 0;
  let lossCount = 0;

  const pairPnlMap: Record<string, number> = {};

  // Sort trades chronologically to compute equity peak and drawdown properly
  const chronologicalTrades = [...closedTrades].sort(
    (a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime()
  );

  let runningBalance = riskSettings.startingBalance;
  let peakBalance = riskSettings.startingBalance;
  let maxDrawdownVal = 0;
  let currentDrawdownVal = 0;

  let currentWinStreak = 0;
  let maxWinStreak = 0;
  let currentLossStreak = 0;
  let maxLossStreak = 0;

  chronologicalTrades.forEach(t => {
    runningBalance += t.pnl;
    if (runningBalance > peakBalance) {
      peakBalance = runningBalance;
    }

    const drawdown = peakBalance > 0 ? ((peakBalance - runningBalance) / peakBalance) * 100 : 0;
    if (drawdown > maxDrawdownVal) {
      maxDrawdownVal = drawdown;
    }
    currentDrawdownVal = drawdown;

    // Track pair profit
    pairPnlMap[t.pair] = (pairPnlMap[t.pair] || 0) + t.pnl;

    // Stats
    totalRR += t.rr || 0;

    if (t.result === 'Win') {
      winsCount++;
      grossProfit += t.pnl;
      totalWinPnl += t.pnl;

      currentWinStreak++;
      if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
      currentLossStreak = 0;
    } else if (t.result === 'Loss') {
      lossCount++;
      grossLoss += Math.abs(t.pnl);
      totalLossPnl += Math.abs(t.pnl);

      currentLossStreak++;
      if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
      currentWinStreak = 0;
    }
  });

  const winRate = Number(((winsCount / totalTrades) * 100).toFixed(1));
  const netProfit = Number((grossProfit - grossLoss).toFixed(2));
  const netProfitPercent = Number(((netProfit / riskSettings.startingBalance) * 100).toFixed(2));
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99.9 : 0;

  const avgWin = winsCount > 0 ? Math.round(totalWinPnl / winsCount) : 0;
  const avgLoss = lossCount > 0 ? Math.round(totalLossPnl / lossCount) : 0;
  const avgRR = Number((totalRR / totalTrades).toFixed(2));

  // Find best and worst pairs
  let bestPair = 'N/A';
  let worstPair = 'N/A';
  let highestPnl = -Infinity;
  let lowestPnl = Infinity;

  Object.entries(pairPnlMap).forEach(([pair, pnl]) => {
    if (pnl > highestPnl) {
      highestPnl = pnl;
      bestPair = pair;
    }
    if (pnl < lowestPnl) {
      lowestPnl = pnl;
      worstPair = pair;
    }
  });

  return {
    currentBalance: Math.round(runningBalance),
    totalTrades,
    winRate,
    netProfit,
    netProfitPercent,
    currentDrawdown: Number(currentDrawdownVal.toFixed(1)),
    maxDrawdown: Number(maxDrawdownVal.toFixed(1)),
    profitFactor,
    grossProfit: Math.round(grossProfit),
    grossLoss: Math.round(grossLoss),
    avgWin,
    avgLoss,
    avgRR,
    winningStreak: maxWinStreak,
    losingStreak: maxLossStreak,
    bestPair,
    worstPair,
  };
}

/**
 * Generate Equity Curve Data array for Recharts
 */
export function generateEquityCurveData(trades: Trade[], startingBalance: number) {
  const closedTrades = [...trades]
    .filter(t => t.status === 'Closed')
    .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime());

  let runningBalance = startingBalance;
  let peak = startingBalance;

  const points = [
    {
      trade: 'Start',
      date: closedTrades[0]?.date || 'Start',
      balance: startingBalance,
      equity: startingBalance,
      drawdown: 0,
      pnl: 0,
    }
  ];

  closedTrades.forEach((t, index) => {
    runningBalance += t.pnl;
    if (runningBalance > peak) peak = runningBalance;
    const dd = peak > 0 ? Number((((peak - runningBalance) / peak) * 100).toFixed(1)) : 0;

    points.push({
      trade: `#${index + 1} (${t.pair})`,
      date: t.date,
      balance: Math.round(runningBalance),
      equity: Math.round(runningBalance),
      drawdown: dd,
      pnl: t.pnl,
    });
  });

  return points;
}

/**
 * Generate Monthly PnL Data
 */
export function generateMonthlyPnlData(trades: Trade[]) {
  const monthMap: Record<string, number> = {};

  trades.filter(t => t.status === 'Closed').forEach(t => {
    const monthKey = t.date.slice(0, 7); // e.g. "2026-07"
    monthMap[monthKey] = (monthMap[monthKey] || 0) + t.pnl;
  });

  const sortedMonths = Object.keys(monthMap).sort();
  return sortedMonths.map(m => {
    const dateObj = new Date(m + '-01');
    const monthName = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    return {
      month: monthName,
      monthRaw: m,
      pnl: Math.round(monthMap[m]),
    };
  });
}
