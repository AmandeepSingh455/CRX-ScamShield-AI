import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import RiskChart from "../components/RiskChart";
import CompanyRegistryModal from "../components/CompanyRegistryModal";
import {
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Plus,
  PhoneCall,
  Sparkles,
  Shield,
  Scan as ScanIcon,
  ExternalLink,
  Lock,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const {
    history,
    user,
    isLeftDrawerOpen,
    openHelpline,
    t,
  } = useApp();
  const navigate = useNavigate();

  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute metrics from history
  const totalScans = history.length;
  const flaggedScams = history.filter(
    (item) => item.result?.verdict === "Scam" || (item.result?.riskScore ?? 0) >= 70
  ).length;
  const suspiciousScams = history.filter(
    (item) =>
      item.result?.verdict === "Suspicious" ||
      ((item.result?.riskScore ?? 0) >= 35 && (item.result?.riskScore ?? 0) < 70)
  ).length;
  const avgRisk =
    totalScans > 0
      ? Math.round(
          history.reduce((acc, curr) => acc + (curr.result?.riskScore ?? 0), 0) /
            totalScans
        )
      : 0;

  const handleSelectCompany = (company) => {
    setIsCompanyModalOpen(false);
    navigate("/scan", { state: { templateCompany: company } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-text-primary transition-all duration-300 pt-18">
      <Navbar />

      <div className="grow w-full flex flex-col min-w-0 overflow-hidden">
        <motion.main
          animate={{
            marginLeft: isDesktop && isLeftDrawerOpen ? "320px" : "0px",
            width: isDesktop && isLeftDrawerOpen ? "calc(100% - 320px)" : "100%",
          }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
          className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-x-hidden min-w-0"
        >
          {/* Header Title Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color pb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                {t('securityWorkspaceTitle') || "Security Workspace"}
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                {t('securityWorkspaceSubtitle') || "Enterprise AI-powered scam defense, offer authentication, and threat telemetry."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-accent-color/20 bg-accent-color/5 dark:bg-accent-color/10 text-accent-color shadow-xs">
                <span className="w-2 h-2 rounded-full bg-accent-color animate-pulse" />
                {t('scannerVersion') || "Scanner Engine v4.2 Active"}
              </div>
              <button
                type="button"
                onClick={() => navigate("/scan")}
                className="bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New scan</span>
              </button>
            </div>
          </div>

          {/* Top 4 KPI Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat 1: Total Scans */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="p-5 rounded-2xl border border-border-color bg-card-bg shadow-xs card-premium relative overflow-hidden text-left"
            >
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                {t('totalScans') || "TOTAL SCANS PROCESSED"}
              </span>
              <span className="text-3xl font-extrabold block mt-2 font-mono text-text-primary">
                {totalScans}
              </span>
              <span className="text-[9px] text-text-secondary mt-1 block">
                {t('totalScansDesc') || "Total forensic diagnostic jobs conducted"}
              </span>
            </motion.div>

            {/* Stat 2: Scams Detected */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="p-5 rounded-2xl border border-danger-color/20 bg-card-bg dark:bg-danger-color/5 shadow-xs card-premium relative overflow-hidden text-left"
            >
              <div className="absolute top-3 right-3 text-danger-color/40">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-danger-color uppercase tracking-wider block">
                {t('scamsDetected') || "SCAMS DETECTED"}
              </span>
              <span className="text-3xl font-extrabold block mt-2 font-mono text-danger-color">
                {flaggedScams}
              </span>
              <span className="text-[9px] text-danger-color/80 mt-1 block">
                {t('scamsDetectedDesc') || "Critical fraud & extortion demands flagged"}
              </span>
            </motion.div>

            {/* Stat 3: Suspicious Logs */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="p-5 rounded-2xl border border-warning-color/20 bg-card-bg dark:bg-warning-color/5 shadow-xs card-premium relative overflow-hidden text-left"
            >
              <div className="absolute top-3 right-3 text-warning-color/40">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-warning-color uppercase tracking-wider block">
                {t('suspiciousLogs') || "SUSPICIOUS ANOMALIES"}
              </span>
              <span className="text-3xl font-extrabold block mt-2 font-mono text-warning-color">
                {suspiciousScams}
              </span>
              <span className="text-[9px] text-warning-color/80 mt-1 block">
                {t('suspiciousLogsDesc') || "Unverified recruiter entities and warnings"}
              </span>
            </motion.div>

            {/* Stat 4: Avg Threat Index */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="p-5 rounded-2xl border border-accent-color/20 bg-card-bg dark:bg-accent-color/5 shadow-xs card-premium relative overflow-hidden text-left"
            >
              <div className="absolute top-3 right-3 text-accent-color/40">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-accent-color uppercase tracking-wider block">
                {t('avgThreatIndex') || "AVERAGE THREAT INDEX"}
              </span>
              <span className="text-3xl font-extrabold block mt-2 font-mono text-accent-color">
                {avgRisk}%
              </span>
              <span className="text-[9px] text-accent-color/80 mt-1 block">
                {t('avgThreatIndexDesc') || "Aggregate risk baseline across user records"}
              </span>
            </motion.div>
          </div>

          {/* Main 2-Column Dashboard Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Executive Overview & Scan Launch Hero */}
            <div className="lg:col-span-2 space-y-6 text-left">
              {/* Hero Quick Launch Card */}
              <div className="rounded-2xl border border-border-color bg-gradient-to-br from-card-bg to-accent-color/5 p-6 sm:p-8 shadow-sm card-premium space-y-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Dedicated Scanning Workspace Ready</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                      AI-Powered Scam & Fraud Detection
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Verify offer letters, task screenshots, recruiter WhatsApp/Telegram messages, and suspicious URLs against verified MCA corporate registries and multi-factor neural fraud models.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/scan")}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all shrink-0"
                  >
                    <ScanIcon className="w-4 h-4" />
                    <span>Launch New Scan</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border-color/60 text-center">
                  <div className="p-2 rounded-xl bg-app-bg/50 border border-border-color">
                    <span className="text-[10px] text-text-secondary font-medium block">Analysis Engine</span>
                    <span className="text-xs font-bold text-text-primary mt-0.5 block">Groq AI + OCR</span>
                  </div>
                  <div className="p-2 rounded-xl bg-app-bg/50 border border-border-color">
                    <span className="text-[10px] text-text-secondary font-medium block">Verification Policy</span>
                    <span className="text-xs font-bold text-text-primary mt-0.5 block">Zero-Trust MCA</span>
                  </div>
                  <div className="p-2 rounded-xl bg-app-bg/50 border border-border-color">
                    <span className="text-[10px] text-text-secondary font-medium block">Supported Inputs</span>
                    <span className="text-xs font-bold text-text-primary mt-0.5 block">File, Photo, Text, URL</span>
                  </div>
                  <div className="p-2 rounded-xl bg-app-bg/50 border border-border-color">
                    <span className="text-[10px] text-text-secondary font-medium block">Language Support</span>
                    <span className="text-xs font-bold text-text-primary mt-0.5 block">EN, HI, PA</span>
                  </div>
                </div>
              </div>

              {/* Recent Scan Diagnostics Log */}
              <div className="rounded-2xl border border-border-color bg-card-bg shadow-sm p-6 space-y-4 card-premium">
                <div className="flex items-center justify-between border-b border-border-color pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary dark:text-accent-color uppercase tracking-wider">
                      Recent Scan Diagnostics Log
                    </h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      Review recently evaluated forensic scans and verdicts
                    </p>
                  </div>
                  {history.length > 0 && (
                    <button
                      type="button"
                      onClick={() => navigate("/scan")}
                      className="text-xs text-accent-color font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="p-8 text-center space-y-3 bg-app-bg/30 rounded-xl border border-border-color">
                    <div className="w-12 h-12 rounded-full bg-accent-color/10 text-accent-color flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">No Scan Diagnostic Records Yet</p>
                      <p className="text-[11px] text-text-secondary mt-1">
                        Upload an offer letter, screenshot, or suspicious message to begin protecting candidates.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate("/scan")}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Start Your First Scan</span>
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-border-color/60">
                    {history.slice(0, 5).map((scan) => {
                      const verdict = scan.result?.verdict || "Completed";
                      const risk = scan.result?.riskScore ?? 0;
                      return (
                        <div
                          key={scan.id}
                          className="py-3 flex items-center justify-between gap-4 flex-wrap hover:bg-app-bg/40 px-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${
                              verdict === "Scam" || risk >= 70
                                ? "bg-red-500/10 text-red-500"
                                : verdict === "Suspicious" || risk >= 35
                                ? "bg-amber-500/10 text-amber-500"
                                : verdict === "Needs Verification"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-emerald-500/10 text-emerald-500"
                            }`}>
                              {verdict === "Scam" || risk >= 70 ? (
                                <ShieldAlert className="w-4 h-4 text-red-500" />
                              ) : verdict === "Suspicious" || risk >= 35 ? (
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                              ) : (
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-primary truncate max-w-xs sm:max-w-md">
                                {scan.filename || "Direct Document Scan"}
                              </p>
                              <p className="text-[10px] text-text-secondary font-mono">
                                {new Date(scan.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              verdict === "Scam" || risk >= 70
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : verdict === "Suspicious" || risk >= 35
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                : verdict === "Needs Verification"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            }`}>
                              {verdict} ({risk}%)
                            </span>

                            <button
                              type="button"
                              onClick={() => navigate("/analysis-result", { state: { scan } })}
                              className="px-3 py-1 rounded-lg border border-border-color text-[11px] font-semibold text-text-primary hover:bg-app-bg transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* National Cyber Helpline 1930 Notice */}
              <div className="p-4.5 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 flex items-start gap-3.5 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/80 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0 mt-0.5">
                  <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-300" />
                </div>
                <div className="space-y-1 grow">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg text-red-600 dark:text-red-400">
                        1930
                      </span>
                      <span className="text-xs font-bold text-red-800 dark:text-red-200 uppercase">
                        National Cyber Fraud Emergency Helpline
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={openHelpline}
                      className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                    >
                      Call Now
                    </button>
                  </div>
                  <p className="text-[11px] text-red-700 dark:text-red-300 leading-relaxed">
                    If financial loss has occurred or money was transferred via UPI/QR code, lodge a complaint immediately at cybercrime.gov.in or dial 1930 within the golden hour to freeze fraudulent beneficiary accounts.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Registry, Trends & Awareness */}
            <div className="space-y-6 text-left">
              {/* 1,000 Registered Companies Directory Button */}
              <button
                type="button"
                onClick={() => setIsCompanyModalOpen(true)}
                className="w-full p-4 rounded-2xl border border-accent-color/30 bg-accent-color/10 hover:bg-accent-color/15 text-accent-color transition-all flex items-center justify-between gap-3 shadow-xs cursor-pointer group card-premium"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-color/20 text-accent-color flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block text-text-primary group-hover:text-accent-color transition-colors">
                      {t('companyRegistryBtn') || "1,000+ Registered Companies"}
                    </span>
                    <span className="text-[10px] text-text-secondary block">
                      {t('companyRegistryBtnSub') || "Verify active MCA Corporate CINs & domains"}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-accent-color shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Threat Trend Chart */}
              <div
                id="threat-trend-chart"
                className="rounded-2xl border border-border-color bg-card-bg shadow-xs card-premium p-5 relative overflow-hidden"
              >
                <RiskChart />
              </div>

              {/* Zero-Trust Safety Guidelines */}
              <div className="rounded-2xl border border-border-color bg-card-bg shadow-xs card-premium p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-primary">
                  <Lock className="w-4 h-4 text-accent-color" />
                  <span>Golden Rules of Scam Defense</span>
                </div>
                <ul className="text-xs text-text-secondary space-y-2 list-disc pl-4 leading-relaxed">
                  <li><strong>Never pay upfront fees:</strong> Legitimate employers never charge candidates for onboarding, gate passes, laptops, or training.</li>
                  <li><strong>Check official domain:</strong> Verify that emails originate from <code>@company.com</code>, never public free webmails like Gmail or Yahoo.</li>
                  <li><strong>Verify 21-digit CIN:</strong> Always cross-reference the Corporate Identification Number on the official MCA portal (<code>mca.gov.in</code>).</li>
                  <li><strong>No Telegram tasks:</strong> Legitimate brands never pay via UPI for liking YouTube videos or submitting online hotel reviews.</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.main>
      </div>

      <CompanyRegistryModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSelectCompany={handleSelectCompany}
      />
    </div>
  );
}
