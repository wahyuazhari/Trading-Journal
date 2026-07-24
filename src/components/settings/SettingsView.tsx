import React, { useRef, useState } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Trash2, 
  RefreshCw, 
  Database, 
  DollarSign, 
  CheckCircle,
  FileText
} from 'lucide-react';

import { Trade, RiskSettings, UserSettings } from '../../types';
import { exportTradesToCSV, exportBackupJSON } from '../../services/export';

interface SettingsViewProps {
  trades: Trade[];
  riskSettings: RiskSettings;
  userSettings: UserSettings;
  onSaveUserSettings: (settings: UserSettings) => void;
  onImportBackup: (data: { trades: Trade[]; riskSettings: RiskSettings }) => void;
  onClearDatabase: () => void;
  onSeedDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  trades,
  riskSettings,
  userSettings,
  onSaveUserSettings,
  onImportBackup,
  onClearDatabase,
  onSeedDemoData,
}) => {
  const [currency, setCurrency] = useState<string>(userSettings.currency || '$');
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrency(val);
    onSaveUserSettings({ ...userSettings, currency: val });
    showFeedback('Currency updated');
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed && Array.isArray(parsed.trades)) {
          onImportBackup({
            trades: parsed.trades,
            riskSettings: parsed.riskSettings || riskSettings,
          });
          showFeedback('Database restored successfully from backup JSON!');
        } else {
          alert('Invalid JSON structure. "trades" array missing.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Estimate storage usage
  const jsonString = JSON.stringify(trades);
  const storageKb = (new Blob([jsonString]).size / 1024).toFixed(1);

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Toast feedback */}
      {message && (
        <div className="bg-[#4CAF50]/15 border border-[#4CAF50]/40 text-[#4CAF50] p-4 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {message}
        </div>
      )}

      {/* Preferences Section */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-6 space-y-4">
        <div className="border-b border-[#2D2D2D] pb-3">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FF7A00]" /> General Preferences
          </h3>
          <p className="text-xs text-[#8B8B8B]">Display currency and terminal appearance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block text-[#B8B8B8] font-medium mb-1.5">Terminal Currency Symbol</label>
            <select
              value={currency}
              onChange={handleCurrencyChange}
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3.5 py-2.5 text-white font-bold outline-none"
            >
              <option value="$">$ USD / Cash Symbol</option>
              <option value="€">€ EUR / Euro Symbol</option>
              <option value="£">£ GBP / Pound Symbol</option>
              <option value="¥">¥ JPY / Yen Symbol</option>
              <option value="Rp">Rp IDR / Rupiah Symbol</option>
            </select>
          </div>

          <div>
            <label className="block text-[#B8B8B8] font-medium mb-1.5">Theme Mode</label>
            <div className="bg-[#111111] border border-[#2D2D2D] p-2.5 rounded-lg text-white font-bold text-xs flex items-center justify-between">
              <span>Dark Trading Terminal (TradingView Style)</span>
              <span className="px-2 py-0.5 rounded bg-[#FF7A00]/20 text-[#FF7A00] text-[10px]">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup & Data Export Section */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-6 space-y-4">
        <div className="border-b border-[#2D2D2D] pb-3">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Database className="w-5 h-5 text-[#FF7A00]" /> Backup & Export Data
          </h3>
          <p className="text-xs text-[#8B8B8B]">100% offline data portability. Export spreadsheets or full JSON snapshots.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => {
              exportTradesToCSV(trades);
              showFeedback('Exported trades to CSV');
            }}
            className="flex flex-col items-center justify-center gap-2 p-5 bg-[#111111] hover:bg-[#1D1D1D] border border-[#2D2D2D] rounded-xl text-white transition-all group"
          >
            <FileSpreadsheet className="w-6 h-6 text-[#4CAF50] group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs">Export CSV Ledger</span>
            <span className="text-[10px] text-[#8B8B8B]">Spreadsheet format</span>
          </button>

          <button
            onClick={() => {
              exportBackupJSON({ trades, riskSettings });
              showFeedback('Exported full JSON backup');
            }}
            className="flex flex-col items-center justify-center gap-2 p-5 bg-[#111111] hover:bg-[#1D1D1D] border border-[#2D2D2D] rounded-xl text-white transition-all group"
          >
            <Download className="w-6 h-6 text-[#FF7A00] group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs">Export Full JSON Backup</span>
            <span className="text-[10px] text-[#8B8B8B]">Complete database dump</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 p-5 bg-[#111111] hover:bg-[#1D1D1D] border border-[#2D2D2D] rounded-xl text-white transition-all group"
          >
            <Upload className="w-6 h-6 text-[#4A90E2] group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs">Restore JSON Backup</span>
            <span className="text-[10px] text-[#8B8B8B]">Import JSON backup file</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleJsonUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Database Maintenance & Reset */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-6 space-y-4">
        <div className="border-b border-[#2D2D2D] pb-3">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#FF7A00]" /> Database Diagnostics & Maintenance
          </h3>
          <p className="text-xs text-[#8B8B8B]">Manage IndexedDB local storage allocation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-[#111111] p-4 rounded-xl border border-[#2D2D2D]">
            <span className="text-[#8B8B8B] block text-[10px] uppercase">Logged Trades Count</span>
            <span className="text-lg font-bold text-white">{trades.length} Trades</span>
          </div>
          <div className="bg-[#111111] p-4 rounded-xl border border-[#2D2D2D]">
            <span className="text-[#8B8B8B] block text-[10px] uppercase">Estimated IndexedDB Size</span>
            <span className="text-lg font-bold text-white">{storageKb} KB</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#2D2D2D]">
          <button
            onClick={() => {
              if (window.confirm('Reset database with sample demo trades? Current trades will be overwritten.')) {
                onSeedDemoData();
                showFeedback('Sample demo dataset re-seeded!');
              }
            }}
            className="px-4 py-2 bg-[#202020] hover:bg-[#2D2D2D] text-white text-xs font-semibold rounded-lg transition-colors border border-[#343434]"
          >
            Re-seed Sample Demo Trades
          </button>

          <button
            onClick={() => {
              if (window.confirm('CRITICAL WARNING: Clear all trades permanently from IndexedDB? This action cannot be undone.')) {
                onClearDatabase();
                showFeedback('IndexedDB database cleared!');
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] hover:bg-[#F44336] text-white text-xs font-bold rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" /> Clear Entire Database
          </button>
        </div>
      </div>
    </div>
  );
};
