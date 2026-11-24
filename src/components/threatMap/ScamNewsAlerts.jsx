import React from 'react';
import { Activity, FileText, MapPin } from 'lucide-react';

export default function ScamNewsAlerts({ alerts = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Scam news & alerts
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Verified police advisories & FIR logs
            </span>
          </div>
        </div>

        {/* Live indicator dot */}
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700">Live</span>
        </div>
      </div>

      {/* Scrollable alerts feed */}
      <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin scrollbar-thumb-slate-200">
        {alerts.map((alert) => {
          const isRed = alert.iconType === 'red';
          const isAmber = alert.iconType === 'amber';

          const iconBg = isRed
            ? 'bg-red-50 text-red-500 border-red-100'
            : isAmber
            ? 'bg-amber-50 text-amber-600 border-amber-100'
            : 'bg-blue-50 text-blue-600 border-blue-100';

          const tagBg = isRed
            ? 'bg-red-50 text-red-600 border-red-100'
            : isAmber
            ? 'bg-amber-50 text-amber-700 border-amber-100'
            : 'bg-blue-50 text-blue-600 border-blue-100';

          return (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="flex items-start gap-2.5">
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {alert.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                    {alert.summary}
                  </p>
                </div>
              </div>

              {/* Footer Badges */}
              <div className="flex items-center gap-2.5 mt-2.5 pl-9.5 text-[10px]">
                <span className={`px-2 py-0.5 rounded-md font-semibold border ${tagBg}`}>
                  {alert.date}
                </span>
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
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
