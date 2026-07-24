import { openDB, IDBPDatabase } from 'idb';
import { Trade, RiskSettings, UserSettings } from '../types';

const DB_NAME = 'TradingJournalProDB';
const DB_VERSION = 1;

export const DEFAULT_RISK_SETTINGS: RiskSettings = {
  startingBalance: 10000,
  currentBalance: 12450,
  riskPerTradePercent: 1.0,
  maxDrawdownPercent: 10.0,
  maxDailyDrawdownPercent: 3.0,
  targetMonthlyReturnPercent: 8.0,
  currencySymbol: '$',
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'dark',
  currency: '$',
  compactTable: false,
  autoCalculatePnL: true,
};

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('trades')) {
          const tradeStore = db.createObjectStore('trades', { keyPath: 'id' });
          tradeStore.createIndex('pair', 'pair', { unique: false });
          tradeStore.createIndex('date', 'date', { unique: false });
          tradeStore.createIndex('result', 'result', { unique: false });
          tradeStore.createIndex('direction', 'direction', { unique: false });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Generate a clean SVG chart placeholder Data URL
 */
function createDemoChartSvg(title: string, color: string, isBullish: boolean): string {
  const points = isBullish
    ? "M 10 160 Q 60 140 100 120 T 180 90 T 260 110 T 340 50 L 400 30"
    : "M 10 30 Q 60 40 100 80 T 180 120 T 260 100 T 340 150 L 400 170";

  const candleColors = isBullish ? ['#4CAF50', '#81C784'] : ['#FF7A00', '#FF8E26'];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400" style="background:#0c0c0e; font-family:sans-serif;">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#18181c"/>
          <stop offset="100%" stop-color="#0c0c0e"/>
        </linearGradient>
      </defs>
      <rect width="800" height="400" fill="url(#bgGrad)"/>
      <g stroke="#262626" stroke-width="1">
        <line x1="0" y1="80" x2="800" y2="80"/>
        <line x1="0" y1="160" x2="800" y2="160"/>
        <line x1="0" y1="240" x2="800" y2="240"/>
        <line x1="0" y1="320" x2="800" y2="320"/>
        <line x1="160" y1="0" x2="160" y2="400"/>
        <line x1="320" y1="0" x2="320" y2="400"/>
        <line x1="480" y1="0" x2="480" y2="400"/>
        <line x1="640" y1="0" x2="640" y2="400"/>
      </g>
      <text x="25" y="35" fill="#FF7A00" font-size="16" font-weight="bold">${title}</text>
      <text x="700" y="35" fill="#8B8B8B" font-size="12">TRADINGVIEW CHART</text>
      <path d="${points}" fill="none" stroke="${color}" stroke-width="3" />
      <g fill="${candleColors[0]}">
        <rect x="140" y="100" width="12" height="60" rx="2"/>
        <rect x="220" y="80" width="12" height="90" rx="2"/>
        <rect x="300" y="120" width="12" height="40" fill="${candleColors[1]}" rx="2"/>
        <rect x="380" y="50" width="12" height="80" rx="2"/>
        <rect x="460" y="70" width="12" height="110" rx="2"/>
        <rect x="540" y="40" width="12" height="50" fill="${candleColors[1]}" rx="2"/>
        <rect x="620" y="30" width="12" height="90" rx="2"/>
      </g>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Pre-seeded sample trades dataset for immediate offline richness
 */
export function getSampleTrades(): Trade[] {
  const now = new Date();

  return [
    {
      id: 'trd-101',
      pair: 'EUR/USD',
      date: '2026-07-22',
      time: '14:30',
      direction: 'Long',
      status: 'Closed',
      entryPrice: 1.0850,
      stopLoss: 1.0820,
      takeProfit: 1.0920,
      exitPrice: 1.0920,
      riskPercent: 1.0,
      riskAmount: 100,
      pnl: 233,
      pnlPercent: 2.33,
      rr: 2.33,
      result: 'Win',
      balanceBefore: 12217,
      balanceAfter: 12450,
      holdingTime: '3h 15m',
      notes: 'Classic London sweep into 4H Order Block. High volume rejection on the 15m timeframe.',
      screenshotBefore: createDemoChartSvg('EUR/USD 15M - Order Block Entry', '#4CAF50', true),
      screenshotAfter: createDemoChartSvg('EUR/USD 15M - TP Target Hit', '#FFFFFF', true),
      psychology: 'Calm',
      checklist: {
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
      },
      analysis: {
        trend: 'Uptrend',
        session: 'London/NY Overlap',
        marketStructure: 'BOS',
        breakout: true,
        pullback: true,
        liquidity: true,
        orderBlock: true,
        supportResistance: true,
        confluence: '4H Order Block + 15M Bullish Displacement + Asia Low Sweep',
        newsImpact: 'Low',
        strategy: 'Order Block Sweep',
        tags: ['Forex', 'OrderBlock', 'NY-Session', 'HighRR'],
      },
      editHistory: [
        { id: '1', timestamp: '2026-07-22 14:30', action: 'Trade Created', details: 'Entry set at 1.0850' },
        { id: '2', timestamp: '2026-07-22 17:45', action: 'Trade Closed', details: 'TP hit at 1.0920 (+2.33 R)' }
      ],
      createdAt: '2026-07-22T14:30:00.000Z',
      updatedAt: '2026-07-22T17:45:00.000Z',
    },
    {
      id: 'trd-102',
      pair: 'BTC/USDT',
      date: '2026-07-21',
      time: '09:15',
      direction: 'Long',
      status: 'Closed',
      entryPrice: 64200,
      stopLoss: 63500,
      takeProfit: 66300,
      exitPrice: 66300,
      riskPercent: 1.5,
      riskAmount: 150,
      pnl: 450,
      pnlPercent: 4.5,
      rr: 3.0,
      result: 'Win',
      balanceBefore: 11767,
      balanceAfter: 12217,
      holdingTime: '5h 40m',
      notes: 'Bitcoin held key daily support level. Liquidity grab below $63.8k.',
      screenshotBefore: createDemoChartSvg('BTC/USDT 1H - Liquidity Grab', '#4CAF50', true),
      screenshotAfter: createDemoChartSvg('BTC/USDT 1H - Expansion to TP', '#FFFFFF', true),
      psychology: 'Confident',
      checklist: {
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
      },
      analysis: {
        trend: 'Uptrend',
        session: 'New York',
        marketStructure: 'CHOCH',
        breakout: true,
        pullback: true,
        liquidity: true,
        orderBlock: true,
        supportResistance: true,
        confluence: 'Daily Support + FVG fill + Bullish divergence on RSI',
        newsImpact: 'Medium',
        strategy: 'Liquidity Sweep',
        tags: ['Crypto', 'Bitcoin', 'DailyLevel'],
      },
      editHistory: [
        { id: '1', timestamp: '2026-07-21 09:15', action: 'Trade Created', details: 'Long entry @ 64,200' }
      ],
      createdAt: '2026-07-21T09:15:00.000Z',
      updatedAt: '2026-07-21T14:55:00.000Z',
    },
    {
      id: 'trd-103',
      pair: 'NAS100',
      date: '2026-07-20',
      time: '16:00',
      direction: 'Short',
      status: 'Closed',
      entryPrice: 19850,
      stopLoss: 19930,
      takeProfit: 19610,
      exitPrice: 19930,
      riskPercent: 1.0,
      riskAmount: 115,
      pnl: -115,
      pnlPercent: -1.0,
      rr: 3.0,
      result: 'Loss',
      balanceBefore: 11882,
      balanceAfter: 11767,
      holdingTime: '45m',
      notes: 'Pushed higher into FOMC catalyst. Stop loss executed as planned. Good risk discipline.',
      screenshotBefore: createDemoChartSvg('NAS100 5M - Premium Supply Zone', '#FF7A00', false),
      screenshotAfter: createDemoChartSvg('NAS100 5M - Stop Loss Hit', '#FF8E26', false),
      psychology: 'Calm',
      checklist: {
        trendConfirmed: false,
        entryAccordingPlan: true,
        rrMin1to2: true,
        riskCalculated: true,
        newsChecked: false,
        liquidityChecked: true,
        supportResistanceConfirmed: true,
        noFomo: true,
        noRevengeTrade: true,
        noOvertrade: true,
      },
      analysis: {
        trend: 'Downtrend',
        session: 'New York',
        marketStructure: 'Ranging',
        breakout: false,
        pullback: true,
        liquidity: false,
        orderBlock: true,
        supportResistance: true,
        confluence: '15m Supply Zone + VWAP Upper Band Rejection',
        newsImpact: 'High',
        strategy: 'Supply Rejection',
        tags: ['Indices', 'NAS100', 'NY-Open'],
      },
      editHistory: [
        { id: '1', timestamp: '2026-07-20 16:00', action: 'Trade Created', details: 'Short position placed' }
      ],
      createdAt: '2026-07-20T16:00:00.000Z',
      updatedAt: '2026-07-20T16:45:00.000Z',
    },
    {
      id: 'trd-104',
      pair: 'XAU/USD',
      date: '2026-07-18',
      time: '11:10',
      direction: 'Long',
      status: 'Closed',
      entryPrice: 2380.50,
      stopLoss: 2372.00,
      takeProfit: 2405.00,
      exitPrice: 2405.00,
      riskPercent: 1.0,
      riskAmount: 110,
      pnl: 318,
      pnlPercent: 2.88,
      rr: 2.88,
      result: 'Win',
      balanceBefore: 11564,
      balanceAfter: 11882,
      holdingTime: '4h 10m',
      notes: 'Gold breakout continuation after consolidating at $2,380 key round number.',
      screenshotBefore: createDemoChartSvg('XAU/USD 30M - Key Breakout', '#4CAF50', true),
      screenshotAfter: createDemoChartSvg('XAU/USD 30M - Full Target Hit', '#FFFFFF', true),
      psychology: 'Confident',
      checklist: {
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
      },
      analysis: {
        trend: 'Uptrend',
        session: 'London',
        marketStructure: 'Trending',
        breakout: true,
        pullback: true,
        liquidity: true,
        orderBlock: true,
        supportResistance: true,
        confluence: '30M High Volume Breakout + 200 EMA Bounce',
        newsImpact: 'Low',
        strategy: 'Breakout Pullback',
        tags: ['Commodities', 'Gold', 'London-Session'],
      },
      editHistory: [],
      createdAt: '2026-07-18T11:10:00.000Z',
      updatedAt: '2026-07-18T15:20:00.000Z',
    },
    {
      id: 'trd-105',
      pair: 'GBP/JPY',
      date: '2026-07-16',
      time: '08:00',
      direction: 'Long',
      status: 'Closed',
      entryPrice: 202.10,
      stopLoss: 201.50,
      takeProfit: 203.60,
      exitPrice: 203.60,
      riskPercent: 1.0,
      riskAmount: 105,
      pnl: 262,
      pnlPercent: 2.5,
      rr: 2.5,
      result: 'Win',
      balanceBefore: 11302,
      balanceAfter: 11564,
      holdingTime: '6h 00m',
      notes: 'Dragon pair trend continuation. Tokyo session low held perfectly.',
      screenshotBefore: createDemoChartSvg('GBP/JPY 1H - Trend Continuation', '#4CAF50', true),
      screenshotAfter: createDemoChartSvg('GBP/JPY 1H - Target Reached', '#FFFFFF', true),
      psychology: 'Calm',
      checklist: {
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
      },
      analysis: {
        trend: 'Uptrend',
        session: 'Asian',
        marketStructure: 'Trending',
        breakout: false,
        pullback: true,
        liquidity: true,
        orderBlock: true,
        supportResistance: true,
        confluence: 'Tokyo Low Sweep + 1H Bullish Pinbar',
        newsImpact: 'None',
        strategy: 'Session Low Sweep',
        tags: ['Forex', 'GBP/JPY', 'AsianSession'],
      },
      editHistory: [],
      createdAt: '2026-07-16T08:00:00.000Z',
      updatedAt: '2026-07-16T14:00:00.000Z',
    },
    {
      id: 'trd-106',
      pair: 'NVDA',
      date: '2026-07-14',
      time: '16:30',
      direction: 'Long',
      status: 'Closed',
      entryPrice: 125.00,
      stopLoss: 122.50,
      takeProfit: 132.50,
      exitPrice: 132.50,
      riskPercent: 1.0,
      riskAmount: 100,
      pnl: 300,
      pnlPercent: 3.0,
      rr: 3.0,
      result: 'Win',
      balanceBefore: 11002,
      balanceAfter: 11302,
      holdingTime: '1d 2h',
      notes: 'Strong earnings momentum play. Gap fill retest on 1H chart.',
      screenshotBefore: createDemoChartSvg('NVDA 1H - Gap Fill Bounce', '#4CAF50', true),
      screenshotAfter: createDemoChartSvg('NVDA 1H - Target Complete', '#FFFFFF', true),
      psychology: 'Confident',
      checklist: {
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
      },
      analysis: {
        trend: 'Uptrend',
        session: 'New York',
        marketStructure: 'BOS',
        breakout: true,
        pullback: true,
        liquidity: true,
        orderBlock: true,
        supportResistance: true,
        confluence: 'Earnings Momentum + Gap Fill Retest',
        newsImpact: 'High',
        strategy: 'Gap Retest',
        tags: ['Stocks', 'NVDA', 'Swing'],
      },
      editHistory: [],
      createdAt: '2026-07-14T16:30:00.000Z',
      updatedAt: '2026-07-15T18:30:00.000Z',
    },
    {
      id: 'trd-107',
      pair: 'EUR/USD',
      date: '2026-07-12',
      time: '10:00',
      direction: 'Short',
      status: 'Closed',
      entryPrice: 1.0910,
      stopLoss: 1.0935,
      takeProfit: 1.0850,
      exitPrice: 1.0935,
      riskPercent: 1.0,
      riskAmount: 100,
      pnl: -100,
      pnlPercent: -1.0,
      rr: 2.4,
      result: 'Loss',
      balanceBefore: 11102,
      balanceAfter: 11002,
      holdingTime: '1h 10m',
      notes: 'Slightly rushed entry due to early momentum. Should have waited for 15M confirmation.',
      screenshotBefore: createDemoChartSvg('EUR/USD 15M - Early Short', '#FF7A00', false),
      screenshotAfter: createDemoChartSvg('EUR/USD 15M - Invalidation', '#FF8E26', false),
      psychology: 'FOMO',
      checklist: {
        trendConfirmed: false,
        entryAccordingPlan: false,
        rrMin1to2: true,
        riskCalculated: true,
        newsChecked: true,
        liquidityChecked: false,
        supportResistanceConfirmed: true,
        noFomo: false,
        noRevengeTrade: true,
        noOvertrade: true,
      },
      analysis: {
        trend: 'Sideways',
        session: 'London',
        marketStructure: 'Ranging',
        breakout: false,
        pullback: false,
        liquidity: false,
        orderBlock: true,
        supportResistance: true,
        confluence: 'Double Top Premature Entry',
        newsImpact: 'Low',
        strategy: 'Supply Rejection',
        tags: ['Forex', 'EUR/USD', 'Lesson'],
      },
      editHistory: [],
      createdAt: '2026-07-12T10:00:00.000Z',
      updatedAt: '2026-07-12T11:10:00.000Z',
    },
    {
      id: 'trd-108',
      pair: 'BTC/USDT',
      date: '2026-07-23',
      time: '23:00',
      direction: 'Long',
      status: 'Ongoing',
      entryPrice: 66800,
      stopLoss: 65900,
      takeProfit: 69200,
      exitPrice: undefined,
      riskPercent: 1.0,
      riskAmount: 124,
      pnl: 180, // floating profit
      pnlPercent: 1.45,
      rr: 2.66,
      result: 'Pending',
      balanceBefore: 12450,
      balanceAfter: 12450,
      holdingTime: 'Active',
      notes: 'Ongoing position. Currently floating in green. Stop loss moved to breakeven.',
      screenshotBefore: createDemoChartSvg('BTC/USDT 4H - Ongoing Bullish Channel', '#4A90E2', true),
      screenshotAfter: undefined,
      psychology: 'Calm',
      checklist: {
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
      },
      analysis: {
        trend: 'Uptrend',
        session: 'Asian',
        marketStructure: 'BOS',
        breakout: true,
        pullback: true,
        liquidity: true,
        orderBlock: true,
        supportResistance: true,
        confluence: '4H Channel Re-test + 66k Support',
        newsImpact: 'Low',
        strategy: 'Trend Continuation',
        tags: ['Crypto', 'Ongoing', 'Bitcoin'],
      },
      editHistory: [
        { id: '1', timestamp: '2026-07-23 23:00', action: 'Trade Opened', details: 'Long at 66,800' }
      ],
      createdAt: '2026-07-23T23:00:00.000Z',
      updatedAt: '2026-07-23T23:00:00.000Z',
    }
  ];
}

/**
 * Initialize / fetch all trades from IndexedDB
 */
export async function loadTradesFromDB(): Promise<Trade[]> {
  const db = await getDB();
  let trades = await db.getAll('trades');

  if (trades.length === 0) {
    // Seed initial dataset
    const sampleTrades = getSampleTrades();
    const tx = db.transaction('trades', 'readwrite');
    for (const t of sampleTrades) {
      await tx.store.put(t);
    }
    await tx.done;
    trades = sampleTrades;
  }

  // Sort descending by date & time
  return trades.sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime());
}

/**
 * Save / Update single trade
 */
export async function saveTradeToDB(trade: Trade): Promise<void> {
  const db = await getDB();
  await db.put('trades', trade);
}

/**
 * Delete trade
 */
export async function deleteTradeFromDB(tradeId: string): Promise<void> {
  const db = await getDB();
  await db.delete('trades', tradeId);
}

/**
 * Reset / Clear all trades
 */
export async function clearAllTradesDB(): Promise<void> {
  const db = await getDB();
  await db.clear('trades');
}

/**
 * Replace entire trades database (for Restore / Import)
 */
export async function replaceAllTradesDB(newTrades: Trade[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('trades', 'readwrite');
  await tx.store.clear();
  for (const t of newTrades) {
    await tx.store.put(t);
  }
  await tx.done;
}

/**
 * Load Risk Settings
 */
export async function loadRiskSettingsDB(): Promise<RiskSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'risk_settings');
  return settings || DEFAULT_RISK_SETTINGS;
}

/**
 * Save Risk Settings
 */
export async function saveRiskSettingsDB(settings: RiskSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'risk_settings');
}

/**
 * Load User Settings
 */
export async function loadUserSettingsDB(): Promise<UserSettings> {
  const db = await getDB();
  const settings = await db.get('settings', 'user_settings');
  return settings || DEFAULT_USER_SETTINGS;
}

/**
 * Save User Settings
 */
export async function saveUserSettingsDB(settings: UserSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'user_settings');
}
