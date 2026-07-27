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
  FileText,
  AlertTriangle,
  X,
  CheckSquare,
  Plus,
  RotateCcw
} from 'lucide-react';

import { Trade, RiskSettings, UserSettings, ChecklistItem } from '../../types';
import { exportTradesToCSV, exportBackupJSON } from '../../services/export';
import { DEFAULT_CHECKLIST_ITEMS } from '../../services/db';

interface SettingsViewProps {
  trades: Trade[];
  riskSettings: RiskSettings;
  userSettings: UserSettings;
  onSaveUserSettings: (settings: UserSettings) => void;
  onImportBackup: (data: { trades: Trade[]; riskSettings: RiskSettings }) => void;
  onClearDatabase: () => void | Promise<void>;
  onSeedDemoData: () => void | Promise<void>;
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
  const [message, setMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [confirmModal, setConfirmModal] = useState<'clear' | 'seed' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    userSettings.checklistItems && userSettings.checklistItems.length > 0
      ? userSettings.checklistItems
      : DEFAULT_CHECKLIST_ITEMS
  );
  const [newRuleText, setNewRuleText] = useState('');

  const showFeedback = (msg: string, isError = false) => {
    setMessage({ text: msg, isError });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleUpdateRuleLabel = (id: string, newLabel: string) => {
    const updated = checklistItems.map((item) =>
      item.id === id ? { ...item, label: newLabel } : item
    );
    setChecklistItems(updated);
    onSaveUserSettings({ ...userSettings, checklistItems: updated });
  };

  const handleDeleteRule = (id: string) => {
    if (checklistItems.length <= 1) {
      showFeedback('At least 1 checklist rule is required.', true);
      return;
    }
    const updated = checklistItems.filter((item) => item.id !== id);
    setChecklistItems(updated);
    onSaveUserSettings({ ...userSettings, checklistItems: updated });
    showFeedback('Checklist rule removed.');
  };

  const handleAddRule = () => {
    if (!newRuleText.trim()) return;
    const newItem: ChecklistItem = {
      id: `rule_${Date.now()}`,
      label: newRuleText.trim(),
    };
    const updated = [...checklistItems, newItem];
    setChecklistItems(updated);
    setNewRuleText('');
    onSaveUserSettings({ ...userSettings, checklistItems: updated });
    showFeedback('New checklist rule added!');
  };

  const handleResetChecklist = () => {
    setChecklistItems(DEFAULT_CHECKLIST_ITEMS);
    onSaveUserSettings({ ...userSettings, checklistItems: DEFAULT_CHECKLIST_ITEMS });
    showFeedback('Checklist rules reset to defaults.');
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
          showFeedback('Invalid JSON structure. "trades" array missing.', true);
        }
      } catch (err) {
        showFeedback('Failed to parse backup JSON file.', true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Estimate storage usage
  const jsonString = JSON.stringify(trades);
  const storageKb = (new Blob([jsonString]).size / 1024).toFixed(1);

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Toast feedback */}
      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between gap-2 border ${
          message.isError 
            ? 'bg-[#D32F2F]/15 border-[#D32F2F]/40 text-[#F44336]' 
            : 'bg-[#4CAF50]/15 border-[#4CAF50]/40 text-[#4CAF50]'
        }`}>
          <div className="flex items-center gap-2">
            {message.isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
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

      {/* Pre-Entry Checklist Customization Section */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D2D2D] pb-3">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#FF7A00]" /> Pre-Entry Checklist Rules
            </h3>
            <p className="text-xs text-[#8B8B8B]">Customize, edit, add, or remove pre-entry verification rules for your trading system</p>
          </div>
          <button
            onClick={handleResetChecklist}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#202020] hover:bg-[#2A2A2A] text-[#B8B8B8] hover:text-white rounded-lg text-xs font-semibold border border-[#343434] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF7A00]" /> Reset to Defaults
          </button>
        </div>

        {/* Existing Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {checklistItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-2 bg-[#111111] border border-[#2D2D2D] focus-within:border-[#FF7A00] p-2.5 rounded-xl transition-all"
            >
              <span className="text-[10px] font-mono text-[#777777] w-6 text-center font-bold shrink-0">
                #{index + 1}
              </span>
              <input
                type="text"
                value={item.label}
                onChange={(e) => handleUpdateRuleLabel(item.id, e.target.value)}
                placeholder="Enter rule description..."
                className="flex-1 bg-transparent text-xs text-white font-medium outline-none"
              />
              <button
                onClick={() => handleDeleteRule(item.id)}
                className="p-1.5 text-[#777777] hover:text-[#F44336] hover:bg-[#202020] rounded-lg transition-colors cursor-pointer shrink-0"
                title="Delete rule"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Rule Input */}
        <div className="pt-2 flex items-center gap-2">
          <input
            type="text"
            value={newRuleText}
            onChange={(e) => setNewRuleText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRule(); } }}
            placeholder="Add new rule (e.g. 4H HTF Bias Confirmed, Max Risk ≤ 1%...)"
            className="flex-1 bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#777777] outline-none"
          />
          <button
            onClick={handleAddRule}
            className="flex items-center gap-1.5 bg-[#FF7A00] hover:bg-[#FF8E26] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#FF7A00]/20 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Rule
          </button>
        </div>
      </div>

      {/* PWA & Local Execution Guide */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-6 space-y-4">
        <div className="border-b border-[#2D2D2D] pb-3">
          <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#FF7A00]" /> Offline Smartphone & PC Guide
          </h3>
          <p className="text-xs text-[#8B8B8B]">How to run this app offline on Android, iOS, or PC with local data storage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#111111] p-4 rounded-xl border border-[#2D2D2D] space-y-2">
            <h4 className="font-bold text-[#FF7A00] flex items-center gap-1.5 text-sm">
              <span>1. Install as PWA on Smartphone (Best Method)</span>
            </h4>
            <p className="text-[#B8B8B8] leading-relaxed">
              Install directly to your smartphone home screen without needing any local server:
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 pl-1">
              <li><strong className="text-white">Android (Chrome):</strong> Tap <b>⋮ (3 dots)</b> → <b>Install App</b> or <b>Add to Home Screen</b>.</li>
              <li><strong className="text-white">iPhone / iPad (Safari):</strong> Tap <b>Share icon</b> → <b>Add to Home Screen</b>.</li>
              <li>Once added, it runs 100% offline like a native app!</li>
            </ul>
          </div>

          <div className="bg-[#111111] p-4 rounded-xl border border-[#2D2D2D] space-y-2">
            <h4 className="font-bold text-[#4CAF50] flex items-center gap-1.5 text-sm">
              <span>2. Offline Local Storage Safety</span>
            </h4>
            <p className="text-[#B8B8B8] leading-relaxed">
              All trade journals, metrics, and screenshots are stored directly in your browser / smartphone's <b>localStorage & IndexedDB</b>:
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 pl-1">
              <li>Data persists even when closed or offline.</li>
              <li>Use the <b>Export Data Backup (JSON)</b> button below to transfer trades between devices or keep backups.</li>
            </ul>
          </div>

          <div className="bg-[#111111] p-4 rounded-xl border border-[#2D2D2D] space-y-2">
            <h4 className="font-bold text-[#4A90E2] flex items-center gap-1.5 text-sm">
              <span>3. Opening via Static index.html File</span>
            </h4>
            <p className="text-[#B8B8B8] leading-relaxed">
              If opening built HTML files directly from smartphone storage (<code className="text-[#FF7A00]">file://</code>):
            </p>
            <ul className="list-disc list-inside text-[#8B8B8B] space-y-1 pl-1">
              <li>Modern mobile browsers block ES modules over <code className="text-[#FF7A00]">file://</code> protocol due to CORS security.</li>
              <li>Use a free app like <b>AWebServer</b> or <b>WebIntoApp</b> on Android to convert the folder into a standalone APK file.</li>
            </ul>
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
            onClick={() => setConfirmModal('seed')}
            className="px-4 py-2 bg-[#202020] hover:bg-[#2D2D2D] text-white text-xs font-semibold rounded-lg transition-colors border border-[#343434]"
          >
            Re-seed Sample Demo Trades
          </button>

          <button
            onClick={() => setConfirmModal('clear')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D32F2F] hover:bg-[#F44336] text-white text-xs font-bold rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" /> Clear Entire Database
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-[#2D2D2D] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${confirmModal === 'clear' ? 'bg-[#D32F2F]/20 text-[#F44336]' : 'bg-[#FF7A00]/20 text-[#FF7A00]'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {confirmModal === 'clear' ? 'Clear Entire Database?' : 'Re-seed Sample Demo Trades?'}
                </h3>
                <p className="text-xs text-[#B8B8B8] leading-relaxed">
                  {confirmModal === 'clear'
                    ? 'CRITICAL WARNING: This will permanently delete all trade records and logs from your local IndexedDB storage. This action cannot be undone.'
                    : 'This will reset and overwrite your current trading journal with sample demo trade records. Existing trades will be replaced.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2D2D2D]">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-[#202020] hover:bg-[#2D2D2D] text-[#B8B8B8] hover:text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (confirmModal === 'clear') {
                    await onClearDatabase();
                    showFeedback('IndexedDB database cleared successfully!');
                  } else {
                    await onSeedDemoData();
                    showFeedback('Sample demo dataset re-seeded successfully!');
                  }
                  setConfirmModal(null);
                }}
                className={`px-4 py-2 text-white text-xs font-bold rounded-lg transition-all ${
                  confirmModal === 'clear'
                    ? 'bg-[#D32F2F] hover:bg-[#F44336]'
                    : 'bg-[#FF7A00] hover:bg-[#FF8E26]'
                }`}
              >
                {confirmModal === 'clear' ? 'Yes, Clear Database' : 'Yes, Re-seed Dataset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
