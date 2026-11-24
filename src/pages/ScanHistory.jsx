import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  ArrowRight,
  ExternalLink,
  Clock,
  FileText,
  Filter,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';

export default function ScanHistory() {
  const { history, clearHistory, setActiveScan } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState('ALL');

  // Compute metrics
  const totalScans = history.length;
  const scamCount = history.filter(
    (s) => s.result?.verdict === 'Scam' || (s.result?.riskScore ?? 0) >= 70
  ).length;
  const suspiciousCount = history.filter(
    (s) =>
      s.result?.verdict === 'Suspicious' ||
      ((s.result?.riskScore ?? 0) >= 35 && (s.result?.riskScore ?? 0) < 70)
  ).length;
  const safeCount = history.filter(
    (s) =>
      s.result?.verdict === 'Safe' ||
      s.result?.verdict === 'Genuine' ||
      (s.result?.verdict !== 'Scam' &&
        s.result?.verdict !== 'Suspicious' &&
        (s.result?.riskScore ?? 0) < 35)
  ).length;

  // Filtered scans
  const filteredScans = history.filter((scan) => {
    const filename = scan.filename || scan.name || 'Untitled Scan';
    const primaryReason = scan.result?.primaryReason || '';
    const text = scan.text || '';
    const matchesSearch =
      filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      primaryReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      text.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const risk = scan.result?.riskScore ?? 0;
    const verdict = scan.result?.verdict || '';

    if (filterVerdict === 'SCAM') {
      return verdict === 'Scam' || risk >= 70;
    }
    if (filterVerdict === 'SUSPICIOUS') {
      return verdict === 'Suspicious' || (risk >= 35 && risk < 70);
    }
    if (filterVerdict === 'SAFE') {
      return verdict === 'Safe' || verdict === 'Genuine' || (verdict !== 'Scam' && verdict !== 'Suspicious' && risk < 35);
    }
    return true;
  });

  const handleOpenReport = (scan) => {
    setActiveScan(scan);
    navigate('/analysis-result', { state: { scan } });
  };

  const handleOpenInScanner = (scan) => {
    setActiveScan(scan);
    navigate('/scan', { state: { scan } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#0b1329] text-[#0f172a] dark:text-slate-100 transition-colors duration-200 pt-18">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] dark:border-slate-800 pb-6">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
              <span className="text-[11px] font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-widest">
                Scam Detection Registry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight mt-1">
              Scan History
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-slate-400 mt-1">
              Review all historical scan diagnoses, fraud assessments, and safety verifications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/scan')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Scan</span>
            </button>

            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all scan history?')) {
                    clearHistory();
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#cbd5e1] dark:border-slate-700 bg-white dark:bg-[#0d1629] text-xs font-semibold text-[#dc2626] hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 bg-white dark:bg-[#0d1629] shadow-xs text-left">
            <span className="text-[10px] font-bold text-[#64748b] dark:text-slate-400 uppercase tracking-wider block">
              Total Scans
            </span>
            <span className="text-2xl font-extrabold text-[#0f172a] dark:text-white font-mono mt-1 block">
              {totalScans}
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-[#fee2e2] dark:border-red-500/20 bg-[#fef2f2] dark:bg-red-500/10 shadow-xs text-left">
            <span className="text-[10px] font-bold text-[#dc2626] dark:text-red-400 uppercase tracking-wider block">
              Scams Detected
            </span>
            <span className="text-2xl font-extrabold text-[#dc2626] dark:text-red-400 font-mono mt-1 block">
              {scamCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-[#fed7aa] dark:border-amber-500/20 bg-[#fff7ed] dark:bg-amber-500/10 shadow-xs text-left">
            <span className="text-[10px] font-bold text-[#ea580c] dark:text-amber-400 uppercase tracking-wider block">
              Suspicious
            </span>
            <span className="text-2xl font-extrabold text-[#ea580c] dark:text-amber-400 font-mono mt-1 block">
              {suspiciousCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-[#d1fae5] dark:border-emerald-500/20 bg-[#ecfdf5] dark:bg-emerald-500/10 shadow-xs text-left">
            <span className="text-[10px] font-bold text-[#059669] dark:text-emerald-400 uppercase tracking-wider block">
              Safe & Genuine
            </span>
            <span className="text-2xl font-extrabold text-[#059669] dark:text-emerald-400 font-mono mt-1 block">
              {safeCount}
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#94a3b8] dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scans by document, reason or text..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#0d1629] border border-[#cbd5e1] dark:border-slate-700 text-xs text-[#0f172a] dark:text-slate-100 placeholder-[#94a3b8] dark:placeholder-slate-500 focus:outline-none focus:border-[#2563eb] shadow-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#f1f5f9] dark:bg-slate-900/60 border border-[#e2e8f0] dark:border-slate-800 shrink-0 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Scans' },
              { id: 'SCAM', label: 'Scams' },
              { id: 'SUSPICIOUS', label: 'Suspicious' },
              { id: 'SAFE', label: 'Safe' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterVerdict(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                  filterVerdict === tab.id
                    ? 'bg-[#2563eb] text-white shadow-xs'
                    : 'text-[#475569] dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scans List / Table */}
        {filteredScans.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-[#e2e8f0] dark:border-slate-800 bg-white dark:bg-[#0d1629] shadow-xs space-y-4 my-8">
            <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0f172a] dark:text-white">
                {searchQuery || filterVerdict !== 'ALL'
                  ? 'No matching scans found'
                  : 'No scans recorded yet'}
              </h3>
              <p className="text-xs text-[#64748b] dark:text-slate-400 max-w-md mx-auto mt-1">
                {searchQuery || filterVerdict !== 'ALL'
                  ? 'Try adjusting your search query or verdict filter.'
                  : 'Upload an offer letter, Telegram chat, or SMS screenshot in the scanner to verify it.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/scan')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Start New Scan</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredScans.map((scan) => {
              const risk = scan.result?.riskScore ?? 0;
              const verdict = scan.result?.verdict || 'Analysis Complete';
              const isScam = verdict === 'Scam' || risk >= 70;
              const isSuspicious = !isScam && (verdict === 'Suspicious' || risk >= 35);
              const isSafe = !isScam && !isSuspicious;

              return (
                <div
                  key={scan.id}
                  className="p-5 rounded-2xl border border-[#e2e8f0] dark:border-slate-800 bg-white dark:bg-[#0d1629] shadow-xs hover:border-[#2563eb]/40 transition-all text-left flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isScam
                            ? 'bg-red-50 dark:bg-red-500/10 text-[#dc2626] dark:text-red-400 border border-red-200 dark:border-red-500/30'
                            : isSuspicious
                            ? 'bg-amber-50 dark:bg-amber-500/10 text-[#ea580c] dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                            : 'bg-emerald-50 dark:bg-emerald-500/10 text-[#059669] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                        }`}
                      >
                        {isScam ? (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        ) : isSuspicious ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                        <span>{isScam ? 'SCAM DETECTED' : isSuspicious ? 'SUSPICIOUS' : 'SAFE & GENUINE'}</span>
                      </span>

                      <span className="text-xs text-[#64748b] dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(scan.timestamp).toLocaleString()}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#0f172a] dark:text-white truncate">
                      {scan.filename || 'Diagnostic Scan Document'}
                    </h3>

                    {scan.result?.primaryReason && (
                      <p className="text-xs text-[#475569] dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {scan.result.primaryReason}
                      </p>
                    )}

                    {/* Threat Bar */}
                    <div className="flex items-center gap-4 pt-1 max-w-md">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold">
                          <span className="text-[#64748b] dark:text-slate-400">Risk Score:</span>
                          <span
                            className={`font-mono font-bold ${
                              isScam
                                ? 'text-[#dc2626]'
                                : isSuspicious
                                ? 'text-[#ea580c]'
                                : 'text-[#059669]'
                            }`}
                          >
                            {risk}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#e2e8f0] dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isScam ? 'bg-red-500' : isSuspicious ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.max(4, risk)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#e2e8f0] dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleOpenInScanner(scan)}
                      className="px-4 py-2 rounded-xl border border-[#cbd5e1] dark:border-slate-700 bg-white dark:bg-[#0b1329] text-xs font-bold text-[#334155] dark:text-slate-200 hover:text-[#0f172a] dark:hover:text-white hover:bg-[#f1f5f9] dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Open in Scanner
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReport(scan)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Forensic Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
