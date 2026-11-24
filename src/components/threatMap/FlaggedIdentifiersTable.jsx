import React from 'react';
import { AtSign, Phone, ShieldAlert } from 'lucide-react';

export default function FlaggedIdentifiersTable({ identifiers = [] }) {
  return (
    <div className="bg-card-bg rounded-2xl border border-border-color shadow-xs p-5 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 mb-1 border-b border-border-color">
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <AtSign className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary tracking-tight">
            Most reported UPI IDs and phone numbers
          </h3>
          <span className="text-[11px] text-text-secondary font-medium">
            Partly hidden for privacy
          </span>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-color text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">ID / Number</th>
              <th className="py-3 px-3">Reports</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color text-xs">
            {identifiers.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Type */}
                <td className="py-3 px-3 text-text-primary font-medium flex items-center gap-2">
                  {item.icon === 'phone' ? (
                    <Phone className="w-3.5 h-3.5 text-text-secondary" />
                  ) : (
                    <AtSign className="w-3.5 h-3.5 text-text-secondary" />
                  )}
                  <span>{item.type}</span>
                </td>

                {/* ID / Number */}
                <td className="py-3 px-3 font-mono font-semibold text-text-primary">
                  {item.identifier}
                </td>

                {/* Reports */}
                <td className="py-3 px-3 font-mono font-bold text-text-primary">
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
