import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
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
import { 
  onAuthChange, 
  subscribeUserTrades, 
  saveTradeToFirestore, 
  deleteTradeFromFirestore, 
  clearAllUserTradesFirestore, 
  replaceAllUserTradesFirestore, 
  seedInitialTradesIfEmpty,
  loadRiskSettingsFromFirestore,
  saveRiskSettingsToFirestore,
  loadUserSettingsFromFirestore,
  saveUserSettingsToFirestore
} from './services/firebase';
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
  const [user, setUser] = useState<User | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTradeId, setActiveTradeId] = useState<string | null>(null);
  
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(DEFAULT_RISK_SETTINGS);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isCmdKOpen, setIsCmdKOpen] = useState<boolean>(false);
  const [cmdSearchQuery, setCmdSearchQuery] = useState<string>('');
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigLoaded, setIsConfigLoaded] = useState<boolean>(false);

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // Fallback to IndexedDB when user is logged out
        loadLocalData();
      }
    });
    return () => unsubscribe();
  }, []);

  // Function to load local data from IndexedDB
  const loadLocalData = async () => {
    try {
      const loadedTrades = await loadTradesFromDB();
      const loadedRisk = await loadRiskSettingsDB();
      const loadedUser = await loadUserSettingsDB();

      setTrades(loadedTrades);
      setRiskSettings(loadedRisk);
      setUserSettings(loadedUser);
    } catch (err) {
      console.error('Failed to load local data:', err);
    } finally {
      setIsLoading(false);
      setIsConfigLoaded(true);
    }
  };

  // 2. Real-time Firestore sync when user is signed in
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    setIsConfigLoaded(false);

    // Load user settings & risk settings from Firestore
    async function initUserCloudConfig() {
      if (!user) return;
      try {
        const cloudRisk = await loadRiskSettingsFromFirestore(user.uid);
        const cloudUser = await loadUserSettingsFromFirestore(user.uid);
        setRiskSettings(cloudRisk);
        setUserSettings(cloudUser);

        // Also cache locally in IndexedDB for offline support
        saveRiskSettingsDB(cloudRisk);
        saveUserSettingsDB(cloudUser);

        // Seed initial sample trades into Firestore if brand new user
        await seedInitialTradesIfEmpty(user.uid);
      } catch (err) {
        console.error('Failed to initialize user cloud settings:', err);
      } finally {
        setIsConfigLoaded(true);
      }
    }

    initUserCloudConfig();

    // Real-time Firestore listener for trades
    const unsubscribeTrades = subscribeUserTrades(user.uid, (cloudTrades) => {
      setTrades(cloudTrades);
      setIsLoading(false);
    });

    return () => unsubscribeTrades();
  }, [user]);

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

  // Sync riskSettings currentBalance with overall trades stats automatically (only after config is loaded)
  useEffect(() => {
    if (!isConfigLoaded) return;

    if (trades.length > 0) {
      const stats = calculateOverallStats(trades, riskSettings);
      if (stats.currentBalance !== riskSettings.currentBalance) {
        const updatedRisk = { ...riskSettings, currentBalance: stats.currentBalance };
        setRiskSettings(updatedRisk);
        if (user) {
          saveRiskSettingsToFirestore(user.uid, updatedRisk);
          saveRiskSettingsDB(updatedRisk);
        } else {
          saveRiskSettingsDB(updatedRisk);
        }
      }
    } else {
      if (riskSettings.currentBalance !== riskSettings.startingBalance) {
        const updatedRisk = { ...riskSettings, currentBalance: riskSettings.startingBalance };
        setRiskSettings(updatedRisk);
        if (user) {
          saveRiskSettingsToFirestore(user.uid, updatedRisk);
          saveRiskSettingsDB(updatedRisk);
        } else {
          saveRiskSettingsDB(updatedRisk);
        }
      }
    }
  }, [trades, user, isConfigLoaded]);

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
    if (user) {
      await saveTradeToFirestore(user.uid, savedTrade);
    } else {
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
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (user) {
      await deleteTradeFromFirestore(user.uid, tradeId);
    } else {
      await deleteTradeFromDB(tradeId);
      setTrades((prev) => prev.filter((t) => t.id !== tradeId));
    }
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

    if (user) {
      await saveTradeToFirestore(user.uid, duplicated);
    } else {
      await saveTradeToDB(duplicated);
      setTrades((prev) => [duplicated, ...prev]);
    }
  };

  const handleSaveRiskSettings = async (newSettings: RiskSettings) => {
    const stats = calculateOverallStats(trades, newSettings);
    const updatedWithBalance: RiskSettings = {
      ...newSettings,
      currentBalance: stats.currentBalance,
    };

    setRiskSettings(updatedWithBalance);
    if (user) {
      await saveRiskSettingsToFirestore(user.uid, updatedWithBalance);
      await saveRiskSettingsDB(updatedWithBalance);
    } else {
      await saveRiskSettingsDB(updatedWithBalance);
    }
  };

  const handleSaveUserSettings = async (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    if (user) {
      await saveUserSettingsToFirestore(user.uid, newSettings);
      await saveUserSettingsDB(newSettings);
    } else {
      await saveUserSettingsDB(newSettings);
    }
  };

  const handleClearDatabase = async () => {
    if (user) {
      await clearAllUserTradesFirestore(user.uid);
    } else {
      await clearAllTradesDB();
      setTrades([]);
    }
    setActiveTradeId(null);
    setCurrentPage('dashboard');
  };

  const handleSeedDemoData = async () => {
    const samples = getSampleTrades();
    if (user) {
      await replaceAllUserTradesFirestore(user.uid, samples);
    } else {
      await replaceAllTradesDB(samples);
      setTrades(samples);
    }
    if (samples.length > 0) setActiveTradeId(samples[0].id);
  };

  const handleImportBackup = async (data: { trades: Trade[]; riskSettings: RiskSettings }) => {
    if (data.trades) {
      if (user) {
        await replaceAllUserTradesFirestore(user.uid, data.trades);
      } else {
        await replaceAllTradesDB(data.trades);
        setTrades(data.trades);
      }
    }
    if (data.riskSettings) {
      setRiskSettings(data.riskSettings);
      if (user) {
        await saveRiskSettingsToFirestore(user.uid, data.riskSettings);
      } else {
        await saveRiskSettingsDB(data.riskSettings);
      }
    }
  };

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
        user={user}
        onNavigate={(page) => {
          handleNavigate(page);
          setIsMobileNavOpen(false);
        }}
        activeTradeId={activeTradeId}
        mobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#000000]">
        {/* Top Header */}
        <TopNav
          currentPage={currentPage}
          user={user}
          onOpenAddModal={() => handleOpenAddModal()}
          onOpenCmdK={() => setIsCmdKOpen(true)}
          riskSettings={riskSettings}
          currentDrawdown={stats.currentDrawdown}
          onSearchChange={setGlobalSearch}
          onToggleMobileMenu={() => setIsMobileNavOpen((prev) => !prev)}
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
              userSettings={userSettings}
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
              user={user}
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
        userSettings={userSettings}
        onSaveUserSettings={handleSaveUserSettings}
      />
    </div>
  );
}

