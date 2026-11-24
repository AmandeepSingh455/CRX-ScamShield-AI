import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function TrendingScripts({ scripts = [] }) {
  return (
    <div className="bg-card-bg rounded-2xl border border-border-color shadow-xs p-5 flex flex-col justify-between h-full transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-color">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary tracking-tight">
              Trending scam scripts
            </h3>
            <span className="text-[11px] text-text-secondary font-medium">
              Frequency vector analysis
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bars List */}
      <div className="space-y-3.5 pt-1">
        {scripts.map((script, idx) => {
          const isNegative = script.change.startsWith('-');
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-text-primary">
                  {script.name}
                </span>
                <span
                  className={`font-bold font-mono text-[11px] flex items-center gap-0.5 ${
                    isNegative ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#dc2626] dark:text-red-400'
                  }`}
                >
                  {isNegative ? (
                    <ArrowDownRight className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 text-[#dc2626] dark:text-red-400" />
                  )}
                  {script.change}
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563eb] dark:bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${script.percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
