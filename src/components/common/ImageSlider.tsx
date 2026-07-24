import React, { useState, useRef, useCallback } from 'react';
import { Maximize2, Download, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';

interface ImageSliderProps {
  beforeImg?: string;
  afterImg?: string;
  pairName: string;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({ beforeImg, afterImg, pairName }) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'slider' | 'before' | 'after'>('slider');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) handleMove(e.touches[0].clientX);
  };

  const downloadImage = (url?: string, label?: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pairName}_Chart_${label || 'Screenshot'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!beforeImg && !afterImg) {
    return (
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-8 text-center text-[#8B8B8B] flex flex-col items-center justify-center gap-3 min-h-[220px]">
        <ImageIcon className="w-8 h-8 text-[#343434]" />
        <p className="text-xs sm:text-sm">No chart screenshots uploaded for this trade yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-3.5 sm:p-5 space-y-3 sm:space-y-4">
      {/* Header & Mode Switchers */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2D2D2D] pb-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('slider')}
            disabled={!beforeImg || !afterImg}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors ${
              activeTab === 'slider'
                ? 'bg-[#FF7A00] text-white'
                : 'bg-[#202020] text-[#B8B8B8] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>
          {beforeImg && (
            <button
              onClick={() => setActiveTab('before')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors ${
                activeTab === 'before'
                  ? 'bg-[#FF7A00] text-white'
                  : 'bg-[#202020] text-[#B8B8B8] hover:text-white'
              }`}
            >
              Before
            </button>
          )}
          {afterImg && (
            <button
              onClick={() => setActiveTab('after')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors ${
                activeTab === 'after'
                  ? 'bg-[#FF7A00] text-white'
                  : 'bg-[#202020] text-[#B8B8B8] hover:text-white'
              }`}
            >
              After
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#202020] hover:bg-[#2D2D2D] text-[#B8B8B8] hover:text-white rounded-lg text-[11px] sm:text-xs font-medium transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
          <button
            onClick={() => downloadImage(beforeImg || afterImg, 'Chart')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#202020] hover:bg-[#2D2D2D] text-[#B8B8B8] hover:text-white rounded-lg text-[11px] sm:text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Main Display Box */}
      {activeTab === 'slider' && beforeImg && afterImg ? (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchMove={handleTouchMove}
          className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] overflow-hidden rounded-xl bg-[#0c0c0e] border border-[#2D2D2D] select-none cursor-ew-resize group"
        >
          {/* After Image (Background) */}
          <img
            src={afterImg}
            alt="After Trade"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
          <div className="absolute top-2.5 right-2.5 bg-black/80 border border-[#2D2D2D] text-[#4CAF50] text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded">
            AFTER
          </div>

          {/* Before Image (Clipped Overlay) */}
          <div
            className="absolute inset-0 h-full overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={beforeImg}
              alt="Before Trade"
              className="absolute inset-0 w-full h-full object-contain max-w-none"
              style={{ width: containerRef.current?.clientWidth || '100%' }}
            />
            <div className="absolute top-2.5 left-2.5 bg-black/80 border border-[#2D2D2D] text-[#FF7A00] text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded">
              BEFORE
            </div>
          </div>

          {/* Vertical Divider Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-[#FF7A00] shadow-[0_0_10px_#FF7A00] pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF7A00] text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-bold">
              ↔
            </div>
          </div>
        </div>
      ) : (
        /* Single Image View (Before or After) */
        <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] rounded-xl bg-[#0c0c0e] border border-[#2D2D2D] flex items-center justify-center p-2">
          <img
            src={activeTab === 'after' ? afterImg : beforeImg}
            alt="Trade Screenshot"
            className="max-h-full max-w-full object-contain rounded-lg"
          />
          <div className="absolute top-2.5 left-2.5 bg-black/80 border border-[#2D2D2D] text-[#FF7A00] text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded uppercase">
            {activeTab === 'after' ? 'AFTER TRADE' : 'BEFORE TRADE'}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6">
          <div className="absolute top-4 right-6 flex items-center gap-4">
            <button
              onClick={() => downloadImage(beforeImg || afterImg, 'Fullscreen')}
              className="p-2 bg-[#202020] hover:bg-[#2D2D2D] text-white rounded-lg text-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 bg-[#202020] hover:bg-[#F44336] text-white rounded-lg text-sm font-bold"
            >
              ✕ Close
            </button>
          </div>
          <div className="max-w-6xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <img
              src={activeTab === 'after' ? afterImg || beforeImg : beforeImg || afterImg}
              alt="Fullscreen Chart"
              className="max-h-full max-w-full object-contain rounded-xl border border-[#2D2D2D]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
