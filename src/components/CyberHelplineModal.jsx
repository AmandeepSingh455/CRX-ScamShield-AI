import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  PhoneCall,
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CyberHelplineModal({ isOpen, onClose }) {
  const { t } = useApp();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText("1930");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-40"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="relative z-50 w-full max-w-xl rounded-2xl border border-red-700/40 bg-card-bg shadow-2xl overflow-hidden text-left"
      >
        {/* Official Header */}
        <div className="p-5 bg-gradient-to-r from-red-800 to-red-700 text-white flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-900/80 border border-red-500/40 flex items-center justify-center shrink-0 shadow-sm">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white leading-tight">
                  {t("helplineModalTitle")}
                </h2>
              </div>
              <p className="text-[11px] text-red-100 font-medium mt-1 leading-snug">
                {t("helplineModalSubtitle")}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-[9px] font-bold text-red-200 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {t("tollFreeBadge")}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-red-200 hover:text-white hover:bg-red-900/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent 1930 Display & Action Area */}
        <div className="p-6 bg-app-bg/60 border-b border-border-color text-center space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary block">
            National Cyber Crime Emergency Number
          </span>

          {/* High-Visibility 1930 Display */}
          <div className="py-3 px-6 rounded-2xl bg-card-bg border-2 border-red-600/30 shadow-sm inline-flex flex-col items-center justify-center min-w-[240px]">
            <span className="text-5xl sm:text-6xl font-mono font-black tracking-wider text-red-700 dark:text-red-400 selection:bg-red-500 selection:text-white">
              1930
            </span>
            <span className="text-[10px] text-text-secondary font-semibold mt-1">
              Citizen Financial Cyber Fraud Reporting System
            </span>
          </div>

          {/* Action Buttons: Call & Copy */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <a
              href="tel:1930"
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t("callNowBtn")}</span>
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-border-color bg-card-bg hover:bg-app-bg text-text-primary font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-accent-color" />
                  <span className="text-accent-color">{t("numberCopied")}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-text-secondary" />
                  <span>{t("copyNumberBtn")}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Golden Hour & Advisory Guidance */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-200 flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Golden Hour Priority: </strong>
              {t("goldenHourAdvice")}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              Immediate Assistance Provided For:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-text-secondary">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-card-bg border border-border-color">
                <ShieldAlert className="w-3.5 h-3.5 text-danger-color shrink-0" />
                <span>UPI / NetBanking Frauds</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-card-bg border border-border-color">
                <ShieldAlert className="w-3.5 h-3.5 text-danger-color shrink-0" />
                <span>Debit / Credit Card Phishing</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-card-bg border border-border-color">
                <ShieldAlert className="w-3.5 h-3.5 text-danger-color shrink-0" />
                <span>Digital Arrest Extortion</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-card-bg border border-border-color">
                <ShieldAlert className="w-3.5 h-3.5 text-danger-color shrink-0" />
                <span>Job Offer Deposit Traps</span>
              </div>
            </div>
          </div>
        </div>

        {/* Official Portal Footer Link */}
        <div className="p-4 border-t border-border-color bg-app-bg/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[11px] text-text-secondary">
            Official Portal: <strong>cybercrime.gov.in</strong>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-color bg-card-bg hover:bg-border-color/40 text-text-primary text-[11px] font-bold transition-colors cursor-pointer"
            >
              <span>{t("visitPortalBtn")}</span>
              <ExternalLink className="w-3 h-3 text-text-secondary" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-border-color hover:bg-card-bg text-text-secondary text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {t("closeBtn")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
