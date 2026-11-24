import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import { analyzeScam, analyzeScamAsync } from "../utils/scamAnalyzer";
import { createWorker } from "tesseract.js";
import {
  Plus,
  Search,
  Inbox,
  Upload,
  Camera,
  FileText,
  Link2,
  ChevronDown,
  ChevronUp,
  Lock,
  Scan as ScanIcon,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Trash2,
  X,
  RefreshCw,
  Building2,
  Check,
  Globe,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_SCAM_TEMPLATES = [
  {
    name: "Telegram Task Trap",
    filename: "Telegram_Task_Trap.txt",
    text: "Hello! You have been selected for online work from home. Earn ₹3000 to ₹5000 daily by liking YouTube videos and subscribing to Telegram channels. 100% guaranteed job. Direct daily payout to UPI or GPay. To activate your merchant task account, please deposit ₹500 security deposit. Pay now immediately as limited slots remain.",
  },
  {
    name: "Digital Arrest Extortion",
    filename: "Mumbai_Police_Customs_Notice.txt",
    text: "URGENT LEGAL NOTICE: This is officer Sharma from Mumbai Police Crime Branch and Narcotics Department. A parcel seized by customs at airport contains 5 passports and illegal drugs registered under your Aadhaar. You are under digital arrest. Connect to Skype video call immediately for clearance. Transfer ₹45,000 to government clearance account to avoid immediate physical arrest warrant.",
  },
  {
    name: "Fake Tata Motors Offer",
    filename: "Tata_Motors_Appointment_Letter.pdf",
    text: "OFFER LETTER - TATA MOTORS LIMITED\nCorporate Identity No: CIN-FAKE99999\nContact: tatamotors.recruitment@gmail.com\n\nDear Applicant, You have been directly selected for the position of Senior Executive. Salary: ₹12,00,000 per annum. Direct offer letter without interview. You must pay ₹2,500 onboarding gate pass and laptop security fee to our account via PhonePe / UPI today to confirm placement.",
  },
  {
    name: "Genuine TCS Offer",
    filename: "TCS_Genuine_Appointment_Letter.pdf",
    text: "TATA CONSULTANCY SERVICES LIMITED\nCorporate Identification Number (CIN): L22210MH1995PLC084781\nWebsite: https://www.tcs.com | careers@tcs.com\nTCS House, Raveline Street, Fort, Mumbai - 400001, Maharashtra, India\n\nDear Candidate, We take pleasure in offering you the role of Systems Engineer with Tata Consultancy Services Limited. This offer is contingent upon successful verification of your educational credentials and background check. Please note: TCS does not charge any registration, recruitment, or laptop security fees from candidates at any stage of the recruitment process.",
  },
];

const convertToBase64 = (fileOrBlob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileOrBlob);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export default function Scan() {
  const { history, addScan, setActiveScan, deleteScan, addToast, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected scan for viewing past results or newly generated result
  const [selectedScan, setSelectedScan] = useState(null);

  useEffect(() => {
    if (location.state?.templateCompany) {
      const company = location.state.templateCompany;
      setActiveTab("text");
      setFilename(`${company.name.replace(/[^a-zA-Z0-9]/g, "_")}_Offer_Letter.pdf`);
      setTextInput(
        `OFFICIAL APPOINTMENT LETTER\n\n` +
        `Organization: ${company.name}\n` +
        `Corporate Identification Number (CIN): ${company.cin}\n` +
        `Sector: ${company.sector}\n` +
        `Registered Office: ${company.city}, ${company.state}, India\n` +
        `Official Career Portal: https://${company.domain}/careers\n` +
        `HR Contact: talent@${company.domain}\n\n` +
        `Dear Candidate,\n\n` +
        `We are pleased to inform you that you have been offered employment with ${company.name}. Following technical assessment and interview rounds, your appointment is confirmed for the role of Senior Associate.\n\n` +
        `Please review the enclosed terms. Note that ${company.name} never solicits money, registration fees, laptop charges, or deposits from candidates at any time.\n\n` +
        `Corporate HR Team\n${company.name}`
      );
    }
  }, [location.state]);

  // Left Sidebar State
  const [searchQuery, setSearchQuery] = useState("");

  // Input Mode Tabs: 'upload' | 'camera' | 'text' | 'link'
  const [activeTab, setActiveTab] = useState("upload");

  // Input states
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [linkInput, setLinkInput] = useState("");

  // Optional details accordion
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);
  const [optionalCompany, setOptionalCompany] = useState("");
  const [optionalSalary, setOptionalSalary] = useState("");
  const [optionalPlatform, setOptionalPlatform] = useState("Telegram");

  // Drag and drop state
  const [isDragActive, setIsDragActive] = useState(false);

  // Progress states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Clean up blob preview on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl && previewUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch (_) {}
      }
    };
  }, [previewUrl]);

  // Start fresh scan
  const handleStartNewScan = () => {
    setSelectedScan(null);
    setFile(null);
    setFilename("");
    setFileSize("");
    if (previewUrl && previewUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (_) {}
    }
    setPreviewUrl(null);
    setTextInput("");
    setLinkInput("");
    setOptionalCompany("");
    setOptionalSalary("");
    stopCamera();
    addToast("New scan initialized.", "info");
  };

  // Filtered scans in sidebar
  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (item.filename || "").toLowerCase().includes(q);
    const verdictMatch = (item.result?.verdict || "").toLowerCase().includes(q);
    const textMatch = (item.text || "").toLowerCase().includes(q);
    return nameMatch || verdictMatch || textMatch;
  });

  // OCR Worker execution
  const runOcr = async (imageSource) => {
    setIsOcrProcessing(true);
    setOcrProgress(0);
    try {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });
      const {
        data: { text: extractedText },
      } = await worker.recognize(imageSource);
      await worker.terminate();
      return extractedText.trim();
    } catch (err) {
      console.error("OCR execution error:", err);
      addToast("OCR text extraction failed. Using file name & metadata.", "warning");
      return "";
    } finally {
      setIsOcrProcessing(false);
      setOcrProgress(0);
    }
  };

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  const processSelectedFile = async (uploadedFile) => {
    setFile(uploadedFile);
    setFilename(uploadedFile.name);
    const sizeStr =
      uploadedFile.size > 1024 * 1024
        ? `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(uploadedFile.size / 1024)} KB`;
    setFileSize(sizeStr);

    setIsUploading(true);
    setUploadProgress(40);

    let base64Preview = null;
    if (
      uploadedFile.type.match("image.*") ||
      uploadedFile.name.match(/\.(png|jpe?g|gif|webp)$/i)
    ) {
      try {
        base64Preview = await convertToBase64(uploadedFile);
        setPreviewUrl(base64Preview);
      } catch (err) {
        console.error("Image preview conversion error:", err);
      }
    }

    setTimeout(async () => {
      setUploadProgress(100);
      setIsUploading(false);
      addToast(`"${uploadedFile.name}" attached.`, "success");

      if (
        uploadedFile.type.match("image.*") ||
        uploadedFile.name.match(/\.(png|jpe?g|gif|webp)$/i)
      ) {
        const ocrText = await runOcr(uploadedFile);
        if (ocrText && ocrText.trim()) {
          setTextInput(ocrText.trim());
          addToast("OCR text extracted from document.", "success");
        } else {
          setTextInput(
            `[SCANNED DOCUMENT IMAGE: ${uploadedFile.name}]\nNo direct text recognized by OCR. Click Analyse to perform forensic verification on available document metadata.`
          );
        }
      } else if (uploadedFile.name.endsWith(".pdf")) {
        setTextInput(
          `OFFICIAL APPOINTMENT / OFFER DOCUMENT [${uploadedFile.name}]\nCorporate verification & offer document loaded.\nPlease verify corporate identification, HR contacts, and terms.`
        );
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          setTextInput(e.target.result || "");
        };
        reader.readAsText(uploadedFile);
      }
    }, 250);
  };

  // Camera capture methods
  const startCamera = async () => {
    setCameraError("");
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError("Camera permission denied or camera not available.");
      setIsCameraActive(false);
      addToast("Could not access camera.", "error");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    stopCamera();

    const photoFilename = `camera_scan_${Date.now().toString().slice(-4)}.png`;
    setFilename(photoFilename);
    setFileSize("420 KB");

    try {
      const base64 = await convertToBase64(blob);
      setPreviewUrl(base64);
    } catch (e) {}

    addToast("Camera photo captured. Reading text...", "info");
    const extractedText = await runOcr(blob);
    setTextInput(
      extractedText ||
        "No clear readable text captured. You can paste the message text or click Analyse."
    );
    addToast("Photo processed successfully.", "success");
  };

  // Main Analyse trigger
  const handleAnalyse = async () => {
    if (isOcrProcessing) {
      addToast("Extracting text from image... Please wait a moment.", "info");
      return;
    }

    let payloadText = textInput.trim();
    if (activeTab === "link" && linkInput.trim()) {
      payloadText = `[INSPECTED SUSPICIOUS LINK]: ${linkInput.trim()}\n${payloadText}`;
    }

    // Append optional details if provided
    if (optionalCompany.trim() || optionalSalary.trim() || optionalPlatform.trim()) {
      payloadText += `\n\n[USER PROVIDED CONTEXT]:\nClaimed Company: ${optionalCompany || "Not specified"}\nStated Salary / Demand: ${optionalSalary || "Not specified"}\nContact Platform: ${optionalPlatform}`;
    }

    const effectiveFilename =
      filename ||
      (activeTab === "link" && linkInput.trim()
        ? `Link Analysis (${new URL(linkInput.startsWith("http") ? linkInput : "https://" + linkInput).hostname || "Web Link"})`
        : activeTab === "text"
        ? "Pasted Message Scan"
        : "Direct Document Scan");

    if (!payloadText) {
      addToast("Please upload a file, paste text, or enter a link to analyse.", "warning");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeScamAsync(payloadText, effectiveFilename);
      const newScan = addScan(effectiveFilename, payloadText, result, previewUrl);
      setActiveScan(newScan);
      setSelectedScan(newScan);

      if (result.verdict === "Scam" || result.riskScore >= 70) {
        addToast("Alert: High-threat scam detected!", "error");
      } else if (result.verdict === "Suspicious" || result.riskScore >= 35) {
        addToast("Warning: Suspicious scam anomalies identified.", "warning");
      } else if (result.verdict === "Needs Verification") {
        addToast("Caution: Document unverified. Needs independent verification.", "warning");
      } else {
        addToast("Success: Evaluated authentic and genuine.", "success");
      }
    } catch (err) {
      console.error("Scan analysis error:", err);
      const fallbackResult = analyzeScam(payloadText, effectiveFilename);
      const newScan = addScan(effectiveFilename, payloadText, fallbackResult, previewUrl);
      setActiveScan(newScan);
      setSelectedScan(newScan);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1329] dark:bg-[#0b1329] light:bg-[#f8fafc] text-slate-100 dark:text-slate-100 light:text-slate-900 transition-colors duration-200 pt-18">
      <Navbar />
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden w-full">
        {/* ===================== LEFT SIDEBAR PANEL ===================== */}
        <aside className="w-72 lg:w-80 shrink-0 border-r border-slate-800 dark:border-slate-800 border-slate-200 bg-[#0d1629] dark:bg-[#0d1629] bg-white flex flex-col h-[calc(100vh-4.5rem)] transition-colors">
          {/* Top Button: + New scan */}
          <div className="p-4 border-b border-slate-800/80 dark:border-slate-800/80 border-slate-200 space-y-3 shrink-0">
            <button
              type="button"
              onClick={handleStartNewScan}
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-sm"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New scan</span>
            </button>

            {/* Search scans input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scans"
                className="w-full bg-[#131d38] dark:bg-[#131d38] bg-slate-50 border border-slate-700/60 dark:border-slate-700/60 border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-200 dark:text-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Past Scans History List / Empty State */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-full border border-slate-700/60 dark:border-slate-700/60 border-slate-300 flex items-center justify-center text-slate-400 dark:text-slate-400 text-slate-500 bg-slate-800/20 dark:bg-slate-800/20 bg-slate-100">
                  <Inbox className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200 dark:text-slate-200 text-slate-800">
                    No scans yet
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-500 mt-1 leading-relaxed">
                    Your past scans will appear here.
                  </p>
                </div>
              </div>
            ) : (
              filteredHistory.map((scan) => {
                const isSelected = selectedScan?.id === scan.id;
                const risk = scan.result?.riskScore ?? 0;
                const verdict = scan.result?.verdict || "Under Review";

                let badgeColor = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
                if (verdict === "Scam" || risk >= 70) {
                  badgeColor = "bg-red-500/10 text-red-500 border-red-500/20";
                } else if (verdict === "Suspicious" || risk >= 35) {
                  badgeColor = "bg-amber-500/10 text-amber-500 border-amber-500/20";
                } else if (verdict === "Needs Verification") {
                  badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                }

                return (
                  <div
                    key={scan.id}
                    onClick={() => setSelectedScan(scan)}
                    className={`group relative p-3 rounded-xl border transition-all cursor-pointer text-left select-none ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500/50 shadow-xs"
                        : "bg-[#131d38]/50 dark:bg-[#131d38]/50 bg-slate-50 border-slate-800/80 dark:border-slate-800/80 border-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-200 dark:text-slate-200 text-slate-900 truncate block grow">
                        {scan.filename || "Scanned Document"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScan(scan.id);
                          if (selectedScan?.id === scan.id) setSelectedScan(null);
                          addToast("Scan removed.", "info");
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-opacity p-0.5"
                        title="Delete scan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[10px]">
                      <span className="text-slate-400 font-mono">
                        {new Date(scan.timestamp).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })} &bull; {new Date(scan.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${badgeColor}`}>
                        {verdict} ({risk}%)
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ===================== MAIN CONTENT AREA ===================== */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto w-full">
          {/* If viewing a selected scan result */}
          {selectedScan ? (
            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-slate-800 dark:border-slate-800 border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Diagnostic Scan Result
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                    {selectedScan.filename || "Document Diagnostic Analysis"}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                    {new Date(selectedScan.timestamp).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleStartNewScan}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New scan</span>
                </button>
              </div>

              {/* Result Summary Card */}
              <div className="rounded-2xl border border-slate-800 dark:border-slate-800 border-slate-200 bg-[#0d1629] dark:bg-[#0d1629] bg-white p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800/80 dark:border-slate-800/80 border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      selectedScan.result?.verdict === "Scam" || (selectedScan.result?.riskScore ?? 0) >= 70
                        ? "bg-red-500/10 text-red-500"
                        : selectedScan.result?.verdict === "Suspicious" || (selectedScan.result?.riskScore ?? 0) >= 35
                        ? "bg-amber-500/10 text-amber-500"
                        : selectedScan.result?.verdict === "Needs Verification"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {selectedScan.result?.verdict === "Scam" || (selectedScan.result?.riskScore ?? 0) >= 70 ? (
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                      ) : selectedScan.result?.verdict === "Suspicious" || (selectedScan.result?.riskScore ?? 0) >= 35 ? (
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                      ) : selectedScan.result?.verdict === "Needs Verification" ? (
                        <AlertTriangle className="w-6 h-6 text-blue-400" />
                      ) : (
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Verified Result Verdict
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {selectedScan.result?.verdict === "Scam" || (selectedScan.result?.riskScore ?? 0) >= 70
                          ? "SCAM DETECTED"
                          : selectedScan.result?.verdict === "Suspicious" || (selectedScan.result?.riskScore ?? 0) >= 35
                          ? "SUSPICIOUS DOCUMENT"
                          : selectedScan.result?.verdict === "Needs Verification"
                          ? "NEEDS VERIFICATION"
                          : "SAFE & GENUINE"}
                      </h3>
                    </div>
                  </div>

                  <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    selectedScan.result?.verdict === "Scam" || (selectedScan.result?.riskScore ?? 0) >= 70
                      ? "bg-red-500 text-white"
                      : selectedScan.result?.verdict === "Suspicious" || (selectedScan.result?.riskScore ?? 0) >= 35
                      ? "bg-amber-500 text-slate-950"
                      : selectedScan.result?.verdict === "Needs Verification"
                      ? "bg-blue-600 text-white"
                      : "bg-emerald-500 text-white"
                  }`}>
                    {selectedScan.result?.verdict || "Complete"}
                  </span>
                </div>

                {/* Threat Risk vs Authenticity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-800/80 dark:border-slate-800/80 border-slate-200 bg-[#0b1329]/60 dark:bg-[#0b1329]/60 bg-slate-50 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Threat Risk Score:</span>
                      <span className="font-mono font-bold text-sm text-red-500">
                        {selectedScan.result?.riskScore ?? 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.max(4, selectedScan.result?.riskScore ?? 0)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-800/80 dark:border-slate-800/80 border-slate-200 bg-[#0b1329]/60 dark:bg-[#0b1329]/60 bg-slate-50 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Trust & Authenticity:</span>
                      <span className="font-mono font-bold text-sm text-emerald-500">
                        {Math.max(0, 100 - (selectedScan.result?.riskScore ?? 0))}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.max(4, 100 - (selectedScan.result?.riskScore ?? 0))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Reason / Forensic summary */}
                {selectedScan.result?.primaryReason && (
                  <div className={`p-4 rounded-xl text-xs leading-relaxed border ${
                    (selectedScan.result?.riskScore ?? 0) >= 50
                      ? "bg-red-500/10 border-red-500/20 text-red-400"
                      : (selectedScan.result?.riskScore ?? 0) >= 35
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      : selectedScan.result?.verdict === "Needs Verification"
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  }`}>
                    <span className="font-bold text-sm block mb-1">
                      {(selectedScan.result?.riskScore ?? 0) >= 70
                        ? "Scam Verdict Explanation"
                        : (selectedScan.result?.riskScore ?? 0) >= 35
                        ? "Cautionary Diagnostic Findings"
                        : selectedScan.result?.verdict === "Needs Verification"
                        ? "Verification Advisory"
                        : "Authenticity Verification Summary"}
                    </span>
                    {selectedScan.result.primaryReason}
                  </div>
                )}

                {/* Detected Indicators */}
                {selectedScan.result?.flags?.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Detected Indicators ({selectedScan.result.flags.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedScan.result.flags.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131d38] border border-slate-700/60 text-slate-200 text-xs font-medium"
                        >
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <strong>{f.label}</strong> (+{f.score})
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Zero fraudulent keywords or payment solicitation patterns detected.</span>
                  </div>
                )}

                {/* OCR Text Summary */}
                {selectedScan.text && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Summary of Scanned OCR Content
                    </span>
                    <div className="p-3.5 rounded-xl bg-[#0b1329]/80 border border-slate-800 text-xs font-mono text-slate-300 line-clamp-4 select-text">
                      {selectedScan.text}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/analysis-result", { state: { scan: selectedScan } })}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm cursor-pointer"
                  >
                    <span>View Full Forensic Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleStartNewScan}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Scan Another Document</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ===================== FRESH NEW SCAN FORM ===================== */
            <div className="space-y-6 text-left">
              {/* Header */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  New scan
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Add a screenshot, offer letter, chat text or link. We'll check it in seconds.
                </p>
              </div>

              {/* 4 Mode Tabs Pill Bar */}
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 bg-slate-100 border border-slate-800 dark:border-slate-800 border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("upload");
                    stopCamera();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "upload"
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("camera");
                    startCamera();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "camera"
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Take a picture</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("text");
                    stopCamera();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "text"
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Paste text</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("link");
                    stopCamera();
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "link"
                      ? "bg-blue-600 text-white shadow-xs font-bold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  <span>Paste link</span>
                </button>
              </div>

              {/* Main Card Surface */}
              <div className="rounded-2xl border border-slate-800/80 dark:border-slate-800/80 border-slate-200 bg-[#0d1629] dark:bg-[#0d1629] bg-white p-6 sm:p-8 shadow-sm space-y-6">
                {/* MODE 1: UPLOAD */}
                {activeTab === "upload" && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileInput}
                      accept=".png,.jpg,.jpeg,.webp,.pdf,.docx,.txt"
                      className="hidden"
                    />

                    {filename ? (
                      /* File Loaded Preview Box */
                      <div className="border border-slate-700/80 dark:border-slate-700/80 border-slate-300 rounded-2xl p-6 bg-[#0b1329]/50 dark:bg-[#0b1329]/50 bg-slate-50 flex flex-col items-center justify-center text-center space-y-3">
                        {previewUrl ? (
                          <div className="relative group w-24 h-24 rounded-xl overflow-hidden border border-slate-700 shadow-sm">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <FileText className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs">
                            {filename}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono">{fileSize}</p>
                        </div>

                        {/* OCR Processing Bar */}
                        {isOcrProcessing && (
                          <div className="w-full max-w-xs space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Reading document OCR...</span>
                              <span>{ocrProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-150"
                                style={{ width: `${ocrProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            Change file
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFile(null);
                              setFilename("");
                              setFileSize("");
                              setPreviewUrl(null);
                              setTextInput("");
                            }}
                            className="px-3.5 py-1.5 rounded-xl border border-red-500/30 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop Empty Box */
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-150 ${
                          isDragActive
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-700/60 dark:border-slate-700/60 border-slate-300 hover:border-blue-500/60 bg-[#0b1329]/40 dark:bg-[#0b1329]/40 bg-slate-50/50"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                          <Upload className="w-6 h-6 stroke-[1.8]" />
                        </div>
                        <p className="text-base font-bold text-slate-900 dark:text-white">
                          Drag and drop files here
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          or <span className="text-blue-500 font-semibold hover:underline">browse your device</span>
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-3 font-mono">
                          PNG, JPG, WEBP, PDF, DOCX or TXT · up to 10 MB each
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE 2: CAMERA */}
                {activeTab === "camera" && (
                  <div className="border border-slate-700/60 dark:border-slate-700/60 border-slate-300 rounded-2xl p-6 bg-[#0b1329]/40 space-y-4 text-center">
                    {cameraError ? (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 space-y-2">
                        <AlertTriangle className="w-6 h-6 text-red-400 mx-auto" />
                        <p>{cameraError}</p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                        >
                          Retry Camera Access
                        </button>
                      </div>
                    ) : isCameraActive ? (
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden bg-black max-w-md mx-auto aspect-video flex items-center justify-center border border-slate-700 shadow-md">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        </div>
                        <div className="flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Capture Photo</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-400">
                          {previewUrl ? "Photo captured." : "Click below to open camera."}
                        </p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 mx-auto cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Open Camera Viewport</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* MODE 3: PASTE TEXT */}
                {activeTab === "text" && (
                  <div className="space-y-3">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      rows={6}
                      placeholder="Paste suspicious recruitment message, WhatsApp chat, job offer letter text, or payment demand here..."
                      className="w-full p-4 rounded-xl bg-[#0b1329]/60 dark:bg-[#0b1329]/60 bg-slate-50 border border-slate-700/60 dark:border-slate-700/60 border-slate-300 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                    />

                    {/* Quick Mock Sample Templates */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Load Quick Test Sample:
                      </span>
                      {MOCK_SCAM_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setTextInput(tmpl.text);
                            setFilename(tmpl.filename);
                            addToast(`Loaded ${tmpl.name}`, "info");
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
                        >
                          {tmpl.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MODE 4: PASTE LINK */}
                {activeTab === "link" && (
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Globe className="w-4 h-4" />
                      </span>
                      <input
                        type="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        placeholder="https://suspicious-recruitment-site.com/apply or https://t.me/task_group"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0b1329]/60 dark:bg-[#0b1329]/60 bg-slate-50 border border-slate-700/60 dark:border-slate-700/60 border-slate-300 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      ScamShield cross-checks the URL against registered corporate domains, fraudulent phishing landing pages, and Telegram bot task networks.
                    </p>
                  </div>
                )}

                {/* Collapsible "Optional details (helps us check better)" */}
                <div className="border border-slate-800/80 dark:border-slate-800/80 border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setIsOptionalOpen(!isOptionalOpen)}
                    className="w-full px-4 py-3 bg-[#0b1329]/40 dark:bg-[#0b1329]/40 bg-slate-50 flex items-center justify-between text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <span>Optional details (helps us check better)</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        isOptionalOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOptionalOpen && (
                    <div className="p-4 bg-[#0d1629] dark:bg-[#0d1629] bg-white border-t border-slate-800/80 space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Company name (optional)
                          </label>
                          <input
                            type="text"
                            value={optionalCompany}
                            onChange={(e) => setOptionalCompany(e.target.value)}
                            placeholder="e.g. Amazon, TCS, Infosys"
                            className="w-full px-3 py-2 rounded-lg bg-[#0b1329]/60 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Claimed Salary / Fee Demand
                          </label>
                          <input
                            type="text"
                            value={optionalSalary}
                            onChange={(e) => setOptionalSalary(e.target.value)}
                            placeholder="e.g. ₹5,000 daily or ₹1,200 fee"
                            className="w-full px-3 py-2 rounded-lg bg-[#0b1329]/60 border border-slate-700/60 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Contact Platform
                          </label>
                          <select
                            value={optionalPlatform}
                            onChange={(e) => setOptionalPlatform(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#0b1329]/60 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                          >
                            <option value="Telegram">Telegram Channel / Bot</option>
                            <option value="WhatsApp">WhatsApp Message</option>
                            <option value="LinkedIn">LinkedIn InMail</option>
                            <option value="Email">Email / Webmail</option>
                            <option value="JobPortal">Naukri / Indeed / Job Portal</option>
                            <option value="SMS">SMS / Text Message</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Privacy note + Analyse Button */}
                <div className="flex items-center justify-between border-t border-slate-800/80 dark:border-slate-800/80 border-slate-200 pt-5 flex-wrap gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Your files are private and only used to check for scams.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyse}
                    disabled={isAnalyzing || isOcrProcessing}
                    className="bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:opacity-50 text-white font-bold px-7 py-2.5 rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all text-xs"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <ScanIcon className="w-4 h-4" />
                        <span>Analyse</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
