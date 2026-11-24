import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {
  ShieldAlert,
  FileCode,
  AtSign,
  FileText,
  RotateCcw,
  Pause,
  Play,
} from 'lucide-react';
import StateTileMap from '../components/threatMap/StateTileMap';
import ScamNewsAlerts from '../components/threatMap/ScamNewsAlerts';
import HourlyLineChart from '../components/threatMap/HourlyLineChart';
import TrendingScripts from '../components/threatMap/TrendingScripts';
import FlaggedIdentifiersTable from '../components/threatMap/FlaggedIdentifiersTable';
import { useApp } from '../context/AppContext';
import {
  INITIAL_KPIS,
  INITIAL_STATE_TILES,
  INITIAL_TOP_CITIES,
  INITIAL_NEWS_ALERTS,
  INITIAL_HOURLY_DATA,
  INITIAL_TRENDING_SCRIPTS,
  INITIAL_FLAGGED_IDENTIFIERS,
} from '../services/threatDataService';

export default function ThreatMap() {
  const { theme } = useApp();
  const [kpis, setKpis] = useState(INITIAL_KPIS);
  const [stateTiles, setStateTiles] = useState(INITIAL_STATE_TILES);
  const [topCities, setTopCities] = useState(INITIAL_TOP_CITIES);
  const [alerts] = useState(INITIAL_NEWS_ALERTS);
  const [hourlyData, setHourlyData] = useState(INITIAL_HOURLY_DATA);
  const [trendingScripts] = useState(INITIAL_TRENDING_SCRIPTS);
  const [flaggedIdentifiers, setFlaggedIdentifiers] = useState(INITIAL_FLAGGED_IDENTIFIERS);

  const [isLiveActive, setIsLiveActive] = useState(true);
  const [lastUpdatedTime, setLastUpdatedTime] = useState('Just now');

  // Real-time live data simulation interval
  useEffect(() => {
    if (!isLiveActive) return;

    const interval = setInterval(() => {
      // 1. Increment total scams detected today
      const scamIncrement = Math.floor(Math.random() * 2) + 1;
      setKpis((prev) => ({
        ...prev,
        scamsDetectedToday: prev.scamsDetectedToday + scamIncrement,
        flaggedUpiIds: Math.random() > 0.5 ? prev.flaggedUpiIds + 1 : prev.flaggedUpiIds,
        reportsFiled: Math.random() > 0.6 ? prev.reportsFiled + 1 : prev.reportsFiled,
      }));

      // 2. Randomly increment a high-density state tile
      setStateTiles((prevTiles) => {
        const randomIndex = Math.floor(Math.random() * prevTiles.length);

        return prevTiles.map((tile, idx) =>
          idx === randomIndex ? { ...tile, count: tile.count + 1 } : tile
        );
      });

      // 3. Randomly update a top city
      setTopCities((prevCities) => {
        const rIndex = Math.floor(Math.random() * 4); // target top 4 cities
        return prevCities.map((c, i) =>
          i === rIndex ? { ...c, count: c.count + 1 } : c
        );
      });

      // 4. Subtle update to latest hour point
      setHourlyData((prevHours) => {
        const lastIdx = prevHours.length - 1;
        const currentCount = prevHours[lastIdx].count;
        const newCount = Math.min(36, Math.max(18, currentCount + (Math.random() > 0.5 ? 1 : -1)));
        return prevHours.map((h, i) => (i === lastIdx ? { ...h, count: newCount } : h));
      });

      // 5. Occasionally increment flagged identifier reports
      if (Math.random() > 0.6) {
        setFlaggedIdentifiers((prev) => {
          const randIdx = Math.floor(Math.random() * prev.length);
          return prev.map((item, idx) =>
            idx === randIdx ? { ...item, reports: item.reports + 1 } : item
          );
        });
      }

      // 6. Update timestamp
      setLastUpdatedTime('Just now');
    }, 3800);

    return () => clearInterval(interval);
  }, [isLiveActive]);

  const handleManualRefresh = () => {
    setKpis((prev) => ({
      ...prev,
      scamsDetectedToday: prev.scamsDetectedToday + 3,
      reportsFiled: prev.reportsFiled + 1,
    }));
    setLastUpdatedTime('Just refreshed');
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-app-bg text-text-primary transition-colors duration-300 pt-18"
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
        {/* Section 1 Header: Title, Live Pill Badge, and Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
                Threat map
              </h1>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-bold shadow-xs border border-slate-700/50">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                Live
              </div>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary font-medium mt-1">
              Scams detected across India, updated in real time.
            </p>
          </div>

          {/* Controls: Live toggle & Manual refresh */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-card-bg border border-border-color rounded-xl p-1 shadow-2xs text-xs transition-colors">
            <button
              type="button"
              onClick={() => setIsLiveActive(!isLiveActive)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                isLiveActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
              title={isLiveActive ? 'Pause real-time stream' : 'Resume real-time stream'}
            >
              {isLiveActive ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Streaming</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  <span>Paused</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleManualRefresh}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Refresh telemetry"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <span className="text-[10px] text-text-secondary font-mono px-2 hidden sm:inline">
              Updated: {lastUpdatedTime}
            </span>
          </div>
        </div>

        {/* 4 KPI Summary Cards (Equal 4-Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: SCAMS DETECTED TODAY */}
          <div className="bg-card-bg rounded-2xl border border-border-color p-5 shadow-xs flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-text-secondary uppercase">
                Scams Detected Today
              </span>
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex items-center justify-center text-[#dc2626] dark:text-red-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-[#dc2626] dark:text-red-400 font-mono tracking-tight">
                {kpis.scamsDetectedToday.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Card 2: ACTIVE SCAM SCRIPTS */}
          <div className="bg-card-bg rounded-2xl border border-border-color p-5 shadow-xs flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-text-secondary uppercase">
                Active Scam Scripts
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center text-[#ea580c] dark:text-amber-400">
                <FileCode className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-[#ea580c] dark:text-amber-400 font-mono tracking-tight">
                {kpis.activeScamScripts.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Card 3: FLAGGED UPI IDS */}
          <div className="bg-card-bg rounded-2xl border border-border-color p-5 shadow-xs flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-text-secondary uppercase">
                Flagged UPI IDs
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-text-primary">
                <AtSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-text-primary font-mono tracking-tight">
                {kpis.flaggedUpiIds.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Card 4: REPORTS FILED */}
          <div className="bg-card-bg rounded-2xl border border-border-color p-5 shadow-xs flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-text-secondary uppercase">
                Reports Filed
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-[#059669] dark:text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-[#059669] dark:text-emerald-400 font-mono tracking-tight">
                {kpis.reportsFiled.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1 Main Split Row: Scam reports by state (~65%) vs Scam news & alerts (~35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <StateTileMap
              states={stateTiles}
              topCities={topCities}
            />
          </div>

          <div className="lg:col-span-4">
            <ScamNewsAlerts alerts={alerts} />
          </div>
        </div>

        {/* Section 2 Middle Row: Scams detected per hour vs Trending scam scripts (50/50 split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <HourlyLineChart hourlyData={hourlyData} />
          </div>

          <div className="lg:col-span-6">
            <TrendingScripts scripts={trendingScripts} />
          </div>
        </div>

        {/* Section 2 Bottom Full-Width Row: Most reported UPI IDs and phone numbers */}
        <div>
          <FlaggedIdentifiersTable identifiers={flaggedIdentifiers} />
        </div>
      </main>
    </div>
  );
}
