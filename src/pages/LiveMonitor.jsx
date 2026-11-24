import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Monitor,
  Upload,
  RotateCcw,
  Bell,
  BellRing,
  Bot,
  Laptop,
} from 'lucide-react';
import ScreenViewport from '../components/liveMonitor/ScreenViewport';
import LiveAnalysisPanel from '../components/liveMonitor/LiveAnalysisPanel';
import TelegramSimulator from '../components/liveMonitor/TelegramSimulator';
import CyberHelplineModal from '../components/CyberHelplineModal';
import { useApp } from '../context/AppContext';
import { analyzeScam, analyzeScamAsync } from '../utils/scamAnalyzer';
import { playScamAlertSound, playSafePingSound } from '../utils/audioAlert';
import { createWorker } from 'tesseract.js';

export default function LiveMonitor() {
  const { theme, addToast } = useApp();

  // Active feature tab: 'guardian' | 'telegram_simulator'
  const [activeTab, setActiveTab] = useState('guardian');

  // Screen Streaming states
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState(null);
  const [isScanningFrame, setIsScanningFrame] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  // Screenshot upload / paste preview
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  // Analysis result & telemetry scan history
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);

  // Alerts configuration
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  // Helpline modal
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);

  // Refs
  const videoStreamRef = useRef(null);
  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const tesseractWorkerRef = useRef(null);
  const isWorkerInitializing = useRef(false);
  const lastFrameTextRef = useRef('');
  const lastAnalysisCacheRef = useRef(null);

  // Lazy-initialize reusable Tesseract worker
  const getOcrWorker = async () => {
    if (tesseractWorkerRef.current) {
      return tesseractWorkerRef.current;
    }
    if (isWorkerInitializing.current) {
      return null;
    }
    try {
      isWorkerInitializing.current = true;
      const worker = await createWorker('eng', 1);
      tesseractWorkerRef.current = worker;
      isWorkerInitializing.current = false;
      return worker;
    } catch (err) {
      console.warn('Tesseract worker initialization error:', err);
      isWorkerInitializing.current = false;
      return null;
    }
  };

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (tesseractWorkerRef.current) {
        tesseractWorkerRef.current.terminate().catch(() => {});
        tesseractWorkerRef.current = null;
      }
    };
  }, []);

  // 1. Start Screen Monitoring via navigator.mediaDevices.getDisplayMedia
  const handleStartScreenShare = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      addToast('Screen capture is not supported on this browser/platform.', 'error');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'window',
          cursor: 'always',
        },
        audio: false,
      });

      setStream(mediaStream);
      videoStreamRef.current = mediaStream;
      setIsStreaming(true);
      setScreenshotPreview(null);
      setScanCount(0);

      addToast('Screen monitoring active. Guardian inspecting window...', 'success');

      // Listen for when user clicks native browser "Stop sharing" button
      mediaStream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          handleStopScreenShare();
        };
      });

      // Warm up OCR worker in background
      getOcrWorker();
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        console.error('Screen share error:', err);
        addToast('Failed to start screen capture: ' + (err.message || 'Access denied'), 'error');
      }
    }
  };

  // 2. Stop Screen Monitoring cleanly
  const handleStopScreenShare = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
    }

    setStream(null);
    setIsStreaming(false);
    setIsScanningFrame(false);
    addToast('Screen monitoring stopped.', 'info');
  }, [addToast]);

  // Clean up media streams and intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Frame capture and analysis cycle
  const captureAndAnalyzeFrame = useCallback(async () => {
    if (!videoStreamRef.current) return;

    const videoTrack = videoStreamRef.current.getVideoTracks()[0];
    if (!videoTrack || videoTrack.readyState !== 'live') {
      return;
    }

    setIsScanningFrame(true);

    try {
      // Create offscreen video & canvas capture
      const videoElement = document.querySelector('video');
      if (!videoElement || videoElement.videoWidth === 0) {
        setIsScanningFrame(false);
        return;
      }

      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1280 / videoElement.videoWidth);
      canvas.width = videoElement.videoWidth * scale;
      canvas.height = videoElement.videoHeight * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      let extractedText = '';
      const worker = await getOcrWorker();
      if (worker) {
        const { data } = await worker.recognize(canvas);
        extractedText = data.text ? data.text.trim() : '';
      }

      const currentCycle = scanCount + 1;
      setScanCount(currentCycle);

      let analysis;
      // Fast incremental caching: if frame text is unchanged, return cached analysis instantly
      if (
        extractedText &&
        extractedText === lastFrameTextRef.current &&
        lastAnalysisCacheRef.current
      ) {
        analysis = lastAnalysisCacheRef.current;
      } else {
        lastFrameTextRef.current = extractedText;
        analysis = analyzeScam(
          extractedText || 'Visible clean interface window. No threat vectors found.',
          `Live Stream Frame #${currentCycle}`
        );
        lastAnalysisCacheRef.current = analysis;
      }

      const framePayload = {
        ...analysis,
        cycle: currentCycle,
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toLocaleTimeString(),
      };

      setActiveAnalysis(framePayload);

      setScanHistory((prev) => [
        {
          cycle: currentCycle,
          time: new Date().toLocaleTimeString(),
          status: analysis.status,
          riskScore: analysis.riskScore,
          verdict: analysis.verdict,
        },
        ...prev.slice(0, 15),
      ]);

      // Sound & notification alerts trigger
      if (analysis.riskScore >= 70 && alertsEnabled) {
        playScamAlertSound();
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification('CRX ScamShield Alert: Potential Threat Detected!', {
            body: `Warning: High threat vector identified in active window (${analysis.verdict}).`,
            icon: '/favicon.ico',
          });
        }
      }
    } catch (err) {
      console.warn('Frame processing notice:', err);
    } finally {
      setIsScanningFrame(false);
    }
  }, [scanCount, alertsEnabled]);

  // Automatic periodic scan interval (optimized to 3.0 seconds)
  useEffect(() => {
    if (!isStreaming) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Run first capture after 1.0s
    const firstTimeout = setTimeout(() => {
      captureAndAnalyzeFrame();
    }, 1000);

    // Continuous 3-second loop
    intervalRef.current = setInterval(() => {
      captureAndAnalyzeFrame();
    }, 3000);

    return () => {
      clearTimeout(firstTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStreaming, captureAndAnalyzeFrame]);

  // 3. Process static image (via Upload or Paste)
  const processImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      addToast('Please upload a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    if (isStreaming) {
      handleStopScreenShare();
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target.result;
      setScreenshotPreview(dataUrl);
      setIsScanningFrame(true);

      try {
        const worker = await getOcrWorker();
        let text = '';
        if (worker) {
          const { data } = await worker.recognize(dataUrl);
          text = data.text ? data.text.trim() : '';
        }

        const currentCycle = scanCount + 1;
        setScanCount(currentCycle);

        // Run deep asynchronous AI + local forensic scan
        const analysis = await analyzeScamAsync(
          text || 'Uploaded screenshot. No visible high-risk indicators detected.',
          file.name || 'Screenshot Upload'
        );

        setActiveAnalysis({
          ...analysis,
          cycle: currentCycle,
          time: new Date().toLocaleTimeString(),
          timestamp: new Date().toLocaleTimeString(),
        });

        setScanHistory((prev) => [
          {
            cycle: currentCycle,
            time: new Date().toLocaleTimeString(),
            status: analysis.status,
            riskScore: analysis.riskScore,
            verdict: analysis.verdict,
          },
          ...prev.slice(0, 15),
        ]);

        if (analysis.riskScore >= 70 && alertsEnabled) {
          playScamAlertSound();
        } else if (analysis.riskScore < 30) {
          playSafePingSound();
        }

        if (analysis.verdict === 'Scam') {
          addToast('Alert: High-threat scam document detected!', 'error');
        } else if (analysis.verdict === 'Suspicious') {
          addToast('Warning: Suspicious document anomalies identified.', 'warning');
        } else if (analysis.verdict === 'Needs Verification') {
          addToast('Caution: Document unverified. Independent verification needed.', 'warning');
        } else {
          addToast('Success: Document evaluated authentic & genuine.', 'success');
        }
      } catch (err) {
        console.error('Screenshot OCR error:', err);
        addToast('Failed to read text from screenshot.', 'error');
      } finally {
        setIsScanningFrame(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Clipboard paste listener (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              e.preventDefault();
              processImageFile(blob);
              addToast('Pasted screenshot loaded from clipboard.', 'info');
              break;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [alertsEnabled, scanCount, isStreaming]);

  // 4. Alerts toggle (with browser notification permission)
  const handleToggleAlerts = async () => {
    if (!alertsEnabled) {
      if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            addToast('Push notifications and audio alerts enabled.', 'success');
          }
        } catch (err) {}
      }
      setAlertsEnabled(true);
      playSafePingSound();
      addToast('Audible and visual alerts turned ON.', 'success');
    } else {
      setAlertsEnabled(false);
      addToast('Alerts turned OFF.', 'info');
    }
  };

  // 5. Replay Demo Mode (Runs demo simulation without requiring permissions)
  const handleReplayDemo = () => {
    setActiveTab('telegram_simulator');
    setScreenshotPreview(null);
    if (isStreaming) {
      handleStopScreenShare();
    }
    addToast('Replay Demo loaded in Scenario Simulator.', 'info');
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#020617] text-[#0f172a] dark:text-slate-100 transition-colors duration-300 pt-18"
      style={{
        backgroundImage:
          theme === 'dark'
            ? 'radial-gradient(rgba(255, 255, 255, 0.07) 1.2px, transparent 1.2px)'
            : 'radial-gradient(#e2e8f0 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
      }}
    >
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hidden file input for Upload Screenshot */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processImageFile(e.target.files[0]);
            }
          }}
        />

        {/* Top Header: Title, Live Pill Badge, Subtitle & Control Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
                Live monitor
              </h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0f172a] dark:bg-slate-800 text-white text-[11px] font-bold shadow-xs border border-slate-700/50">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                Live
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              Forward a Telegram chat to our bot. We warn you in real time — before your next payment.
            </p>
          </div>

          {/* Top-Right Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleToggleAlerts}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                alertsEnabled
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs'
              }`}
            >
              {alertsEnabled ? (
                <>
                  <BellRing className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Alerts ON</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Turn on alerts</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReplayDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Replay demo</span>
            </button>
          </div>
        </div>

        {/* Feature Tab Pills */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('guardian')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              activeTab === 'guardian'
                ? 'bg-[#2563eb] text-white shadow-blue-500/10'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Real-Time Screen Guardian</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                activeTab === 'guardian'
                  ? 'bg-blue-500/80 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              Active Protection
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telegram_simulator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              activeTab === 'telegram_simulator'
                ? 'bg-[#2563eb] text-white border-blue-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Telegram Scenario Simulator</span>
          </button>
        </div>

        {/* Real-Time Screen Tracking Action Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
          <div className="flex items-start sm:items-center gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full mt-1 sm:mt-0 shrink-0 ${
                isStreaming ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
              }`}
            />
            <div>
              <h2 className="text-sm font-bold text-[#0f172a] dark:text-white tracking-tight">
                Real-Time Screen Tracking
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Share your screen or select your Telegram / WhatsApp / Job board window. The AI continuously analyzes it and alerts you immediately.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopScreenShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#dc2626] hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Monitor className="w-4 h-4" />
                <span>Stop Monitoring</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartScreenShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#2563eb] hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Monitor className="w-4 h-4" />
                <span>Start Screen Monitoring</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) fileInputRef.current.click();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Upload Screenshot</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Screen Guardian Viewport & Live Analysis Split Grid */}
        {activeTab === 'guardian' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Screen Viewport (~50%) */}
            <div className="lg:col-span-6 flex flex-col">
              <ScreenViewport
                isStreaming={isStreaming}
                stream={stream}
                screenshotPreview={screenshotPreview}
                onClearScreenshot={() => {
                  setScreenshotPreview(null);
                  setActiveAnalysis(null);
                }}
                isScanningFrame={isScanningFrame}
                scanCount={scanCount}
                onStopMonitoring={handleStopScreenShare}
                lastScanVerdict={activeAnalysis?.verdict}
              />
            </div>

            {/* Right: Real-Time Threat Assessment (~50%) */}
            <div className="lg:col-span-6 flex flex-col">
              <LiveAnalysisPanel
                activeAnalysis={activeAnalysis}
                scanHistory={scanHistory}
                isStreaming={isStreaming}
                onOpenHelpline={() => setIsHelplineOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Telegram Scenario Simulator */}
        {activeTab === 'telegram_simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left: Interactive Telegram Chat Window */}
            <div className="lg:col-span-7">
              <TelegramSimulator
                onScenarioStep={(payload) => {
                  setActiveAnalysis(payload);
                  setScanHistory((prev) => [
                    {
                      cycle: prev.length + 1,
                      time: payload.timestamp,
                      status: payload.status,
                      riskScore: payload.riskScore,
                      verdict: payload.verdict,
                    },
                    ...prev.slice(0, 15),
                  ]);
                  if (payload.riskScore >= 60 && alertsEnabled) {
                    playScamAlertSound();
                  }
                }}
                onOpenHelpline={() => setIsHelplineOpen(true)}
              />
            </div>

            {/* Right: Live Assessment Panel */}
            <div className="lg:col-span-5">
              <LiveAnalysisPanel
                activeAnalysis={activeAnalysis}
                scanHistory={scanHistory}
                isStreaming={true}
                onOpenHelpline={() => setIsHelplineOpen(true)}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Cyber Helpline Modal */}
      <CyberHelplineModal
        isOpen={isHelplineOpen}
        onClose={() => setIsHelplineOpen(false)}
      />
    </div>
  );
}
