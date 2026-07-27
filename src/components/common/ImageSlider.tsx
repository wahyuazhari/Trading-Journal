import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Maximize2, Download, SlidersHorizontal, Image as ImageIcon, Columns, X } from 'lucide-react';

interface ImageSliderProps {
  beforeImg?: string;
  afterImg?: string;
  pairName: string;
}

export const ImageSlider: React.FC<ImageSliderProps> = ({ beforeImg, afterImg, pairName }) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'slider' | 'split' | 'before' | 'after'>('slider');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback if slider mode is selected but only 1 image exists
  useEffect(() => {
    if (activeTab === 'slider' && (!beforeImg || !afterImg)) {
      if (beforeImg) setActiveTab('before');
      else if (afterImg) setActiveTab('after');
    }
  }, [beforeImg, afterImg, activeTab]);

  // Keep container width updated dynamically via ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(() => updateWidth());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [activeTab, isFullscreen]);

  // Handle pointer position
  const updateSliderFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  // Global window listeners when dragging starts
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      updateSliderFromClientX(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateSliderFromClientX(e.touches[0].clientX);
      }
    };

    const onEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [isDragging, updateSliderFromClientX]);

  const handleStartDrag = (clientX: number) => {
    setIsDragging(true);
    updateSliderFromClientX(clientX);
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
      <div className="bg-[#151515] border border-[#2D2D2D] rounded-[14px] p-6 text-center text-[#8B8B8B] flex flex-col items-center justify-center gap-3 min-h-[220px]">
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
          {beforeImg && afterImg && (
            <>
              <button
                onClick={() => setActiveTab('slider')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'slider'
                    ? 'bg-[#FF7A00] text-white'
                    : 'bg-[#202020] text-[#B8B8B8] hover:text-white'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Slider</span>
              </button>
              <button
                onClick={() => setActiveTab('split')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'split'
                    ? 'bg-[#FF7A00] text-white'
                    : 'bg-[#202020] text-[#B8B8B8] hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Side by Side</span>
              </button>
            </>
          )}
          {beforeImg && (
            <button
              onClick={() => setActiveTab('before')}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
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
              className={`px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
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
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#202020] hover:bg-[#2D2D2D] text-[#B8B8B8] hover:text-white rounded-lg text-[11px] sm:text-xs font-medium transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
          <button
            onClick={() => downloadImage(activeTab === 'after' ? afterImg : beforeImg || afterImg, activeTab)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#202020] hover:bg-[#2D2D2D] text-[#B8B8B8] hover:text-white rounded-lg text-[11px] sm:text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Main Display Container */}
      {activeTab === 'slider' && beforeImg && afterImg ? (
        <div
          ref={containerRef}
          onMouseDown={(e) => handleStartDrag(e.clientX)}
          onTouchStart={(e) => {
            if (e.touches.length > 0) handleStartDrag(e.touches[0].clientX);
          }}
          className="relative w-full h-[260px] xs:h-[300px] sm:h-[380px] md:h-[480px] overflow-hidden rounded-xl bg-[#0c0c0e] border border-[#2D2D2D] select-none cursor-ew-resize group touch-none"
        >
          {/* Background Image: AFTER */}
          <img
            src={afterImg}
            alt="After Trade Chart"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
          <div className="absolute top-2.5 right-2.5 bg-black/80 border border-[#2D2D2D] text-[#4CAF50] text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-md z-10">
            AFTER
          </div>

          {/* Foreground Clipped Image: BEFORE */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
            style={{ width: `${sliderPosition}%` }}
          >
            <img
              src={beforeImg}
              alt="Before Trade Chart"
              className="absolute inset-y-0 left-0 h-full object-contain max-w-none pointer-events-none"
              style={{
                width: containerWidth ? `${containerWidth}px` : '100%',
              }}
            />
            <div className="absolute top-2.5 left-2.5 bg-black/80 border border-[#2D2D2D] text-[#FF7A00] text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded shadow-md z-10">
              BEFORE
            </div>
          </div>

          {/* Vertical Slider Handle Line & Knob */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#FF7A00] shadow-[0_0_12px_#FF7A00] pointer-events-none z-20"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FF7A00] text-white flex items-center justify-center shadow-lg border-2 border-white text-xs font-extrabold select-none">
              ↔
            </div>
          </div>
        </div>
      ) : activeTab === 'split' && beforeImg && afterImg ? (
        /* Side by Side Split View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative w-full h-[220px] xs:h-[260px] sm:h-[320px] rounded-xl bg-[#0c0c0e] border border-[#2D2D2D] flex items-center justify-center p-2">
            <img
              src={beforeImg}
              alt="Before Trade"
              className="max-h-full max-w-full object-contain rounded-lg"
            />
            <div className="absolute top-2.5 left-2.5 bg-black/80 border border-[#2D2D2D] text-[#FF7A00] text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded uppercase">
              BEFORE TRADE
            </div>
          </div>
          <div className="relative w-full h-[220px] xs:h-[260px] sm:h-[320px] rounded-xl bg-[#0c0c0e] border border-[#2D2D2D] flex items-center justify-center p-2">
            <img
              src={afterImg}
              alt="After Trade"
              className="max-h-full max-w-full object-contain rounded-lg"
            />
            <div className="absolute top-2.5 left-2.5 bg-black/80 border border-[#2D2D2D] text-[#4CAF50] text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded uppercase">
              AFTER TRADE
            </div>
          </div>
        </div>
      ) : (
        /* Single Image View (Before or After) */
        <div className="relative w-full h-[250px] xs:h-[300px] sm:h-[380px] md:h-[480px] rounded-xl bg-[#0c0c0e] border border-[#2D2D2D] flex items-center justify-center p-2">
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

      {/* Fullscreen Modal Lightbox */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-3 sm:p-6 overflow-y-auto">
          {/* Modal Top Header */}
          <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm sm:text-base font-mono">{pairName} Chart Review</span>
              <span className="text-xs text-[#8B8B8B] hidden sm:inline">• Fullscreen Lightbox</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadImage(activeTab === 'after' ? afterImg : beforeImg || afterImg, 'Fullscreen')}
                className="p-2 bg-[#202020] hover:bg-[#2D2D2D] text-white rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-[#FF7A00] hover:bg-[#FF8E26] text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Modal Main Content */}
          <div className="flex-1 min-h-0 flex items-center justify-center relative w-full">
            {activeTab === 'split' && beforeImg && afterImg ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-h-[82vh]">
                <div className="relative bg-[#0c0c0e] rounded-xl border border-[#2D2D2D] flex items-center justify-center p-2">
                  <img src={beforeImg} alt="Before" className="max-h-[75vh] max-w-full object-contain rounded-lg" />
                  <div className="absolute top-3 left-3 bg-black/80 text-[#FF7A00] text-xs font-bold px-2.5 py-1 rounded border border-[#2D2D2D]">BEFORE</div>
                </div>
                <div className="relative bg-[#0c0c0e] rounded-xl border border-[#2D2D2D] flex items-center justify-center p-2">
                  <img src={afterImg} alt="After" className="max-h-[75vh] max-w-full object-contain rounded-lg" />
                  <div className="absolute top-3 left-3 bg-black/80 text-[#4CAF50] text-xs font-bold px-2.5 py-1 rounded border border-[#2D2D2D]">AFTER</div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full max-h-[82vh] flex items-center justify-center bg-[#0c0c0e] rounded-xl border border-[#2D2D2D] p-2">
                <img
                  src={activeTab === 'after' ? afterImg || beforeImg : beforeImg || afterImg}
                  alt="Fullscreen Chart"
                  className="max-h-[80vh] max-w-full object-contain rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

