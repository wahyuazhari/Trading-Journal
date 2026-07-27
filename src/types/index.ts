export type TradeDirection = 'Long' | 'Short';
export type TradeStatus = 'Ongoing' | 'Closed';
export type TradeResult = 'Win' | 'Loss' | 'Break Even' | 'Pending';
export type PsychologyState = 'Calm' | 'Fear' | 'Greed' | 'FOMO' | 'Revenge' | 'Confident' | 'Impatient' | 'Tired';
export type SessionType = 'Asian' | 'London' | 'New York' | 'London/NY Overlap';
export type MarketStructure = 'BOS' | 'CHOCH' | 'Ranging' | 'Trending';

export interface ChecklistItem {
  id: string;
  label: string;
}

export type TradeChecklist = Record<string, boolean>;

export interface TradeAnalysis {
  trend: 'Uptrend' | 'Downtrend' | 'Sideways' | string;
  session: SessionType | string;
  marketStructure: MarketStructure | string;
  breakout: boolean;
  pullback: boolean;
  liquidity: boolean;
  orderBlock: boolean;
  supportResistance: boolean;
  confluence: string;
  newsImpact: 'High' | 'Medium' | 'Low' | 'None' | string;
  strategy: string;
  tags: string[];
}

export interface EditHistoryLog {
  id: string;
  timestamp: string;
  action: string;
  details?: string;
}

export interface Trade {
  id: string;
  pair: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  direction: TradeDirection;
  status: TradeStatus;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  exitPrice?: number;
  riskPercent: number;
  riskAmount?: number;
  pnl: number;
  pnlPercent: number;
  rr: number;
  result: TradeResult;
  balanceBefore?: number;
  balanceAfter?: number;
  holdingTime?: string;
  notes: string;
  screenshotBefore?: string; // Data URL
  screenshotAfter?: string; // Data URL
  psychology: PsychologyState;
  checklist: TradeChecklist;
  analysis: TradeAnalysis;
  editHistory: EditHistoryLog[];
  createdAt: string;
  updatedAt: string;
}

export interface RiskSettings {
  startingBalance: number;
  currentBalance: number;
  riskPerTradePercent: number;
  maxDrawdownPercent: number;
  maxDailyDrawdownPercent: number;
  targetMonthlyReturnPercent: number;
  currencySymbol: string;
}

export interface UserSettings {
  theme: 'dark';
  currency: string;
  compactTable: boolean;
  autoCalculatePnL: boolean;
  checklistItems?: ChecklistItem[];
}

export interface AIReviewResult {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  overallScore: number; // 0-100
}

export type NavigationPage = 
  | 'dashboard' 
  | 'journal' 
  | 'trade-detail' 
  | 'gallery' 
  | 'analytics' 
  | 'risk' 
  | 'settings';
