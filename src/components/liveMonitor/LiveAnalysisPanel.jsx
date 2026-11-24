import React from 'react';
import {
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  PhoneCall,
  Clock,
} from 'lucide-react';

export default function LiveAnalysisPanel({
  activeAnalysis,
  scanHistory = [],
  isStreaming,
  onOpenHelpline,
}) {
  // Idle state when nothing has been scanned yet
  if (!activeAnalysis) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-8 sm:p-10 flex flex-col items-center justify-center text-center h-full min-h-[380px] transition-colors">
        <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] dark:bg-blue-950/40 border border-[#dbeafe] dark:border-blue-900/50 flex items-center justify-center text-[#2563eb] dark:text-blue-400 mb-4 shadow-sm">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#0f172a] dark:text-white tracking-tight">
          Ready to Guard Your Screen
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
          Once monitoring starts, CyberShield AI inspects the active window for task scams, fake appointment letters, and unverified recruiter chats.
        </p>

        {isStreaming && (
          <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/60 text-[#2563eb] dark:text-blue-300 text-xs font-semibold animate-pulse">
            <Activity className="w-3.5 h-3.5" />
            Analyzing initial frame stream...
          </div>
        )}
      </div>
    );
  }

  const { riskScore = 0, confidenceScore = 80, verdict = 'Likely Safe', status = 'safe', flags = [], timestamp } = activeAnalysis;

  const isScam = status === 'scam' || riskScore >= 70;
  const isSuspicious = status === 'suspicious' || (riskScore >= 35 && riskScore < 70);

  // Verdict theme
  const verdictConfig = isScam
    ? {
        badge: 'SCAM DETECTED',
        badgeBg: 'bg-[#fef2f2] dark:bg-red-950/40 text-[#dc2626] dark:text-red-400 border-[#fee2e2] dark:border-red-900/60',
        icon: ShieldAlert,
        color: '#dc2626',
        barColor: 'bg-[#dc2626]',
        directive: 'CRITICAL ALERT: High probability cyber fraud or extortion attempt. Never send money via UPI or QR code.',
      }
    : isSuspicious
    ? {
        badge: 'SUSPICIOUS / FAKE ANOMALY',
        badgeBg: 'bg-[#fff7ed] dark:bg-amber-950/40 text-[#ea580c] dark:text-amber-400 border-[#ffedd5] dark:border-amber-900/60',
        icon: AlertTriangle,
        color: '#ea580c',
        barColor: 'bg-[#ea580c]',
        directive: 'WARNING: Several scam indicators or unverified entity patterns detected. Exercise extreme caution.',
      }
    : {
        badge: 'VERIFIED / SAFE',
        badgeBg: 'bg-[#ecfdf5] dark:bg-emerald-950/40 text-[#059669] dark:text-emerald-400 border-[#d1fae5] dark:border-emerald-900/60',
        icon: CheckCircle2,
        color: '#059669',
        barColor: 'bg-[#059669]',
        directive: 'No malicious triggers or extortion demands identified in the current frame.',
      };

  const VerdictIcon = verdictConfig.icon;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between h-full transition-colors space-y-4">
      {/* Top Banner: Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${verdictConfig.badgeBg}`}
          >
            <VerdictIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0f172a] dark:text-white tracking-tight">
              Real-Time Threat Assessment
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Frame timestamp: {timestamp || 'Just now'}
            </span>
          </div>
        </div>

        {/* Big Verdict Pill Badge */}
        <div
          className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wide font-mono ${verdictConfig.badgeBg}`}
        >
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: verdictConfig.color }} />
          {verdictConfig.badge}
        </div>
      </div>

      {/* Primary Forensic Reason Banner */}
      {activeAnalysis.primaryReason && (
        <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
            Primary Diagnostic Reason
          </span>
          <p className="font-semibold text-slate-800 dark:text-slate-100 leading-snug">
            {activeAnalysis.primaryReason}
          </p>
        </div>
      )}

      {/* Risk Score & Confidence Bar */}
      <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Computed Threat Level
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono" style={{ color: verdictConfig.color }}>
                {riskScore}
                <span className="text-sm text-slate-400 font-normal">/100</span>
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                ({verdict})
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              AI Confidence
            </span>
            <p className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
              {confidenceScore}%
            </p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full ${verdictConfig.barColor} transition-all duration-500 rounded-full`}
            style={{ width: `${Math.max(6, riskScore)}%` }}
          />
        </div>
      </div>

      {/* Directive / Countermeasure Recommendation */}
      <div
        className={`p-3.5 rounded-xl border text-xs leading-relaxed font-medium flex items-start gap-2.5 ${
          isScam
            ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200/80 dark:border-red-900/50 text-red-800 dark:text-red-300'
            : isSuspicious
            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
            : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
        }`}
      >
        <VerdictIcon className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold">{verdictConfig.directive}</p>
          {isScam && (
            <button
              type="button"
              onClick={onOpenHelpline}
              className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#dc2626] hover:bg-[#b91c1c] text-white text-[11px] font-bold shadow-xs cursor-pointer transition-colors"
            >
              <PhoneCall className="w-3 h-3" />
              Dial 1930 Cyber Helpline
            </button>
          )}
        </div>
      </div>

      {/* Flagged Red Flags / Matched Phrases */}
      {flags.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Detected Threat Vectors ({flags.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {flags.map((flag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-medium shadow-2xs"
              >
                {flag.label || flag.matchedPhrase || flag.id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Live Continuous Scan History Log */}
      {scanHistory.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Real-Time Scan Telemetry
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Last {Math.min(4, scanHistory.length)} cycles
            </span>
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 text-[11px] font-mono">
            {scanHistory.slice(0, 4).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1 px-2 rounded-md bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <span className="text-slate-500 dark:text-slate-400">
                  {item.time} • Cycle #{item.cycle}
                </span>
                <span
                  className={`font-bold ${
                    item.status === 'scam'
                      ? 'text-[#dc2626] dark:text-red-400'
                      : item.status === 'suspicious'
                      ? 'text-[#ea580c] dark:text-amber-400'
                      : 'text-[#059669] dark:text-emerald-400'
                  }`}
                >
                  {item.status.toUpperCase()} ({item.riskScore})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
