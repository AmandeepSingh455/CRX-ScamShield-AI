import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Navbar from "../components/Navbar";
import RiskChart from "../components/RiskChart";
import CompanyRegistryModal from "../components/CompanyRegistryModal";
import { analyzeScam } from "../utils/scamAnalyzer";
import { createWorker } from "tesseract.js";
import {
  Upload,
  Camera,
  Trash2,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Play,
  X,
  Sparkles,
  RefreshCw,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_SCAM_TEMPLATES = [
  {
    name: "YouTube / Telegram Task Scam",
    filename: "Telegram_Task_Trap.txt",
    text: "Hello! You have been selected for online work from home. Earn ₹3000 to ₹5000 daily by liking YouTube videos and subscribing to Telegram channels. 100% guaranteed job. Direct daily payout to UPI or GPay. To activate your merchant task account, please deposit ₹500 security deposit. Pay now immediately as limited slots remain.",
  },
  {
    name: "Digital Arrest Cyber Extortion Scam",
    filename: "Mumbai_Police_Customs_Notice.txt",
    text: "URGENT LEGAL NOTICE: This is officer Sharma from Mumbai Police Crime Branch and Narcotics Department. A parcel seized by customs at airport contains 5 passports and illegal drugs registered under your Aadhaar. You are under digital arrest. Connect to Skype video call immediately for clearance. Transfer ₹45,000 to government clearance account to avoid immediate physical arrest warrant.",
  },
  {
    name: "Fake Tata Offer (Fake CIN + Gmail)",
    filename: "Tata_Motors_Appointment_Letter.pdf",
    text: "OFFER LETTER - TATA MOTORS LIMITED\nCorporate Identity No: CIN-FAKE99999\nContact: tatamotors.recruitment@gmail.com\n\nDear Applicant, You have been directly selected for the position of Senior Executive. Salary: ₹12,00,000 per annum. Direct offer letter without interview. You must pay ₹2,500 onboarding gate pass and laptop security fee to our account via PhonePe / UPI today to confirm placement.",
  },
  {
    name: "Genuine TCS Offer (Verified MCA CIN)",
    filename: "TCS_Genuine_Appointment_Letter.pdf",
    text: "TATA CONSULTANCY SERVICES LIMITED\nCorporate Identification Number (CIN): L22210MH1995PLC084781\nWebsite: https://www.tcs.com | careers@tcs.com\nTCS House, Raveline Street, Fort, Mumbai - 400001, Maharashtra, India\n\nDear Candidate, We take pleasure in offering you the role of Systems Engineer with Tata Consultancy Services Limited. This offer is contingent upon successful verification of your educational credentials and background check. Please note: TCS does not charge any registration, recruitment, or laptop security fees from candidates at any stage of the recruitment process.",
  },
  {
    name: "Work From Home Data Entry Scam",
    filename: "WFH_DataEntry_Offer.txt",
    text: "CONGRATULATIONS! You have been selected for our Work From Home Data Entry position. The salary is $45 per hour. To proceed, please pay a registration fee of $30 to cover the software licensing fee. We guarantee 100% placement and limited seats are available. Pay now immediately to secure your seat.",
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

export default function Dashboard() {
  const {
    user,
    history,
    addScan,
    setActiveScan,
    shouldOpenFilePicker,
    setShouldOpenFilePicker,
    isLeftDrawerOpen,
    setIsLeftDrawerOpen,
    setIsRightDrawerOpen,
    addToast,
    t,
  } = useApp();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [filename, setFilename] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const unsavedPreviewRef = useRef(null);

  useEffect(() => {
    return () => {
      if (
        unsavedPreviewRef.current &&
        unsavedPreviewRef.current.startsWith("blob:")
      ) {
        try {
          URL.revokeObjectURL(unsavedPreviewRef.current);
        } catch (e) {}
      }
    };
  }, []);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (shouldOpenFilePicker) {
      setShouldOpenFilePicker(false);
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  }, [shouldOpenFilePicker, setShouldOpenFilePicker]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }
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

  const totalScans = history.length;
  const flaggedScams = history.filter(
    (scan) => scan.result.riskScore >= 50,
  ).length;
  const suspiciousScams = history.filter(
    (scan) => scan.result.riskScore >= 20 && scan.result.riskScore < 50,
  ).length;
  const avgRisk =
    totalScans > 0
      ? Math.round(
          history.reduce((sum, item) => sum + item.result.riskScore, 0) /
            totalScans,
        )
      : 0;

  const runOcr = async (imageSource) => {
    setIsOcrProcessing(true);
    setOcrProgress(0);
    setOcrError("");

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
      console.error("OCR failed:", err);
      setOcrError(
        "Could not read text from this image. Try a clearer photo or paste the text manually.",
      );
      addToast("OCR Text extraction failed.", "error");
      return "";
    } finally {
      setIsOcrProcessing(false);
      setOcrProgress(0);
    }
  };

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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    if (
      unsavedPreviewRef.current &&
      unsavedPreviewRef.current.startsWith("blob:")
    ) {
      try {
        URL.revokeObjectURL(unsavedPreviewRef.current);
      } catch (err) {}
    }
    setCurrentPreviewUrl(null);
    unsavedPreviewRef.current = null;

    if (
      file.type.match("image.*") ||
      file.name.match(/\.(png|jpe?g|gif|webp)$/i)
    ) {
      try {
        const base64 = await convertToBase64(file);
        setCurrentPreviewUrl(base64);
        unsavedPreviewRef.current = base64;
      } catch (err) {
        console.error("Failed to convert image to Base64:", err);
      }
    }

    setIsUploading(true);
    setUploadProgress(0);
    setFilename(file.name);

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
    setFileSize(sizeStr);
    setOcrError("");

    let currentProgress = 0;
    const interval = setInterval(async () => {
      currentProgress += Math.floor(Math.random() * 15) + 6;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setUploadProgress(100);
        clearInterval(interval);

        // Upload complete state
        setIsUploading(false);
        addToast("File uploaded successfully.", "success");

        if (
          file.type.match("image.*") ||
          file.name.match(/\.(png|jpe?g|gif|webp)$/i)
        ) {
          setText("");
          const extractedText = await runOcr(file);
          setText(
            extractedText ||
              "No readable text was found in this image. Try a clearer photo, or paste the text manually below.",
          );
        } else if (file.name.endsWith(".pdf")) {
          setText(
            `[PDF SCAN COMPLETE - ${file.name}]:\n` +
              `Simulated threat signature evaluation: pending detailed parser scan.\n\n` +
              `Please verify the text is populated correctly or paste it manually for diagnostic override.`,
          );
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            setText(e.target.result || "");
          };
          reader.readAsText(file);
        }
      } else {
        setUploadProgress(currentProgress);
      }
    }, 120);
  };

  const loadTemplate = (template) => {
    setFilename(template.filename);
    setFileSize("1.2 KB");
    setText(template.text);
    addToast(`Template loaded: ${template.name}`, "info");
  };

  const handleSelectCompany = (company) => {
    const fname = `${company.name.replace(/[^a-zA-Z0-9]/g, "_")}_Offer_Letter.pdf`;
    setFilename(fname);
    setFileSize("3.4 KB");
    setText(
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
    addToast(`Loaded ${company.name} offer with verified CIN: ${company.cin}`, "success");
  };

  // Camera
  const startCamera = async () => {
    setCameraError("");
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setCameraError(
        "Webcam access was denied or is unavailable. Please check permission settings.",
      );
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );

    stopCamera();

    if (
      unsavedPreviewRef.current &&
      unsavedPreviewRef.current.startsWith("blob:")
    ) {
      try {
        URL.revokeObjectURL(unsavedPreviewRef.current);
      } catch (err) {}
    }
    unsavedPreviewRef.current = null;

    const capturedFilename = `camera_scan_${Date.now().toString().slice(-4)}.png`;
    setFilename(capturedFilename);
    setFileSize("450 KB");
    setText("");

    try {
      const base64 = await convertToBase64(blob);
      setCurrentPreviewUrl(base64);
      unsavedPreviewRef.current = base64;
    } catch (err) {
      console.error("Failed to convert captured photo to Base64:", err);
    }

    const extractedText = await runOcr(blob);

    setText(
      extractedText ||
        "No readable text was found. Try holding the camera steadier and closer to the text.",
    );

    setIsCapturing(false);
    addToast("Camera capture processed.", "success");
  };

  const handleAnalyze = () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const result = analyzeScam(text, filename);
      const newScan = addScan(
        filename || "Direct Text Input",
        text,
        result,
        currentPreviewUrl,
      );
      setIsAnalyzing(false);
      setActiveScan(newScan);
      setCurrentPreviewUrl(null);
      unsavedPreviewRef.current = null;

      // Trigger notifications depending on diagnostic danger score
      if (result.riskScore >= 50) {
        addToast("Warning: Suspicious document detected!", "warning");
      } else if (result.riskScore >= 20) {
        addToast("Info: Minor threat anomalies identified.", "warning");
      } else {
        addToast("Success: Document evaluated secure.", "success");
      }

      navigate("/analysis-result");
    }, 1200);
  };

  const handleClear = () => {
    setText("");
    setFilename("");
    setFileSize("");
    setOcrError("");
    if (
      unsavedPreviewRef.current &&
      unsavedPreviewRef.current.startsWith("blob:")
    ) {
      try {
        URL.revokeObjectURL(unsavedPreviewRef.current);
      } catch (err) {}
    }
    setCurrentPreviewUrl(null);
    unsavedPreviewRef.current = null;
    addToast("Workspace cleared.", "info");
  };

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-text-primary transition-all duration-300 pt-18">
      <Navbar />
      <canvas ref={canvasRef} className="hidden" />
      <div className="grow w-full flex flex-col min-w-0 overflow-hidden">
        <motion.main
          animate={{
            marginLeft: isDesktop && isLeftDrawerOpen ? "320px" : "0px",
            width:
              isDesktop && isLeftDrawerOpen ? "calc(100% - 320px)" : "100%",
          }}
          transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
          className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-x-hidden min-w-0"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-color pb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                Security Workspace
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Verify job offers, contracts, and recruiter emails with
                AI-powered scam detection
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-accent-color/20 bg-accent-color/5 dark:bg-accent-color/10 text-accent-color self-start md:self-auto shadow-sm">
              <span className="w-2 h-2 rounded-full bg-accent-color animate-pulse" />
              Scanner Engine v4.2 Active
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat 1: Total Scans */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-5 rounded-2xl border border-border-color bg-card-bg shadow-sm card-premium relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-color/2 rounded-full blur-xl" />
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                Total Scans
              </span>
              <span className="text-3xl font-extrabold block mt-2 font-mono text-text-primary">
                {totalScans}
              </span>
              <span className="text-[9px] text-text-secondary mt-1 block">
                Scans completed
              </span>
            </motion.div>
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-5 rounded-2xl border border-danger-color/20 bg-card-bg dark:bg-danger-color/5 shadow-sm card-premium relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 text-danger-color/30">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-danger-color uppercase tracking-wider block">
                Scams Detected
              </span>
              <span className="text-3xl font-extrabold block mt-2 font-mono text-danger-color">
                {flaggedScams}
              </span>
              <span className="text-[9px] text-danger-color/80 mt-1 block">
                Threat index score &ge; 50%
              </span>
            </motion.div>
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-5 rounded-2xl border border-warning-color/20 bg-card-bg dark:bg-warning-color/5 shadow-sm card-premium relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 text-warning-color/30">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-warning-color uppercase tracking-wider block">
                Suspicious Logs
              </span>
              <span className="text-3xl font-extrabold block mt-2 font-mono text-warning-color">
                {suspiciousScams}
              </span>
              <span className="text-[9px] text-warning-color/80 mt-1 block">
                Threat index 20-49%
              </span>
            </motion.div>
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="p-5 rounded-2xl border border-accent-color/20 bg-card-bg dark:bg-accent-color/5 shadow-sm card-premium relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 text-accent-color/30">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-accent-color uppercase tracking-wider block">
                Avg Threat Index
              </span>
              <span className="text-3xl font-extrabold block mt-2 font-mono text-accent-color">
                {avgRisk}%
              </span>
              <span className="text-[9px] text-accent-color/80 mt-1 block">
                System average risk index
              </span>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-text-secondary dark:text-accent-color uppercase tracking-wider">
                  Document Workspace
                </h3>
              </div>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={(e) => {
                  if (isOcrProcessing || isUploading || filename) return;
                  fileInputRef.current?.click();
                }}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-sm relative overflow-hidden min-h-60 ${
                  isOcrProcessing || isUploading
                    ? "cursor-default"
                    : "cursor-pointer"
                } ${
                  isDragActive
                    ? "border-accent-color bg-accent-color/5 scale-[0.99]"
                    : filename && !isOcrProcessing && !isUploading
                      ? "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/5"
                      : "border-border-color hover:border-accent-color bg-card-bg/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInput}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />

                <AnimatePresence mode="wait">
                  {isUploading ? (
                    // --- State 1: Uploading Progress bar ---
                    <motion.div
                      key="uploading-progress"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center w-full max-w-xs"
                    >
                      <div className="w-12 h-12 rounded-xl bg-app-bg border border-border-color flex items-center justify-center text-accent-color mb-3">
                        <RefreshCw className="w-5 h-5 animate-spin text-accent-color" />
                      </div>
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                        Uploading... {uploadProgress}%
                      </span>
                      <span className="text-[10px] text-text-secondary mt-1.5 max-w-55 truncate block font-mono">
                        {filename}
                      </span>

                      <div className="mt-4 w-full">
                        <div className="w-full h-1.5 rounded-full bg-border-color overflow-hidden">
                          <div
                            className="h-full bg-accent-color transition-all duration-100"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : isOcrProcessing ? (
                    // --- State 2: OCR Processing ---
                    <motion.div
                      key="ocr-processing"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-app-bg border border-border-color flex items-center justify-center text-accent-color mb-3">
                        <RefreshCw className="w-5 h-5 animate-spin text-accent-color" />
                      </div>
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                        Reading Your Document...
                      </span>
                      <span className="text-[11px] text-text-secondary mt-1.5">
                        Extracting content from file layout.
                      </span>

                      <div className="mt-4 w-full max-w-xs">
                        <div className="flex justify-between text-[10px] text-text-secondary mb-1">
                          <span>OCR Processing</span>
                          <span>{ocrProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-border-color overflow-hidden">
                          <div
                            className="h-full bg-accent-color transition-all duration-200"
                            style={{ width: `${ocrProgress}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : filename ? (
                    // --- State 3: Upload Success state with green check ---
                    <motion.div
                      key="upload-success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-bounce">
                        <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                      </div>
                      <span className="text-xs font-bold text-text-primary">
                        Document Uploaded Successfully
                      </span>
                      <span className="text-[11px] text-emerald-500 font-mono mt-1.5 max-w-xs truncate font-bold bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-lg">
                        {filename} {fileSize ? `(${fileSize})` : ""}
                      </span>
                      <span className="text-[10px] text-text-secondary mt-2">
                        Review/edit extracted details in workspace below.
                      </span>

                      <div
                        className="flex gap-2.5 mt-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-color text-xs font-semibold text-text-primary bg-card-bg hover:bg-app-bg transition-colors shadow-sm cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-accent-color" />
                          Change File
                        </button>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-color text-xs font-semibold text-text-primary bg-card-bg hover:bg-app-bg transition-colors shadow-sm cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-accent-color" />
                          Use Camera
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    // --- State 4: Empty State ---
                    <motion.div
                      key="empty-upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-12 h-12 rounded-xl bg-app-bg border border-border-color flex items-center justify-center text-text-secondary mb-3 hover:scale-105 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>

                      <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                        Drag & Drop Documents Here
                      </span>
                      <span className="text-[11px] text-text-secondary mt-1.5">
                        PDF, PNG, JPG, or JPEG (Max 5MB)
                      </span>

                      <div
                        className="flex gap-2.5 mt-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-color text-xs font-semibold text-text-primary bg-card-bg hover:bg-app-bg transition-colors shadow-sm cursor-pointer"
                        >
                          <Camera className="w-4 h-4 text-accent-color" />
                          Scan with Camera
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {ocrError && !isOcrProcessing && (
                  <p className="mt-3 text-[11px] text-danger-color font-semibold max-w-xs">
                    {ocrError}
                  </p>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <label
                    htmlFor="scan-text"
                    className="font-bold text-text-secondary uppercase tracking-wider"
                  >
                    Extracted Text Content
                  </label>
                  <span className="text-text-secondary font-semibold font-mono">
                    {text.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  id="scan-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste details of the job description, interview invite, or click templates to test..."
                  rows={8}
                  className="w-full bg-card-bg/40 border border-border-color text-text-primary focus:border-accent-color focus:ring-2 focus:ring-accent-color/15 focus:outline-none rounded-2xl p-4 text-xs font-medium leading-relaxed resize-y font-sans transition-all shadow-sm"
                />
                <div className="flex justify-end gap-3 pt-1">
                  {text && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl border border-danger-color/30 hover:bg-danger-color/10 text-xs font-bold text-danger-color transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={
                      !text.trim() ||
                      isAnalyzing ||
                      isOcrProcessing ||
                      isUploading
                    }
                    onClick={handleAnalyze}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-btn-bg text-btn-text hover:opacity-90 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md active:scale-[0.98] btn-premium"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-btn-text" />
                    ) : (
                      <>
                        <span>Scan Document</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {/* 1,000 Registered Companies Directory Button */}
              <button
                type="button"
                onClick={() => setIsCompanyModalOpen(true)}
                className="w-full p-3.5 rounded-2xl border border-accent-color/30 bg-accent-color/10 hover:bg-accent-color/15 text-accent-color transition-all flex items-center justify-between gap-3 shadow-sm cursor-pointer group card-premium"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-accent-color/20 text-accent-color flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold block text-text-primary group-hover:text-accent-color transition-colors">
                      {t('companyRegistryBtn')}
                    </span>
                    <span className="text-[10px] text-text-secondary block">
                      Verify MCA CIN numbers & official domains
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-accent-color shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="rounded-2xl border border-border-color bg-card-bg shadow-sm card-premium p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-warning-color/2 rounded-full blur-xl" />
                <h3 className="text-xs font-bold text-text-primary dark:text-accent-color uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-warning-color" />
                  {t('sampleTemplates')}
                </h3>
                <div className="flex flex-col gap-2.5">
                  {MOCK_SCAM_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => loadTemplate(tmpl)}
                      className="w-full text-left p-3 rounded-xl border border-border-color bg-app-bg hover:border-accent-color/50 text-xs transition-all flex flex-col gap-1.5 cursor-pointer shadow-sm text-text-primary"
                    >
                      <span className="font-bold text-text-primary">
                        {tmpl.name}
                      </span>
                      <span className="text-[10px] text-text-secondary line-clamp-1">
                        {tmpl.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div
                id="threat-trend-chart"
                className="rounded-2xl border border-border-color bg-card-bg shadow-sm card-premium p-5 relative overflow-hidden"
              >
                <RiskChart />
              </div>
            </div>
          </div>
        </motion.main>
      </div>
      <AnimatePresence>
        {cameraOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-2xl border border-border-color bg-card-bg overflow-hidden shadow-2xl"
            >
              <div className="px-4 py-3 border-b border-border-color bg-app-bg flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-primary dark:text-accent-color flex items-center gap-2">
                  <Camera className="w-4 h-4 text-accent-color" />
                  Live Camera Capture
                </span>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-1 rounded-md border border-border-color hover:bg-app-bg text-text-secondary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
                {cameraError ? (
                  <div className="p-6 text-center space-y-3">
                    <ShieldAlert className="w-8 h-8 text-danger-color mx-auto" />
                    <p className="text-xs text-danger-color font-semibold">
                      {cameraError}
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 bg-accent-color text-app-bg rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover camera-view"
                    />

                    {isCapturing && (
                      <div className="absolute inset-0 border-y-2 border-accent-color/80 bg-accent-color/5 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-accent-color shadow-[0_0_12px_#10b981] absolute animate-[bounce_1.5s_infinite]" />
                        <span className="text-xs font-bold text-accent-color uppercase tracking-widest font-mono drop-shadow-md bg-black/80 px-3 py-1.5 rounded-md">
                          {isOcrProcessing
                            ? `Extracting Text (OCR)... ${ocrProgress}%`
                            : "Capturing Frame..."}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="p-4 border-t border-border-color bg-app-bg flex justify-end gap-3">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 rounded-xl border border-border-color hover:bg-border-color text-xs font-bold text-text-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!!cameraError || isCapturing}
                  onClick={capturePhoto}
                  className="px-5 py-2.5 rounded-xl bg-btn-bg text-btn-text hover:opacity-90 font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 cursor-pointer btn-premium"
                >
                  <Play className="w-4 h-4" />
                  Capture & Parse
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CompanyRegistryModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSelectCompany={handleSelectCompany}
      />
    </div>
  );
}
