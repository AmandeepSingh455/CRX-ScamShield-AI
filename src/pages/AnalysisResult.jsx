import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import { jsPDF } from "jspdf";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Download,
  Copy,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Building2,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function AnalysisResult() {
  const {
    activeScan,
    user,
    isLeftDrawerOpen,
    setIsLeftDrawerOpen,
    setIsRightDrawerOpen,
    t,
  } = useApp();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        setIsRightDrawerOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsLeftDrawerOpen(false);
        setIsRightDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsLeftDrawerOpen, setIsRightDrawerOpen]);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else if (!activeScan) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, activeScan, navigate]);

  if (!activeScan) return null;

  const { filename, text, result, timestamp } = activeScan;
  const { riskScore, confidenceScore, verdict, flags, highlightedText } =
    result;

  const dateFormatted = new Date(timestamp).toLocaleString();

  const handleCopy = () => {
    const summary = `
=== CRX SCAMSHIELD AI ANALYSIS REPORT ===
Filename: ${filename}
Scan Date: ${dateFormatted}
Threat Level (Risk Score): ${riskScore}%
Confidence Score: ${confidenceScore}%
Verdict: ${verdict}

DETECTED RED FLAGS:
${flags.length > 0 ? flags.map((f) => `- ${f.label} (+${f.score}): matched "${f.matchedPhrase}". ${f.description}`).join("\n") : "No significant red flags detected."}

Parsed Document Snippet:
${text.slice(0, 300)}...
===========================================
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const primaryColor = "#0f172a"; // Deep Slate
    const emeraldColor = "#10b981"; // Emerald Green
    const redColor = "#ef4444"; // Red
    const amberColor = "#f59e0b"; // Amber

    let statusColor = emeraldColor;
    if (riskScore >= 50) statusColor = redColor;
    else if (riskScore >= 20) statusColor = amberColor;

    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor("#f8fafc");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("CRX SCAMSHIELD AI", 15, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("FAKE JOB & DOCUMENT SCAM DETECTOR REPORT", 15, 26);
    doc.text(`Generated: ${dateFormatted}`, 145, 26);

    doc.setFillColor("#f1f5f9");
    doc.roundedRect(15, 48, 180, 32, 3, 3, "F");

    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("THREAT DIAGNOSTIC:", 22, 58);

    doc.setFontSize(20);
    doc.setTextColor(statusColor);
    doc.text(`${verdict} (${riskScore}%)`, 22, 68);

    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`File Name: ${filename}`, 110, 58);
    doc.text(`Confidence Score: ${confidenceScore}%`, 110, 64);
    doc.text(`Security Engine: ScamShield-v4.2`, 110, 70);

    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("DETECTED RISK METRICS", 15, 92);

    doc.setDrawColor("#cbd5e1");
    doc.setLineWidth(0.5);
    doc.line(15, 95, 195, 95);

    let yPosition = 104;

    if (flags.length === 0) {
      doc.setTextColor('#555555');
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      const emptyStateLines = doc.splitTextToSize(
        'No critical security risks or fraudulent keywords identified in this document.',
        168
      );
      doc.text(emptyStateLines, 15, yPosition);
      yPosition += (emptyStateLines.length * 5) + 10;
    } else {
      flags.forEach((flag) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFillColor(statusColor);
        doc.circle(18, yPosition - 1.5, 1.5, "F");

        doc.setTextColor(primaryColor);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.text(`${flag.label} (Score: +${flag.score})`, 24, yPosition);

        yPosition += 5;
        doc.setTextColor("#555555");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text(`Matched term: "${flag.matchedPhrase}"`, 24, yPosition);

        yPosition += 4.5;
        const descLines = doc.splitTextToSize(flag.description, 168);
        doc.text(descLines, 24, yPosition);

        yPosition += descLines.length * 4.5 + 6;
      });
    }

    if (result.companyVerification?.verifiedCompany) {
      if (yPosition > 230) {
        doc.addPage();
        yPosition = 20;
      }
      yPosition += 6;
      doc.setTextColor(primaryColor);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("MCA REGISTRATION & CIN COMPLIANCE:", 15, yPosition);
      yPosition += 5.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(`Entity: ${result.companyVerification.verifiedCompany.name} | CIN: ${result.companyVerification.verifiedCompany.cin}`, 15, yPosition);
      yPosition += 5;
      doc.text(`Sector: ${result.companyVerification.verifiedCompany.sector} | Domain: ${result.companyVerification.verifiedCompany.domain}`, 15, yPosition);
      yPosition += 8;
    }

    if (riskScore >= 40) {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }
      doc.setFillColor("#fee2e2");
      doc.rect(15, yPosition, 180, 14, "F");
      doc.setTextColor("#991b1b");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("CRITICAL ADVISORY: DIAL NATIONAL CYBER HELPLINE 1930", 20, yPosition + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("If funds have been transferred or credentials compromised, immediately lodge a complaint at cybercrime.gov.in or dial 1930.", 20, yPosition + 10.5);
      yPosition += 20;
    }

    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("SCANNED DOCUMENT PREVIEW", 15, yPosition);

    doc.line(15, yPosition + 3, 195, yPosition + 3);
    yPosition += 10;

    doc.setTextColor("#333333");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    const previewLines = doc.splitTextToSize(text, 175);
    doc.text(previewLines.slice(0, 30), 15, yPosition);

    const cleanName = filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    doc.save(`ScamShield_Report_${cleanName}.pdf`);
  };

  const getSeverityColors = () => {
    if (riskScore >= 50) {
      return {
        bg: "bg-red-500/10 dark:bg-red-500/15",
        border: "border-red-200 dark:border-red-900/60",
        text: "text-red-600 dark:text-red-400",
        badge: "bg-red-500 text-white",
        icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
      };
    } else if (riskScore >= 20) {
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/15",
        border: "border-amber-200 dark:border-amber-900/60",
        text: "text-amber-600 dark:text-amber-400",
        badge: "bg-amber-500 text-slate-950 font-bold",
        icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
      };
    } else {
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        border: "border-emerald-200 dark:border-emerald-900/60",
        text: "text-emerald-600 dark:text-emerald-400",
        badge: "bg-emerald-500 text-slate-950 font-bold",
        icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
      };
    }
  };

  const severity = getSeverityColors();

  const radius = 60;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

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
          className="flex-1 p-6 lg:p-8 space-y-8 overflow-x-hidden min-w-0"
        >
          <div className="flex justify-between items-center border-b border-border-color pb-5">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
            <div className="flex gap-2.5">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-border-color bg-card-bg hover:bg-app-bg transition-all cursor-pointer shadow-sm text-text-primary"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-accent-color" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy Summary"}
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-btn-bg text-btn-text hover:opacity-90 transition-all cursor-pointer shadow-md active:scale-95 btn-premium"
              >
                <Download className="w-4 h-4" />
                Download PDF Report
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
            <div className="xl:col-span-2 space-y-6">
              <div className="rounded-2xl border border-border-color bg-card-bg p-6 shadow-sm flex flex-col items-center text-center card-premium">
                <span className="text-[10px] font-bold text-text-secondary dark:text-accent-color uppercase tracking-widest mb-6">
                  Threat Analysis Index
                </span>
                <div className="relative flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle
                      className="text-border-color/30"
                      strokeWidth={strokeWidth}
                      stroke="currentColor"
                      fill="transparent"
                      r={normalizedRadius}
                      cx={radius + strokeWidth}
                      cy={radius + strokeWidth}
                    />
                    <motion.circle
                      className={
                        riskScore >= 50
                          ? "text-danger-color"
                          : riskScore >= 20
                            ? "text-warning-color"
                            : "text-accent-color"
                      }
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference + " " + circumference}
                      style={{ strokeDashoffset }}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r={normalizedRadius}
                      cx={radius + strokeWidth}
                      cy={radius + strokeWidth}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold font-mono tracking-tight text-text-primary">
                      {riskScore}%
                    </span>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-text-secondary mt-0.5">
                      Threat
                    </span>
                  </div>
                </div>

                <div
                  className={`mt-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${severity.badge}`}
                >
                  {verdict}
                </div>
                <div className="mt-4 text-xs text-text-secondary max-w-60">
                  Risk calculations indicate{" "}
                  {riskScore >= 50
                    ? "extremely suspicious markers typical of employment phishing."
                    : riskScore >= 20
                      ? "moderate anomalies that deserve verification before responding."
                      : "normal patterns compatible with standard official offers."}
                </div>
              </div>
              <div className="rounded-2xl border border-border-color bg-card-bg p-5 shadow-sm space-y-4 card-premium">
                <h4 className="text-[10px] font-bold text-text-secondary dark:text-accent-color uppercase tracking-wider">
                  Detection Confidence
                </h4>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-text-secondary">
                      Confidence Score
                    </span>
                    <span className="text-text-primary">
                      {confidenceScore}%
                    </span>
                  </div>
                  <div className="w-full bg-app-bg h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-accent-color h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${confidenceScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-[10px] text-text-secondary">
                    Accuracy rates are computed based on word counts, document
                    layout formatting, and exact phrasing densities.
                  </p>
                </div>
              </div>
            </div>
            <div className="xl:col-span-3 space-y-6">
              <div className="rounded-2xl border border-border-color bg-card-bg p-6 shadow-sm space-y-4 card-premium">
                <div className="flex justify-between items-center border-b border-border-color pb-3">
                  <h3 className="text-xs font-bold text-text-primary dark:text-accent-color uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-warning-color" />
                    Highlighted Document Preview
                  </h3>
                  <span className="text-[10px] text-danger-color font-semibold px-2 py-0.5 rounded border border-danger-color/20 bg-danger-color/5">
                    Red Flags Highlighted
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-app-bg/50 border border-border-color max-h-55 overflow-y-auto">
                  <p
                    className="text-xs leading-relaxed font-sans whitespace-pre-wrap select-text text-left text-text-primary"
                    dangerouslySetInnerHTML={{ __html: highlightedText }}
                  />
                </div>
              </div>

              {/* Emergency Cyber Helpline 1930 Warning for High Threats */}
              {riskScore >= 40 && (
                <div className="p-4.5 rounded-2xl border border-red-500/40 bg-red-500/10 dark:bg-red-500/15 flex items-start gap-3.5 text-left shadow-sm">
                  <PhoneCall className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-bounce" />
                  <div className="space-y-1 grow">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                        National Cyber Crime Reporting Helpline &bull; 1930
                      </span>
                      <a
                        href="tel:1930"
                        className="px-3 py-1 rounded-xl bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95"
                      >
                        <PhoneCall className="w-3 h-3" />
                        Call 1930
                      </a>
                    </div>
                    <p className="text-[11px] text-red-600/90 dark:text-red-300 leading-relaxed">
                      {t("call1930Notice")}
                    </p>
                  </div>
                </div>
              )}

              {/* MCA Corporate Registration & 21-digit CIN Verification Section */}
              {result.companyVerification && (result.companyVerification.verifiedCompany || result.companyVerification.fakeCinMatch || result.companyVerification.matchedCompanies?.length > 0) && (
                <div className="rounded-2xl border border-border-color bg-card-bg p-5 shadow-sm space-y-3.5 text-left card-premium">
                  <div className="flex items-center justify-between border-b border-border-color pb-3">
                    <h3 className="text-xs font-bold text-text-primary dark:text-accent-color uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-accent-color" />
                      {t("mcaVerificationTitle")}
                    </h3>

                    {result.companyVerification.fakeCinMatch ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">
                        Fake / Invalid CIN
                      </span>
                    ) : result.companyVerification.cinMismatch ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        CIN Mismatch
                      </span>
                    ) : result.companyVerification.verifiedCompany ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        MCA Verified Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Enterprise Mentioned
                      </span>
                    )}
                  </div>

                  {result.companyVerification.verifiedCompany && (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-border-color/30">
                        <span className="text-text-secondary">{t("companyName")}:</span>
                        <span className="font-bold text-text-primary text-right">{result.companyVerification.verifiedCompany.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border-color/30">
                        <span className="text-text-secondary">{t("verifiedCIN")}:</span>
                        <span className="font-mono font-bold text-accent-color">{result.companyVerification.verifiedCompany.cin}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border-color/30">
                        <span className="text-text-secondary">{t("sector")}:</span>
                        <span className="text-text-primary">{result.companyVerification.verifiedCompany.sector}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border-color/30">
                        <span className="text-text-secondary">{t("officialDomain")}:</span>
                        <span className="font-mono text-accent-color">{result.companyVerification.verifiedCompany.domain}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-text-secondary">{t("headquarters")}:</span>
                        <span className="text-text-primary">{result.companyVerification.verifiedCompany.city}, {result.companyVerification.verifiedCompany.state}</span>
                      </div>
                    </div>
                  )}

                  {result.companyVerification.fakeCinMatch && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        Forged / Invalid CIN: "{result.companyVerification.fakeCinMatch}"
                      </div>
                      <div className="text-[11px] text-red-500/80 leading-relaxed">
                        This registration number fails the 21-digit alphanumeric Ministry of Corporate Affairs standard. It is likely forged to fabricate legitimacy.
                      </div>
                    </div>
                  )}

                  {!result.companyVerification.verifiedCompany && result.companyVerification.matchedCompanies?.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 space-y-1">
                      <span className="font-bold">Claimed Enterprise: </span>
                      <span>{result.companyVerification.matchedCompanies[0].name}</span>
                      <p className="text-[10px] text-amber-500/80">
                        Always cross-verify that the offer was sent from the corporate domain (@{result.companyVerification.matchedCompanies[0].domain}) and not a free public Gmail or Telegram handle.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-2xl border border-border-color bg-card-bg p-6 shadow-sm space-y-4 card-premium">
                <h3 className="text-xs font-bold text-text-primary dark:text-accent-color uppercase tracking-wider">
                  Threat Diagnostics ({flags.length} Flags Detected)
                </h3>

                <div className="flex flex-col gap-3">
                  {flags.length === 0 ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-color/10 border border-accent-color/20 text-xs text-accent-color">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      <span>
                        Security scanning found 0 critical scam keywords inside
                        the offer text. Genuine transaction.
                      </span>
                    </div>
                  ) : (
                    flags.map((flag) => (
                      <div
                        key={flag.id}
                        className="p-4 rounded-xl border border-border-color bg-app-bg/40 space-y-2 text-left"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-danger-color animate-pulse" />
                            {flag.label}
                          </span>
                          <span className="text-[10px] font-bold font-mono text-danger-color bg-danger-color/10 px-2 py-0.5 rounded border border-danger-color/20">
                            +{flag.score} Pts
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary">
                          Matched Keyword:{" "}
                          <span className="font-semibold text-warning-color font-mono">
                            &ldquo;{flag.matchedPhrase}&rdquo;
                          </span>
                        </p>
                        <p className="text-[10px] text-text-secondary/80">
                          {flag.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-border-color bg-card-bg flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm card-premium">
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-bold text-text-primary dark:text-accent-color flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-accent-color" />
                    Unsure about these results?
                  </h4>
                  <p className="text-[10px] text-text-secondary">
                    Ask our specialized AI Advisor to help you write an inquiry
                    email or report this sender.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const botBtn = document.querySelector(
                      'button[aria-label="Toggle AI Advisor"]',
                    );
                    if (botBtn) {
                      botBtn.dispatchEvent(
                        new MouseEvent("click", { bubbles: true }),
                      );
                    }
                  }}
                  className="px-4 py-2 bg-btn-bg text-btn-text hover:opacity-90 font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5 btn-premium active:scale-95"
                >
                  Discuss Offer With AI
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
