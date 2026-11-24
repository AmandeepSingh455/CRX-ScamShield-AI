import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function TrendingScripts({ scripts = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Trending scam scripts
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
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
                <span className="font-semibold text-slate-800">
                  {script.name}
                </span>
                <span
                  className={`font-bold font-mono text-[11px] flex items-center gap-0.5 ${
                    isNegative ? 'text-emerald-600' : 'text-[#dc2626]'
                  }`}
                >
                  {isNegative ? (
                    <ArrowDownRight className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 text-[#dc2626]" />
                  )}
                  {script.change}
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2563eb] rounded-full transition-all duration-500"
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
