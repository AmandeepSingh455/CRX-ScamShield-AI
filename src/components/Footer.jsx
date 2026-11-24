import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  PhoneCall,
  ExternalLink,
  ArrowRight,
  Shield,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openHelpline } = useApp();

  return (
    <footer className="w-full bg-white dark:bg-[#0d1629] border-t border-[#e2e8f0] dark:border-slate-800 transition-colors mt-auto select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 text-left">
          
          {/* Column 1: Brand Summary */}
          <div className="space-y-4">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                navigate('/dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] dark:bg-emerald-500/15 border border-[#a7f3d0] dark:border-emerald-500/30 flex items-center justify-center text-[#059669] dark:text-emerald-400 shadow-xs transition-transform group-hover:scale-105">
                <ShieldCheck className="w-5 h-5 text-[#059669] dark:text-emerald-400 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-[#0f172a] dark:text-white text-base block">
                  CRX ScamShield AI
                </span>
                <span className="text-[10px] block text-[#059669] dark:text-emerald-400 font-bold uppercase tracking-wider">
                  FAKE JOB & SCAM DEFENSE
                </span>
              </div>
            </div>

            <p className="text-xs text-[#475569] dark:text-slate-400 leading-relaxed font-normal">
              CRX ScamShield AI checks job offers, Telegram tasks and WhatsApp messages for scams – before you pay. Free, simple and in your language.
            </p>

            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#059669] dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>Real-Time AI Fraud Shield Active</span>
            </div>
          </div>

          {/* Column 2: Quick links */}
          <div>
            <h4 className="text-xs font-bold text-[#0f172a] dark:text-white uppercase tracking-wider mb-4">
              Quick links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/scan');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`transition-colors flex items-center gap-1.5 cursor-pointer hover:text-[#2563eb] dark:hover:text-blue-400 ${
                    location.pathname === '/scan'
                      ? 'text-[#2563eb] dark:text-blue-400 font-bold'
                      : 'text-[#475569] dark:text-slate-400'
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  <span>Scan</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/live-monitor');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`transition-colors flex items-center gap-1.5 cursor-pointer hover:text-[#2563eb] dark:hover:text-blue-400 ${
                    location.pathname === '/live-monitor'
                      ? 'text-[#2563eb] dark:text-blue-400 font-bold'
                      : 'text-[#475569] dark:text-slate-400'
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  <span>Live monitor</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/scan-history');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`transition-colors flex items-center gap-1.5 cursor-pointer hover:text-[#2563eb] dark:hover:text-blue-400 ${
                    location.pathname === '/scan-history' || location.pathname === '/history'
                      ? 'text-[#2563eb] dark:text-blue-400 font-bold'
                      : 'text-[#475569] dark:text-slate-400'
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  <span>History (Scan history)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/threat-map');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`transition-colors flex items-center gap-1.5 cursor-pointer hover:text-[#2563eb] dark:hover:text-blue-400 ${
                    location.pathname === '/threat-map'
                      ? 'text-[#2563eb] dark:text-blue-400 font-bold'
                      : 'text-[#475569] dark:text-slate-400'
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  <span>Threat map</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`transition-colors flex items-center gap-1.5 cursor-pointer hover:text-[#2563eb] dark:hover:text-blue-400 ${
                    location.pathname === '/dashboard'
                      ? 'text-[#2563eb] dark:text-blue-400 font-bold'
                      : 'text-[#475569] dark:text-slate-400'
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  <span>Dashboard</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Safety tips */}
          <div>
            <h4 className="text-xs font-bold text-[#0f172a] dark:text-white uppercase tracking-wider mb-4">
              Safety tips
            </h4>
            <ul className="space-y-3 text-xs text-[#475569] dark:text-slate-400">
              <li className="flex items-start gap-2.5 leading-snug">
                <span className="w-2 h-2 rounded-full bg-[#10b981] mt-1 shrink-0" />
                <span>Never pay money to get a job.</span>
              </li>
              <li className="flex items-start gap-2.5 leading-snug">
                <span className="w-2 h-2 rounded-full bg-[#10b981] mt-1 shrink-0" />
                <span>"Like and earn" tasks are always a trap.</span>
              </li>
              <li className="flex items-start gap-2.5 leading-snug">
                <span className="w-2 h-2 rounded-full bg-[#10b981] mt-1 shrink-0" />
                <span>Real HR never uses Gmail or only WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2.5 leading-snug">
                <span className="w-2 h-2 rounded-full bg-[#10b981] mt-1 shrink-0" />
                <span>Never share OTP, UPI PIN or screen.</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Emergency */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-[#0f172a] dark:text-white uppercase tracking-wider mb-4">
              Emergency
            </h4>

            <div>
              <button
                type="button"
                onClick={openHelpline}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer select-none"
              >
                <PhoneCall className="w-4 h-4 stroke-[2.2]" />
                <span>Call 1930</span>
              </button>
            </div>

            <div>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#2563eb] dark:text-blue-400 hover:underline font-semibold"
              >
                <span>cybercrime.gov.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-[11px] text-[#64748b] dark:text-slate-400 leading-relaxed bg-[#f8fafc] dark:bg-[#0b1329]/70 p-3 rounded-xl border border-[#e2e8f0] dark:border-slate-800">
              Lost money? Call 1930 within the first hour – banks can often freeze it.
            </p>
          </div>

        </div>

        {/* Bottom Attribution Line */}
        <div className="border-t border-[#e2e8f0] dark:border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748b] dark:text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} CRX ScamShield AI. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-[#0f172a] dark:text-slate-300 font-semibold">Managed by Aman</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
