import React from 'react';
import { AtSign, Phone, ShieldAlert } from 'lucide-react';

export default function FlaggedIdentifiersTable({ identifiers = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 mb-1 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <AtSign className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Most reported UPI IDs and phone numbers
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">
            Partly hidden for privacy
          </span>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">ID / Number</th>
              <th className="py-3 px-3">Reports</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {identifiers.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                {/* Type */}
                <td className="py-3 px-3 text-slate-700 font-medium flex items-center gap-2">
                  {item.icon === 'phone' ? (
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <AtSign className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{item.type}</span>
                </td>

                {/* ID / Number */}
                <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                  {item.identifier}
                </td>

                {/* Reports */}
                <td className="py-3 px-3 font-mono font-bold text-slate-700">
                  {item.reports}
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    <ShieldAlert className="w-3 h-3 text-slate-400" />
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
