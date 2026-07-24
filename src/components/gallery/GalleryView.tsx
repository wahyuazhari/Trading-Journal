import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Maximize2, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Images, 
  X 
} from 'lucide-react';
import { Trade, NavigationPage } from '../../types';

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

    const matchesPair = filterPair === 'ALL' || t.pair === filterPair;
    const matchesDirection = filterDirection === 'ALL' || t.direction === filterDirection;
    const matchesResult = filterResult === 'ALL' || t.result === filterResult;

    return matchesSearch && matchesPair && matchesDirection && matchesResult;
  });

  const selectedItem = selectedItemIndex !== null ? filteredScreenshots[selectedItemIndex] : null;

  const handleNext = () => {
    if (selectedItemIndex !== null && selectedItemIndex < filteredScreenshots.length - 1) {
      setSelectedItemIndex(selectedItemIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedItemIndex !== null && selectedItemIndex > 0) {
      setSelectedItemIndex(selectedItemIndex - 1);
    }
  };

  const downloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Gallery Header & Filters Bar */}
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Images className="w-5 h-5 text-[#FF7A00]" /> Screenshot Gallery Catalog
            </h3>
            <p className="text-xs text-[#8B8B8B]">
              Viewing {filteredScreenshots.length} chart setups across {trades.length} trades
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#2D2D2D]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#777777] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pair, strategy..."
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#777777] outline-none"
            />
          </div>

          <div>
            <select
              value={filterPair}
              onChange={(e) => setFilterPair(e.target.value)}
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-xs text-white outline-none"
            >
              <option value="ALL">All Pairs ({uniquePairs.length})</option>
              {uniquePairs.map((pair) => (
                <option key={pair} value={pair}>{pair}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value)}
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-xs text-white outline-none"
            >
              <option value="ALL">All Directions</option>
              <option value="Long">Long</option>
              <option value="Short">Short</option>
            </select>
          </div>

          <div>
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="w-full bg-[#111111] border border-[#2D2D2D] focus:border-[#FF7A00] rounded-lg px-3 py-2 text-xs text-white outline-none"
            >
              <option value="ALL">All Outcomes</option>
              <option value="Win">Win</option>
              <option value="Loss">Loss</option>
              <option value="Break Even">Break Even</option>
            </select>
          </div>
        </div>
      </div>

      {/* Screenshot Grid Layout */}
      {filteredScreenshots.length === 0 ? (
        <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-12 text-center text-[#8B8B8B]">
          No chart screenshots match the current filter selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredScreenshots.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setSelectedItemIndex(idx)}
              className="bg-[#151515] border border-[#2D2D2D] hover:border-[#FF7A00] rounded-[14px] overflow-hidden group cursor-pointer transition-all duration-200 hover:scale-[1.01]"
            >
              {/* Image Box */}
              <div className="relative h-48 bg-[#0c0c0e] overflow-hidden flex items-center justify-center">
                <img
                  src={item.imageUrl}
                  alt={item.trade.pair}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-[#2D2D2D] uppercase">
                  {item.type} TRADE
                </div>
                <div className="absolute top-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  #{item.trade.id}
                </div>
              </div>

              {/* Card Meta Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm font-mono">{item.trade.pair}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.trade.result === 'Win'
                        ? 'bg-[#4CAF50] text-white'
                        : item.trade.result === 'Loss'
                        ? 'bg-[#FF7A00] text-white'
                        : 'bg-[#808080] text-white'
                    }`}
                  >
                    {item.trade.result}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#8B8B8B] font-mono">
                  <span>{item.trade.date}</span>
                  <span className={`font-bold ${item.trade.pnl >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'}`}>
                    {currencySymbol}{item.trade.pnl.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Fullscreen Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 overflow-y-auto">
          {/* Lightbox Top Control Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between border-b border-[#2D2D2D] pb-3 text-white">
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg font-mono">{selectedItem.trade.pair} ({selectedItem.type} Chart)</span>
              <span className="text-xs text-[#8B8B8B]">
                {selectedItemIndex! + 1} of {filteredScreenshots.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTrade(selectedItem.trade.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF7A00] hover:bg-[#FF8E26] text-white rounded-lg text-xs font-bold transition-all"
              >
                <ExternalLink className="w-4 h-4" /> Open Trade Detail
              </button>
              <button
                onClick={() => downloadImage(selectedItem.imageUrl, `${selectedItem.trade.pair}_${selectedItem.type}`)}
                className="p-2 bg-[#202020] hover:bg-[#2D2D2D] text-white rounded-lg"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedItemIndex(null)}
                className="p-2 bg-[#202020] hover:bg-[#F44336] text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Content: Image & Side Summary */}
          <div className="w-full max-w-6xl my-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Image Viewer */}
            <div className="lg:col-span-2 relative flex items-center justify-center bg-[#0c0c0e] border border-[#2D2D2D] rounded-xl h-[500px] overflow-hidden p-2">
              <img
                src={selectedItem.imageUrl}
                alt="Screenshot Detail"
                className="max-h-full max-w-full object-contain rounded-lg"
              />

              {/* Prev / Next Arrows */}
              <button
                onClick={handlePrev}
                disabled={selectedItemIndex === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/80 hover:bg-[#FF7A00] text-white rounded-full disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={handleNext}
                disabled={selectedItemIndex === filteredScreenshots.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/80 hover:bg-[#FF7A00] text-white rounded-full disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Trade Info Summary Box */}
            <div className="bg-[#151515] border border-[#2D2D2D] rounded-xl p-5 space-y-4 text-xs text-white">
              <div className="border-b border-[#2D2D2D] pb-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base font-mono">{selectedItem.trade.pair}</h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedItem.trade.result === 'Win' ? 'bg-[#4CAF50]' : 'bg-[#FF7A00]'
                    }`}
                  >
                    {selectedItem.trade.result}
                  </span>
                </div>
                <p className="text-[#8B8B8B] mt-1">{selectedItem.trade.date} at {selectedItem.trade.time}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <span className="text-[#8B8B8B] block text-[10px]">ENTRY</span>
                  <span className="font-bold">{selectedItem.trade.entryPrice}</span>
                </div>
                <div>
                  <span className="text-[#8B8B8B] block text-[10px]">EXIT</span>
                  <span className="font-bold">{selectedItem.trade.exitPrice ?? 'Ongoing'}</span>
                </div>
                <div>
                  <span className="text-[#8B8B8B] block text-[10px]">STOP LOSS</span>
                  <span className="text-[#FF7A00] font-bold">{selectedItem.trade.stopLoss}</span>
                </div>
                <div>
                  <span className="text-[#8B8B8B] block text-[10px]">TAKE PROFIT</span>
                  <span className="text-[#4CAF50] font-bold">{selectedItem.trade.takeProfit}</span>
                </div>
                <div>
                  <span className="text-[#8B8B8B] block text-[10px]">RISK : REWARD</span>
                  <span className="text-[#FF7A00] font-bold">1 : {selectedItem.trade.rr}</span>
                </div>
                <div>
                  <span className="text-[#8B8B8B] block text-[10px]">PNL ($)</span>
                  <span className={`font-bold ${selectedItem.trade.pnl >= 0 ? 'text-[#4CAF50]' : 'text-[#FF7A00]'}`}>
                    {currencySymbol}{selectedItem.trade.pnl.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#2D2D2D]">
                <span className="text-[#8B8B8B] text-[10px] block uppercase mb-1">Trading Rationale</span>
                <p className="text-[#B8B8B8] leading-relaxed line-clamp-4 bg-[#111111] p-2.5 rounded border border-[#2D2D2D]">
                  {selectedItem.trade.notes || 'No detailed notes.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
