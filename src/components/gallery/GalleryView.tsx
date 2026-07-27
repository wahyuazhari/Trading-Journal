import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Maximize2, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Images, 
  X,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Trade } from '../../types';

interface GalleryViewProps {
  trades: Trade[];
  onSelectTrade: (tradeId: string) => void;
  currencySymbol: string;
}

interface ScreenshotItem {
  id: string;
  tradeId: string;
  type: 'Before' | 'After';
  imageUrl: string;
  trade: Trade;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ trades, onSelectTrade, currencySymbol }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeTab, setTypeTab] = useState<'ALL' | 'Before' | 'After'>('ALL');
  const [filterPair, setFilterPair] = useState<string>('ALL');
  const [filterDirection, setFilterDirection] = useState<string>('ALL');
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // Extract all valid screenshots from trades
  const screenshots: ScreenshotItem[] = [];
  trades.forEach((trade) => {
    if (trade.screenshotBefore) {
      screenshots.push({
        id: `${trade.id}-before`,
        tradeId: trade.id,
        type: 'Before',
        imageUrl: trade.screenshotBefore,
        trade,
      });
    }
    if (trade.screenshotAfter) {
      screenshots.push({
        id: `${trade.id}-after`,
        tradeId: trade.id,
        type: 'After',
        imageUrl: trade.screenshotAfter,
        trade,
      });
    }
  });

  const uniquePairs = Array.from(new Set(screenshots.map(s => s.trade.pair)));

  // Filter screenshots
  const filteredScreenshots = screenshots.filter((s) => {
    const t = s.trade;
    const matchesSearch =
      t.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.analysis?.strategy || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeTab === 'ALL' || s.type === typeTab;
    const matchesPair = filterPair === 'ALL' || t.pair === filterPair;
    const matchesDirection = filterDirection === 'ALL' || t.direction === filterDirection;
    const matchesResult = filterResult === 'ALL' || t.result === filterResult;

    return matchesSearch && matchesType && matchesPair && matchesDirection && matchesResult;
  });

  const selectedItem = selectedItemIndex !== null ? filteredScreenshots[selectedItemIndex] : null;

  const handleNext = useCallback(() => {
    if (selectedItemIndex !== null && selectedItemIndex < filteredScreenshots.length - 1) {
      setSelectedItemIndex(selectedItemIndex + 1);
    }
  }, [selectedItemIndex, filteredScreenshots.length]);

  const handlePrev = useCallback(() => {
    if (selectedItemIndex !== null && selectedItemIndex > 0) {
      setSelectedItemIndex(selectedItemIndex - 1);
    }
  }, [selectedItemIndex]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedItemIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedItemIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemIndex, handleNext, handlePrev]);

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setTypeTab('ALL');
    setFilterPair('ALL');
    setFilterDirection('ALL');
    setFilterResult('ALL');
  };

  const winCount = filteredScreenshots.filter(s => s.trade.result === 'Win').length;
  const lossCount = filteredScreenshots.filter(s => s.trade.result === 'Loss').length;

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Gallery Header & Filters Container */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-5 space-y-4">
        {/* Title & Stats Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] rounded-xl shrink-0">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Chart Screenshot Gallery
              </h3>
              <p className="text-[11px] sm:text-xs text-[#8B8B8B]">
                {filteredScreenshots.length} {filteredScreenshots.length === 1 ? 'chart setup' : 'chart setups'} cataloged
              </p>
            </div>
          </div>

          {/* Quick Stats Chips */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="bg-[#111111] border border-[#2D2D2D] px-2.5 py-1 rounded-lg text-xs font-mono">
              <span className="text-[#8B8B8B] text-[10px] mr-1.5 uppercase">Wins</span>
              <span className="text-[#4CAF50] font-bold">{winCount}</span>
            </div>
            <div className="bg-[#111111] border border-[#2D2D2D] px-2.5 py-1 rounded-lg text-xs font-mono">
              <span className="text-[#8B8B8B] text-[10px] mr-1.5 uppercase">Losses</span>
              <span className="text-[#FF7A00] font-bold">{lossCount}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Row 1: Type Segment Tabs & Search */}
        <div className="flex flex-col md:flex-row gap-2.5 pt-3 border-t border-[#2D2D2D]">
          {/* Segmented Type Switcher */}
          <div className="flex items-center bg-[#111111] border border-[#2D2D2D] p-1 rounded-lg shrink-0">
            <button
              onClick={() => setTypeTab('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                typeTab === 'ALL' ? 'bg-[#FF7A00] text-white shadow' : 'text-[#8B8B8B] hover:text-white'
              }`}
            >
              All Charts ({screenshots.length})
            </button>
            <button
              onClick={() => setTypeTab('Before')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                typeTab === 'Before' ? 'bg-[#FF7A00] text-white shadow' : 'text-[#8B8B8B] hover:text-white'
              }`}
            >
              Before ({screenshots.filter(s => s.type === 'Before').length})
            </button>
            <button
              onClick={() => setTypeTab('After')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                typeTab === 'After' ? 'bg-[#FF7A00] text-white shadow' : 'text-[#8B8B8B] hover:text-white'
              }`}
            >
              After ({screenshots.filter(s => s.type === 'After').length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pair, strategy, rationale..."
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-[#777777] outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#777777] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row 2: Select Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <select
            value={filterPair}
            onChange={(e) => setFilterPair(e.target.value)}
            className="bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
          >
            <option value="ALL">All Pairs ({uniquePairs.length})</option>
            {uniquePairs.map((pair) => (
              <option key={pair} value={pair}>{pair}</option>
            ))}
          </select>

          <select
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className="bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer"
          >
            <option value="ALL">All Directions</option>
            <option value="Long">Long</option>
            <option value="Short">Short</option>
          </select>

          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer col-span-2 sm:col-span-1"
          >
            <option value="ALL">All Outcomes</option>
            <option value="Win">Win</option>
            <option value="Loss">Loss</option>
            <option value="Break Even">Break Even</option>
          </select>
        </div>
      </div>

      {/* Screenshot Grid Catalog */}
      {filteredScreenshots.length === 0 ? (
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-10 text-center space-y-3">
          <p className="text-xs sm:text-sm text-[#8B8B8B]">No chart screenshots match your current filter criteria.</p>
          <button
            onClick={resetFilters}
            className="px-3.5 py-1.5 bg-[#202020] hover:bg-[#2A2A2A] text-xs font-semibold text-white rounded-lg border border-[#333333] transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {filteredScreenshots.map((item, idx) => {
            const isWin = item.trade.result === 'Win';
            const isLoss = item.trade.result === 'Loss';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItemIndex(idx)}
                className="bg-[#151515] border border-[#2D2D2D] hover:border-[#FF7A00] rounded-[14px] overflow-hidden group cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-black/40 flex flex-col justify-between"
              >
                {/* Image Aspect Container */}
                <div className="relative aspect-[16/10] bg-[#0c0c0e] overflow-hidden flex items-center justify-center">
                  <img
                    src={item.imageUrl}
                    alt={item.trade.pair}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Top Left Badge: Type */}
                  <div className={`absolute top-2.5 left-2.5 text-[9px] font-bold px-2 py-0.5 rounded border shadow-md uppercase tracking-wider ${
                    item.type === 'Before'
                      ? 'bg-black/85 text-[#FF7A00] border-[#FF7A00]/40'
                      : 'bg-black/85 text-[#4CAF50] border-[#4CAF50]/40'
                  }`}>
                    {item.type}
                  </div>

                  {/* Top Right Badge: Direction */}
                  <div className={`absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded border shadow-md uppercase font-mono ${
                    item.trade.direction === 'Long'
                      ? 'bg-[#4CAF50]/20 text-[#4CAF50] border-[#4CAF50]/30'
                      : 'bg-[#FF7A00]/20 text-[#FF7A00] border-[#FF7A00]/30'
                  }`}>
                    {item.trade.direction}
                  </div>

                  {/* Quick Zoom Hover Button overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="p-2 bg-[#FF7A00] text-white rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="p-3 space-y-2 bg-[#151515]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-white text-xs sm:text-sm font-mono truncate">{item.trade.pair}</span>
                      {item.trade.analysis?.strategy && (
                        <span className="text-[9px] bg-[#202020] text-[#B8B8B8] px-1.5 py-0.2 rounded border border-[#2B2B2B] truncate hidden sm:inline">
                          {item.trade.analysis.strategy}
                        </span>
                      )}
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      isWin
                        ? 'bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30'
                        : isLoss
                        ? 'bg-[#FF7A00]/15 text-[#FF7A00] border border-[#FF7A00]/30'
                        : 'bg-[#333333] text-[#B8B8B8] border border-[#444444]'
                    }`}>
                      {item.trade.result}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8B8B8B]">
                    <span>{item.trade.date}</span>
                    <span className={`font-bold ${item.trade.pnl >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'}`}>
                      {item.trade.pnl >= 0 ? '+' : ''}{currencySymbol}{item.trade.pnl.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Fullscreen Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-3 sm:p-6 overflow-y-auto">
          {/* Lightbox Top Control Bar */}
          <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-[#2D2D2D] shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-sm sm:text-base font-mono text-white truncate">
                {selectedItem.trade.pair}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                selectedItem.type === 'Before' ? 'bg-[#FF7A00]/20 text-[#FF7A00]' : 'bg-[#4CAF50]/20 text-[#4CAF50]'
              }`}>
                {selectedItem.type} Chart
              </span>
              <span className="text-xs text-[#8B8B8B] hidden sm:inline">
                ({selectedItemIndex! + 1} of {filteredScreenshots.length})
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onSelectTrade(selectedItem.trade.id)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#FF7A00] hover:bg-[#FF8E26] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Trade Detail</span>
              </button>
              <button
                onClick={() => downloadImage(selectedItem.imageUrl, `${selectedItem.trade.pair}_${selectedItem.type}`)}
                className="p-1.5 bg-[#202020] hover:bg-[#2D2D2D] text-white rounded-lg transition-colors cursor-pointer"
                title="Download Screenshot"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedItemIndex(null)}
                className="p-1.5 bg-[#202020] hover:bg-[#F44336] text-white rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lightbox Body Content */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
            {/* Image Viewer Container */}
            <div className="lg:col-span-2 relative flex items-center justify-center bg-[#0c0c0e] border border-[#2D2D2D] rounded-xl h-[300px] xs:h-[380px] sm:h-[480px] lg:h-[540px] overflow-hidden p-2 group">
              <img
                src={selectedItem.imageUrl}
                alt="Screenshot Detail"
                className="max-h-full max-w-full object-contain rounded-lg select-none"
              />

              {/* Prev / Next Navigation Controls */}
              <button
                onClick={handlePrev}
                disabled={selectedItemIndex === 0}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 bg-black/80 hover:bg-[#FF7A00] text-white rounded-full transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer shadow-lg"
                title="Previous Image (Left Arrow)"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={handleNext}
                disabled={selectedItemIndex === filteredScreenshots.length - 1}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 bg-black/80 hover:bg-[#FF7A00] text-white rounded-full transition-colors disabled:opacity-20 disabled:pointer-events-none cursor-pointer shadow-lg"
                title="Next Image (Right Arrow)"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Side Detail Card */}
            <div className="bg-[#151515] border border-[#2D2D2D] rounded-xl p-4 sm:p-5 space-y-3.5 text-xs text-white">
              <div className="border-b border-[#2D2D2D] pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base font-mono flex items-center gap-2">
                    {selectedItem.trade.pair}
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans uppercase ${
                      selectedItem.trade.direction === 'Long' ? 'bg-[#4CAF50]/20 text-[#4CAF50]' : 'bg-[#FF7A00]/20 text-[#FF7A00]'
                    }`}>
                      {selectedItem.trade.direction}
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#8B8B8B] mt-0.5">{selectedItem.trade.date} at {selectedItem.trade.time}</p>
                </div>

                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  selectedItem.trade.result === 'Win' ? 'bg-[#4CAF50] text-white' : 'bg-[#FF7A00] text-white'
                }`}>
                  {selectedItem.trade.result}
                </span>
              </div>

              {/* Trade Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 font-mono bg-[#111111] p-3 rounded-lg border border-[#2A2A2A]">
                <div>
                  <span className="text-[#8B8B8B] block text-[9px] uppercase">ENTRY PRICE</span>
                  <span className="font-bold text-white text-xs">{selectedItem.trade.entryPrice}</span>
                </div>
                <div>
                  <span className="text-[#8B8B8B] block text-[9px] uppercase">EXIT PRICE</span>
                  <span className="font-bold text-white text-xs">{selectedItem.trade.exitPrice ?? 'Ongoing'}</span>
                </div>
                <div>
                  <span className="text-[#8B8B8B] block text-[9px] uppercase">STOP LOSS</span>
                  <span className="text-[#FF7A00] font-bold text-xs">{selectedItem.trade.stopLoss}</span>
                </div>
                <div>
                  <span className="text-[#8B8B8B] block text-[9px] uppercase">TAKE PROFIT</span>
                  <span className="text-[#4CAF50] font-bold text-xs">{selectedItem.trade.takeProfit}</span>
                </div>
                <div>
                  <span className="text-[#8B8B8B] block text-[9px] uppercase">RISK : REWARD</span>
                  <span className="text-[#FF7A00] font-bold text-xs">1 : {selectedItem.trade.rr}</span>
                </div>
                <div>
                  <span className="text-[#8B8B8B] block text-[9px] uppercase">NET PNL</span>
                  <span className={`font-bold text-xs ${selectedItem.trade.pnl >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'}`}>
                    {selectedItem.trade.pnl >= 0 ? '+' : ''}{currencySymbol}{selectedItem.trade.pnl.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Setup / Strategy & Rationale */}
              <div className="space-y-2">
                {selectedItem.trade.analysis?.strategy && (
                  <div>
                    <span className="text-[#8B8B8B] text-[10px] block uppercase font-bold mb-1">Strategy / Setup</span>
                    <span className="inline-block bg-[#202020] text-white text-xs px-2.5 py-1 rounded border border-[#333333]">
                      {selectedItem.trade.analysis.strategy}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-[#8B8B8B] text-[10px] block uppercase font-bold mb-1">Trade Rationale</span>
                  <div className="text-[#B8B8B8] leading-relaxed max-h-36 overflow-y-auto bg-[#111111] p-2.5 rounded border border-[#2D2D2D] text-xs">
                    {selectedItem.trade.notes || 'No notes provided for this trade.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

