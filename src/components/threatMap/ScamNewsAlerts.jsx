import React from 'react';
import { Activity, FileText, MapPin } from 'lucide-react';

export default function ScamNewsAlerts({ alerts = [] }) {
  return (
    <div className="bg-card-bg rounded-2xl border border-border-color shadow-xs p-5 flex flex-col h-full transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-color shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary tracking-tight">
              Scam news & alerts
            </h3>
            <span className="text-[11px] text-text-secondary font-medium">
              Verified police advisories & FIR logs
            </span>
          </div>
        </div>

        {/* Live indicator dot */}
        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Live</span>
        </div>
      </div>

      {/* Scrollable alerts feed */}
      <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {alerts.map((alert) => {
          const isRed = alert.iconType === 'red';
          const isAmber = alert.iconType === 'amber';

          const iconBg = isRed
            ? 'bg-red-50 dark:bg-red-950/40 text-red-500 dark:text-red-400 border-red-100 dark:border-red-900/50'
            : isAmber
            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'
            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50';

          const tagBg = isRed
            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50'
            : isAmber
            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'
            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50';

          return (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl border border-border-color/80 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-border-color transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-text-primary group-hover:text-blue-500 transition-colors leading-snug">
                    {alert.title}
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed mt-1">
                    {alert.summary}
                  </p>
                </div>
              </div>

              {/* Footer Badges */}
              <div className="flex items-center gap-2.5 mt-2.5 pl-9.5 text-[10px]">
                <span className={`px-2 py-0.5 rounded-md font-semibold border ${tagBg}`}>
                  {alert.date}
                </span>
                <span className="text-text-secondary font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-text-secondary/70" />
                  {alert.location}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
