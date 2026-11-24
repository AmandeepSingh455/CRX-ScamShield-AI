import React, { useRef, useEffect } from 'react';
import { Eye, Monitor, Info, X, RefreshCw } from 'lucide-react';

export default function ScreenViewport({
  isStreaming,
  stream,
  screenshotPreview,
  onClearScreenshot,
  isScanningFrame,
  scanCount,
  onStopMonitoring,
}) {
  const videoRef = useRef(null);

  // Bind MediaStream to video element
  useEffect(() => {
    if (videoRef.current) {
      if (stream) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => {
          console.warn('Video playback notice:', err);
        });
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream]);

  const hasFeed = isStreaming || Boolean(screenshotPreview);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between h-full transition-colors">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#eff6ff] dark:bg-blue-950/40 border border-[#dbeafe] dark:border-blue-900/50 flex items-center justify-center text-[#2563eb] dark:text-blue-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0f172a] dark:text-white tracking-tight">
              Screen Viewport
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {isStreaming
                ? `Streaming active window • Scan cycle #${scanCount}`
                : screenshotPreview
                ? 'Static image / screenshot preview'
                : 'Waiting for screen share'}
            </span>
          </div>
        </div>

        {/* Live streaming indicator pill */}
        {isStreaming && (
          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
            <span className="text-[10px] font-bold text-[#dc2626] dark:text-red-400 font-mono">
              REC • LIVE
            </span>
          </div>
        )}
      </div>

      {/* Viewport Screen Box */}
      <div className="relative w-full aspect-video sm:min-h-[290px] rounded-xl bg-[#070b14] dark:bg-[#030712] border border-slate-800/90 overflow-hidden flex items-center justify-center group shadow-inner">
        {/* State 1: Live Video Streaming */}
        {isStreaming && (
          <div className="w-full h-full relative flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain bg-black"
            />

            {/* Subtle scanning radar scanline effect */}
            {isScanningFrame && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent shadow-[0_0_12px_#3b82f6] animate-[scan_1.6s_ease-in-out_infinite]" />
              </div>
            )}

            {/* Viewport Overlays */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono font-medium flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live 3.0s Sentinel
              </span>
              {isScanningFrame && (
                <span className="px-2 py-0.5 rounded-md bg-blue-600/90 text-white text-[10px] font-medium flex items-center gap-1 shadow-sm animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Analyzing frame...
                </span>
              )}
            </div>

            {/* Stop button overlay */}
            <div className="absolute bottom-3 right-3 opacity-90 hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={onStopMonitoring}
                className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-red-600 text-white text-xs font-semibold backdrop-blur-md border border-white/10 hover:border-red-500 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Stop Share
              </button>
            </div>
          </div>
        )}

        {/* State 2: Uploaded / Pasted Screenshot */}
        {!isStreaming && screenshotPreview && (
          <div className="w-full h-full relative flex items-center justify-center bg-black/60">
            <img
              src={screenshotPreview}
              alt="Screen capture"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-3 left-3">
              <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono">
                Static Screenshot
              </span>
            </div>
            <button
              type="button"
              onClick={onClearScreenshot}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/80 hover:bg-slate-800 text-white/80 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Remove screenshot"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* State 3: No Feed Shared Placeholder */}
        {!hasFeed && (
          <div className="flex flex-col items-center justify-center text-center px-6 py-10 max-w-sm">
            <div className="w-12 h-12 rounded-full border border-blue-500/30 bg-blue-500/10 flex items-center justify-center text-blue-400 mb-3 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <Monitor className="w-6 h-6" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
              No Screen Shared
            </h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Click <span className="text-blue-400 font-semibold">Start Screen Monitoring</span> above or press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">Ctrl+V</kbd> to paste any screenshot directly.
            </p>
          </div>
        )}
      </div>

      {/* Card Footer: Tip Note */}
      <div className="flex items-center gap-1.5 pt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
        <span>Tip: You can select a single window (e.g. Telegram or Chrome) to share.</span>
      </div>
    </div>
  );
}
