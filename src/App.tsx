import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  NavigationPage, 
  Trade, 
  RiskSettings, 
  UserSettings 
} from './types';
import { 
  loadTradesFromDB, 
  saveTradeToDB, 
  deleteTradeFromDB, 
  clearAllTradesDB, 
  replaceAllTradesDB,
  loadRiskSettingsDB, 
  saveRiskSettingsDB, 
  loadUserSettingsDB, 
  saveUserSettingsDB,
  DEFAULT_RISK_SETTINGS,
  DEFAULT_USER_SETTINGS,
  getSampleTrades
} from './services/db';
import { calculateOverallStats } from './utils/calculations';

import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { JournalView } from './components/journal/JournalView';
import { TradeDetailView } from './components/tradeDetail/TradeDetailView';
import { GalleryView } from './components/gallery/GalleryView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { RiskView } from './components/risk/RiskView';
import { SettingsView } from './components/settings/SettingsView';
import { AddTradeModal } from './components/common/AddTradeModal';
import { Search, Command, ArrowRight, LayoutDashboard, BookOpen, Images, BarChart3, ShieldAlert, Settings, Plus, X } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTradeId, setActiveTradeId] = useState<string | null>(null);
  
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(DEFAULT_RISK_SETTINGS);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState<boolean>(false);
  const [cmdSearchQuery, setCmdSearchQuery] = useState<string>('');
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load state from IndexedDB on initial mount
  useEffect(() => {
    async function initData() {
      try {
        const loadedTrades = await loadTradesFromDB();
        const loadedRisk = await loadRiskSettingsDB();
        const loadedUser = await loadUserSettingsDB();

        setTrades(loadedTrades);
        setRiskSettings(loadedRisk);
        setUserSettings(loadedUser);
      } catch (err) {
        console.error('Failed to load IndexedDB data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, []);

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdKOpen((prev) => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsCmdKOpen(true);
      } else if (e.key === 'Escape' && isCmdKOpen) {
        setIsCmdKOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCmdKOpen]);

  // Sync riskSettings currentBalance with overall trades stats automatically
  useEffect(() => {
    if (trades.length > 0) {
      const stats = calculateOverallStats(trades, riskSettings);
      if (stats.currentBalance !== riskSettings.currentBalance) {
        const updatedRisk = { ...riskSettings, currentBalance: stats.currentBalance };
        setRiskSettings(updatedRisk);
        saveRiskSettingsDB(updatedRisk);
      }
    } else {
      if (riskSettings.currentBalance !== riskSettings.startingBalance) {
        const updatedRisk = { ...riskSettings, currentBalance: riskSettings.startingBalance };
        setRiskSettings(updatedRisk);
        saveRiskSettingsDB(updatedRisk);
      }
    }
  }, [trades]);

  const handleNavigate = (page: NavigationPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTrade = (tradeId: string) => {
    setActiveTradeId(tradeId);
    setCurrentPage('trade-detail');
    setIsCmdKOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAddModal = (trade?: Trade) => {
    setTradeToEdit(trade || null);
    setIsAddModalOpen(true);
  };

  const handleSaveTrade = async (savedTrade: Trade) => {
    await saveTradeToDB(savedTrade);
    setTrades((prev) => {
      const existingIdx = prev.findIndex((t) => t.id === savedTrade.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = savedTrade;
        return updated;
      }
      return [savedTrade, ...prev];
    });
  };

  const handleDeleteTrade = async (tradeId: string) => {
    await deleteTradeFromDB(tradeId);
    setTrades((prev) => prev.filter((t) => t.id !== tradeId));
    if (activeTradeId === tradeId) {
      setActiveTradeId(null);
      setCurrentPage('journal');
    }
  };

  const handleDuplicateTrade = async (trade: Trade) => {
    const duplicated: Trade = {
      ...trade,
      id: `trd-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      editHistory: [
        {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleString(),
          action: 'Trade Duplicated',
          details: `Copied from trade #${trade.id}`,
        },
      ],
    };

    await saveTradeToDB(duplicated);
    setTrades((prev) => [duplicated, ...prev]);
  };

  const handleSaveRiskSettings = async (newSettings: RiskSettings) => {
    setRiskSettings(newSettings);
    await saveRiskSettingsDB(newSettings);
  };

  const handleSaveUserSettings = async (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    await saveUserSettingsDB(newSettings);
  };

  const handleClearDatabase = async () => {
    await clearAllTradesDB();
    setTrades([]);
    setActiveTradeId(null);
    setCurrentPage('dashboard');
  };

  const handleSeedDemoData = async () => {
    const samples = getSampleTrades();
    await replaceAllTradesDB(samples);
    setTrades(samples);
    if (samples.length > 0) setActiveTradeId(samples[0].id);
  };

  const handleImportBackup = async (data: { trades: Trade[]; riskSettings: RiskSettings }) => {
    if (data.trades) {
      await replaceAllTradesDB(data.trades);
      setTrades(data.trades);
    }
    if (data.riskSettings) {
      setRiskSettings(data.riskSettings);
      await saveRiskSettingsDB(data.riskSettings);
    }
  };

  const filteredCmdTrades = trades.filter((t) => {
    if (!cmdSearchQuery.trim()) return true;
    const q = cmdSearchQuery.toLowerCase();
    return (
      t.pair.toLowerCase().includes(q) ||
      t.setupType.toLowerCase().includes(q) ||
      t.direction.toLowerCase().includes(q) ||
      t.result.toLowerCase().includes(q) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  });

  const stats = calculateOverallStats(trades, riskSettings);
  const activeTrade = trades.find((t) => t.id === activeTradeId) || trades[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center font-sans">
        <div className="w-12 h-12 border-4 border-[#FF7A00] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wider text-[#B8B8B8] uppercase">Loading Trading Terminal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col lg:flex-row font-sans selection:bg-[#FF7A00]/30 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        activeTradeId={activeTradeId}
      />

      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#000000]">
        {/* Top Header */}
        <TopNav
          currentPage={currentPage}
          onOpenAddModal={() => handleOpenAddModal()}
          onOpenCmdK={() => setIsCmdKOpen(true)}
          riskSettings={riskSettings}
          currentDrawdown={stats.currentDrawdown}
          onSearchChange={setGlobalSearch}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {currentPage === 'dashboard' && (
            <DashboardView
              trades={trades}
              riskSettings={riskSettings}
              onNavigate={handleNavigate}
              onSelectTrade={handleSelectTrade}
            />
          )}

          {currentPage === 'journal' && (
            <JournalView
              trades={trades}
              onSelectTrade={handleSelectTrade}
              onOpenAddModal={handleOpenAddModal}
              onDuplicateTrade={handleDuplicateTrade}
              onDeleteTrade={handleDeleteTrade}
              currencySymbol={riskSettings.currencySymbol}
            />
          )}

          {currentPage === 'trade-detail' && activeTrade && (
            <TradeDetailView
              trade={activeTrade}
              allTrades={trades}
              onBack={() => handleNavigate('journal')}
              onEdit={(t) => handleOpenAddModal(t)}
              onDuplicate={handleDuplicateTrade}
              onDelete={handleDeleteTrade}
              onSelectTrade={handleSelectTrade}
              onNavigate={handleNavigate}
              onUpdateTrade={handleSaveTrade}
              currencySymbol={riskSettings.currencySymbol}
            />
          )}

          {currentPage === 'gallery' && (
            <GalleryView
              trades={trades}
              onSelectTrade={handleSelectTrade}
              currencySymbol={riskSettings.currencySymbol}
            />
          )}

          {currentPage === 'analytics' && (
            <AnalyticsView
              trades={trades}
              riskSettings={riskSettings}
              currencySymbol={riskSettings.currencySymbol}
            />
          )}

          {currentPage === 'risk' && (
            <RiskView
              riskSettings={riskSettings}
              currentDrawdown={stats.currentDrawdown}
              onSaveRiskSettings={handleSaveRiskSettings}
              currencySymbol={riskSettings.currencySymbol}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              trades={trades}
              riskSettings={riskSettings}
              userSettings={userSettings}
              onSaveUserSettings={handleSaveUserSettings}
              onImportBackup={handleImportBackup}
              onClearDatabase={handleClearDatabase}
              onSeedDemoData={handleSeedDemoData}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Trade Modal */}
      <AddTradeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTrade}
        initialTrade={tradeToEdit}
        currentBalance={stats.currentBalance}
        currencySymbol={riskSettings.currencySymbol}
      />
    </div>
  );
}
