import React from 'react';
import { AtSign, Phone, ShieldAlert } from 'lucide-react';

export default function FlaggedIdentifiersTable({ identifiers = [] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 mb-1 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-[#eff6ff] dark:bg-blue-950/40 border border-[#dbeafe] dark:border-blue-900/50 flex items-center justify-center text-[#2563eb] dark:text-blue-400">
          <AtSign className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0f172a] dark:text-white tracking-tight">
            Most reported UPI IDs and phone numbers
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Partly hidden for privacy
          </span>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">ID / Number</th>
              <th className="py-3 px-3">Reports</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {identifiers.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Type */}
                <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                  {item.icon === 'phone' ? (
                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  ) : (
                    <AtSign className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  )}
                  <span>{item.type}</span>
                </td>

                {/* ID / Number */}
                <td className="py-3 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {item.identifier}
                </td>

                {/* Reports */}
                <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                  {item.reports}
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <ShieldAlert className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
