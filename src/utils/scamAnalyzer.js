/**
 * Advanced Multi-Stage Scam Detection & Corporate Forensics Engine
 * CRX ScamShield AI
 */
import { verifyDocumentCompanyAndCIN } from "./companyVerifier.js";
import { analyzeWithAi } from "../services/aiScannerService.js";

export const FREE_MAIL_DOMAINS = [
  "@gmail.com",
  "@yahoo.com",
  "@outlook.com",
  "@hotmail.com",
  "@proton.me",
  "@protonmail.com",
  "@live.com",
  "@icloud.com",
  "@rediffmail.com",
  "@yopmail.com",
];

export const TRUSTED_PLATFORMS = [
  "linkedin.com",
  "naukri.com",
  "internshala.com",
  "indeed.com",
  "glassdoor.com",
  "wellfound.com",
  "unstop.com",
  "hirist.com",
  "instahyre.com",
];

/**
 * Checks whether a matched fee phrase appears inside a legitimate anti-scam warning
 * (e.g., "TCS does not charge any registration fee" or "We never ask candidates for security deposits").
 */
function isDisclaimerContext(text = "", phrase = "") {
  if (!text || !phrase) return false;
  const lowerText = text.toLowerCase();
  const lowerPhrase = phrase.toLowerCase();
  let index = lowerText.indexOf(lowerPhrase);

  const disclaimerPatterns = [
    /does\s+not\s+(?:charge|ask|require|demand|solicit)/i,
    /never\s+(?:charge|solicit|ask|demand|require|collect)/i,
    /do\s+not\s+(?:pay|transfer|send|deposit)/i,
    /beware\s+of\s+(?:fraud|fake|scam|unauthorized)/i,
    /caution\s*:/i,
    /warning\s*:/i,
    /fraud\s+alert/i,
    /anti-fraud/i,
    /disclaimer\s*:/i,
    /free\s+of\s+(?:cost|charge)/i,
    /at\s+no\s+(?:stage|cost)/i,
    /neither\s+(?:charge|ask)/i,
  ];

  while (index !== -1) {
    const windowStart = Math.max(0, index - 120);
    const windowEnd = Math.min(lowerText.length, index + lowerPhrase.length + 100);
    const snippet = lowerText.slice(windowStart, windowEnd);

    const isDisclaimer = disclaimerPatterns.some((pattern) => pattern.test(snippet));
    if (isDisclaimer) {
      return true;
    }
    index = lowerText.indexOf(lowerPhrase, index + 1);
  }

  return false;
}
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const UPI_REGEX = /[a-zA-Z0-9._-]+@(okhdfcbank|okaxis|oksbi|okicici|paytm|ybl|ibl|axl|upi|apl|gpay)/gi;
const URL_REGEX = /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*/gi;
const PHONE_REGEX = /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/g;

/**
 * 1. CRITICAL HARD-SCAM TRIGGERS (Zero-Tolerance)
 * If any of these are present, the document is automatically flagged as SCAM (Score >= 85).
 * All trust bonuses are strictly revoked.
 */
export const CRITICAL_SCAM_PATTERNS = [
  {
    id: "recruitment_payment_demand",
    phrases: [
      "registration fee",
      "entry fee",
      "processing fee",
      "onboarding fee",
      "training fee",
      "interview fee",
      "seat booking charge",
      "placement fee",
      "laptop security",
      "device deposit",
      "laptop fee",
      "hardware security fee",
      "tools fee",
      "software licensing fee",
      "gate pass fee",
      "courier delivery fee",
      "courier fee",
      "uniform fee",
      "document verification fee",
      "background check fee",
      "refundable security deposit",
      "security deposit to activate",
      "refundable deposit of",
      "pay deposit",
      "deposit fee",
    ],
    score: 85,
    label: "Upfront Recruitment Fee / Security Deposit Demand",
    description: "CRITICAL: Legitimate employers never charge candidates for interviews, onboarding, laptops, or training. Demanding upfront fees is a primary marker of recruitment fraud.",
  },
  {
    id: "digital_arrest_extortion",
    phrases: [
      "digital arrest",
      "customs seized",
      "narcotics control bureau",
      "parcel contains illegal drugs",
      "parcel contains 5 passports",
      "under digital arrest",
      "skype video call for clearance",
      "government clearance account",
      "clearance verification bond",
      "avoid immediate physical arrest",
      "mumbai police crime branch notice",
      "delhi police crime branch notice",
    ],
    score: 95,
    label: "Digital Arrest / Law Enforcement Extortion Fraud",
    description: "EMERGENCY: Law enforcement never places citizens under 'digital arrest' nor do they demand money transfers to clearance accounts over Skype or WhatsApp. Call 1930 immediately.",
  },
  {
    id: "task_investment_fraud",
    phrases: [
      "like youtube videos",
      "subscribe youtube channel",
      "subscribe to telegram channels",
      "hotel rating task",
      "google review task",
      "earn 3000 daily",
      "earn 5000 daily",
      "earn 3000 to 5000",
      "prepaid task",
      "merchant order task",
      "vip high yield task",
      "merchant task account",
      "deposit 500 security deposit",
      "deposit 3000 security",
      "daily payout to upi or gpay",
    ],
    score: 85,
    label: "Part-Time Task & Review Scam (Prepaid Task Trap)",
    description: "High daily earnings for liking videos or writing reviews are used to lure victims into paying large prepaid 'task activation deposits' that cannot be recovered.",
  },
];

/**
 * 2. SECONDARY SUSPICIOUS PATTERNS
 */
export const SECONDARY_SCAM_PATTERNS = [
  {
    id: "direct_selection_no_interview",
    phrases: [
      "direct selection without interview",
      "direct offer letter without interview",
      "selection was made based on your resume",
      "no interview needed",
      "100% guaranteed job",
      "spot offer letter",
      "confirmed placement without test",
      "direct selection",
    ],
    score: 35,
    label: "Guaranteed Offer Issued Without Interview Round",
    description: "Genuine corporations require rigorous technical, HR, and background evaluation before extending an employment contract.",
  },
  {
    id: "payment_method_mention",
    phrases: [
      "pay via phonepe",
      "pay via gpay",
      "pay via paytm",
      "transfer to upi",
      "scan qr code to pay",
      "transfer to our account via",
      "send money immediately",
      "wire transfer required",
      "usdt deposit",
      "crypto deposit",
    ],
    score: 40,
    label: "Informal Payment Rails (UPI / QR / Crypto) in Corporate Context",
    description: "Corporate recruitment teams do not collect candidate payments over PhonePe, Google Pay, or QR codes.",
  },
  {
    id: "urgency_pressure",
    phrases: [
      "pay now immediately",
      "limited slots remain",
      "limited seats available",
      "pay today to confirm placement",
      "offer expires in 2 hours",
      "urgent response required",
      "immediate clearance required",
      "last chance to claim",
    ],
    score: 20,
    label: "Artificial Scarcity & High-Pressure Coercion",
    description: "Scammers create artificial deadlines and urgency to panic candidates into paying before conducting due diligence.",
  },
  {
    id: "unrealistic_compensation",
    phrases: [
      "$45 per hour",
      "$50 per hour",
      "earn $40 to $60",
      "₹12,00,000 per annum without interview",
      "daily salary package",
      "100% placement and limited seats",
    ],
    score: 25,
    label: "Unrealistic Compensation for Entry-Level or Unscreened Work",
    description: "Offering unusually high hourly or annual packages for basic copy-paste or unverified roles is standard advance-fee bait.",
  },
];

/**
 * Primary multi-stage forensic analysis
 */
export function analyzeScam(text = "", filename = "") {
  const cleanText = text || "";
  const normalizedText = (cleanText + " " + (filename || "")).toLowerCase();

  if (!cleanText.trim() && !filename.trim()) {
    return {
      riskScore: 0,
      confidenceScore: 0,
      verdict: "Genuine",
      status: "safe",
      primaryReason: "No content provided to analyze.",
      flags: [],
      matchedPhrases: [],
      highlightedText: "No text content scanned.",
      companyVerification: null,
      extractedEntities: { emails: [], upiIds: [], urls: [], phones: [] },
      recommendedActions: ["Upload an employment offer letter, chat screenshot, or message text."],
    };
  }

  // --- Stage 1: Entity Extraction ---
  const extractedEmails = [...new Set(cleanText.match(EMAIL_REGEX) || [])];
  const extractedUpiIds = [...new Set(cleanText.match(UPI_REGEX) || [])];
  const extractedUrls = [...new Set(cleanText.match(URL_REGEX) || [])];
  const extractedPhones = [...new Set(cleanText.match(PHONE_REGEX) || [])];

  let totalScore = 0;
  const flags = [];
  const matchedPhrases = [];
  const highlightMap = new Map();
  let hasCriticalScam = false;

  const addHighlight = (phrase, type) => {
    if (!phrase) return;
    if (cleanText.toLowerCase().includes(phrase.toLowerCase())) {
      highlightMap.set(phrase, type);
    }
  };

  // --- Stage 2: Critical Zero-Tolerance Scams ---
  CRITICAL_SCAM_PATTERNS.forEach((pattern) => {
    const found = pattern.phrases.find((phrase) => {
      if (!normalizedText.includes(phrase)) return false;
      // If it's a payment demand phrase, ensure it is NOT a corporate anti-scam disclaimer
      if (pattern.id === "recruitment_payment_demand") {
        if (isDisclaimerContext(cleanText, phrase)) {
          return false;
        }
      }
      return true;
    });

    if (found) {
      hasCriticalScam = true;
      totalScore += pattern.score;
      flags.push({
        id: pattern.id,
        type: "risk",
        severity: "CRITICAL",
        label: pattern.label,
        score: pattern.score,
        description: pattern.description,
        matchedPhrase: found,
      });
      matchedPhrases.push(found);
      addHighlight(found, "risk");
    }
  });

  // --- Stage 3: Secondary Forensic Rules ---
  SECONDARY_SCAM_PATTERNS.forEach((pattern) => {
    const found = pattern.phrases.find((phrase) => normalizedText.includes(phrase));
    if (found) {
      totalScore += pattern.score;
      flags.push({
        id: pattern.id,
        type: "risk",
        severity: "HIGH",
        label: pattern.label,
        score: pattern.score,
        description: pattern.description,
        matchedPhrase: found,
      });
      matchedPhrases.push(found);
      addHighlight(found, "risk");
    }
  });

  // --- Stage 4: Extracted Entity Analysis (Free Webmails & UPI) ---
  const hasFreeEmail = extractedEmails.some((email) =>
    FREE_MAIL_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain))
  );

  if (extractedUpiIds.length > 0) {
    totalScore += 35;
    flags.push({
      id: "upi_id_detected",
      type: "risk",
      severity: "CRITICAL",
      label: `Suspicious Personal / Merchant UPI ID: ${extractedUpiIds.join(", ")}`,
      score: 35,
      description: "Document directs payments directly to a UPI Virtual Payment Address instead of official corporate banking accounts.",
      matchedPhrase: extractedUpiIds.join(", "),
    });
    extractedUpiIds.forEach((u) => addHighlight(u, "risk"));
  }

  // --- Stage 5: MCA Corporate & CIN Registry Verification ---
  const companyVerification = verifyDocumentCompanyAndCIN(cleanText);
  let isImpersonation = false;

  if (companyVerification) {
    const { detectedCINs, fakeCinMatch, matchedCompanies, cinMismatch } = companyVerification;

    // 5A. Forged / Invalid CIN
    if (fakeCinMatch) {
      totalScore += 45;
      flags.push({
        id: "forged_mca_cin",
        type: "risk",
        severity: "CRITICAL",
        label: `Forged / Invalid Corporate CIN Cited: "${fakeCinMatch}"`,
        score: 45,
        description: `The document cites an invalid Corporate Identification Number (${fakeCinMatch}) that fails Ministry of Corporate Affairs (MCA) 21-digit verification standards.`,
        matchedPhrase: fakeCinMatch,
      });
      matchedPhrases.push(fakeCinMatch);
      addHighlight(fakeCinMatch, "risk");
    }

    // 5B. CIN - Company Mismatch
    if (cinMismatch) {
      totalScore += 40;
      flags.push({
        id: "cin_company_mismatch",
        type: "risk",
        severity: "HIGH",
        label: "Mismatched Corporate CIN & Company Identity",
        score: 40,
        description: "The cited CIN belongs to a completely different registered corporate entity than the organization claiming to issue this offer.",
        matchedPhrase: detectedCINs.join(", "),
      });
    }

    // 5C. Corporate Impersonation (Major Company + Free Webmail OR Payment Demand)
    if (matchedCompanies.length > 0) {
      const targetComp = matchedCompanies[0];
      const hasPaymentDemand = hasCriticalScam || flags.some((f) => f.id.includes("payment") || f.id.includes("fee"));

      if (hasFreeEmail || hasPaymentDemand) {
        isImpersonation = true;
        totalScore += 45;
        flags.push({
          id: "corporate_impersonation",
          type: "risk",
          severity: "CRITICAL",
          label: `Suspected Impersonation of ${targetComp.name}`,
          score: 45,
          description: `The document falsely references registered enterprise ${targetComp.name}, but routes communication through public webmail (${extractedEmails.join(", ") || "free inbox"}) or demands upfront candidate payments. Legitimate enterprises never charge fees.`,
          matchedPhrase: targetComp.name,
        });
        addHighlight(targetComp.name, "risk");
      }
    }
  }

  // Generic Free Email penalty (when not already covered under impersonation)
  if (hasFreeEmail && !isImpersonation) {
    totalScore += 25;
    flags.push({
      id: "generic_webmail_recruiter",
      type: "risk",
      severity: "HIGH",
      label: "Official Offer Sent from Public Webmail Inbox",
      score: 25,
      description: `Official corporate employment letters originate from verified enterprise domains, not free webmail services (${extractedEmails.join(", ")}).`,
      matchedPhrase: extractedEmails.join(", "),
    });
  }

  // --- Stage 6: Mitigating Adjustments (ONLY ALLOWED IF ZERO CRITICAL SCAMS DETECTED) ---
  if (!hasCriticalScam && !isImpersonation && !flags.some((f) => f.severity === "CRITICAL")) {
    // Official Corporate Domain matching claimed company
    if (companyVerification?.verifiedCompany && extractedEmails.length > 0) {
      const matchingEmail = extractedEmails.find((e) =>
        e.toLowerCase().includes(companyVerification.verifiedCompany.domain.toLowerCase())
      );
      if (matchingEmail) {
        totalScore -= 25;
        flags.push({
          id: "verified_enterprise_email",
          type: "mitigating",
          label: `Authentic Enterprise Mailbox: ${matchingEmail}`,
          score: -25,
          description: `Sender mailbox matches the registered domain (${companyVerification.verifiedCompany.domain}) for ${companyVerification.verifiedCompany.name}.`,
          matchedPhrase: matchingEmail,
        });
        addHighlight(matchingEmail, "mitigating");
      }
    }

    // Genuine MCA record with valid CIN and no red flags
    if (companyVerification?.verifiedCompany && !companyVerification.cinMismatch && totalScore === 0) {
      totalScore -= 20;
      flags.push({
        id: "mca_verified_active_entity",
        type: "mitigating",
        label: `Active MCA Corporate Registry Match: ${companyVerification.verifiedCompany.name}`,
        score: -20,
        description: `Corporate Identification Number matches Ministry of Corporate Affairs registered records for ${companyVerification.verifiedCompany.name}.`,
        matchedPhrase: companyVerification.verifiedCompany.cin,
      });
      addHighlight(companyVerification.verifiedCompany.cin, "mitigating");
    }
  }

  // --- Stage 7: Final Verdict & Score Calculation ---
  let finalRiskScore = Math.max(0, Math.min(100, totalScore));

  // If any critical scam was detected, enforce a floor of 85
  if (hasCriticalScam || isImpersonation || flags.some((f) => f.severity === "CRITICAL")) {
    finalRiskScore = Math.max(85, finalRiskScore);
  }

  let verdict = "Genuine";
  let status = "safe";

  if (finalRiskScore >= 70) {
    verdict = "Scam";
    status = "scam";
  } else if (finalRiskScore >= 35) {
    verdict = "Suspicious";
    status = "suspicious";
  } else {
    verdict = "Genuine";
    status = "safe";
  }

  // Formulate clear, authoritative Primary Reason
  let primaryReason = "Document shows valid corporate credentials and no upfront fee or phishing anomalies.";
  if (verdict === "Scam") {
    const criticalFlag = flags.find((f) => f.severity === "CRITICAL") || flags[0];
    primaryReason = criticalFlag
      ? `High-risk fraud detected: ${criticalFlag.label}.`
      : "High probability scam pattern detected with coercive payment demands.";
  } else if (verdict === "Suspicious") {
    primaryReason = "Several red flags identified (such as direct selection without interview or public email domain). Verify credentials before responding.";
  }

  // Generate actionable recommended actions
  const recommendedActions = [];
  if (verdict === "Scam") {
    recommendedActions.push("DO NOT TRANSFER ANY MONEY via UPI, QR code, or bank transfer.");
    recommendedActions.push("Do not provide copies of PAN, Aadhaar, bank passbook, or OTP.");
    recommendedActions.push("Immediately report this incident to India's 1930 Cyber Helpline or cybercrime.gov.in.");
    recommendedActions.push("Block and report the sender on Telegram / WhatsApp.");
  } else if (verdict === "Suspicious") {
    recommendedActions.push("Verify the recruitment independently via the official company career portal.");
    recommendedActions.push("Never agree to pay for laptops, gate passes, or security deposits.");
    recommendedActions.push("Request an official interview via the company's verified email domain.");
  } else {
    recommendedActions.push("Document appears genuine based on verified MCA records and lack of payment demands.");
    recommendedActions.push("Always cross-check final employment contracts via official company career portal.");
  }

  // Highlight markup generation
  let highlightedText = cleanText;
  if (cleanText && highlightMap.size > 0) {
    const sortedPhrases = [...highlightMap.keys()].sort((a, b) => b.length - a.length);
    const replacementMap = new Map();

    sortedPhrases.forEach((phrase, index) => {
      const token = `__SCAM_TOKEN_${index}__`;
      const escaped = phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");
      const type = highlightMap.get(phrase);
      const css =
        type === "mitigating"
          ? "bg-emerald-500/10 text-emerald-600 font-semibold px-1 rounded border border-emerald-500/20"
          : "bg-red-500/10 text-red-600 font-bold px-1 rounded border border-red-500/20";

      highlightedText = highlightedText.replace(regex, (match) => {
        replacementMap.set(token, `<span class="${css}">${match}</span>`);
        return token;
      });
    });

    replacementMap.forEach((htmlTag, token) => {
      highlightedText = highlightedText.replaceAll(token, htmlTag);
    });
  }

  return {
    riskScore: finalRiskScore,
    confidenceScore: Math.min(99, Math.max(70, 75 + flags.length * 5)),
    verdict,
    status,
    primaryReason,
    flags,
    matchedPhrases: [...new Set(matchedPhrases)],
    highlightedText: highlightedText || "No text content scanned.",
    companyVerification,
    extractedEntities: {
      emails: extractedEmails,
      upiIds: extractedUpiIds,
      urls: extractedUrls,
      phones: extractedPhones,
    },
    recommendedActions,
  };
}

/**
 * High-performance Async Scanner that fuses deterministic MCA/regex analysis with deep AI intelligence.
 */
export async function analyzeScamAsync(text = "", filename = "") {
  // 1. Run local multi-stage analyzer immediately
  const localAnalysis = analyzeScam(text, filename);

  // 2. Concurrently run AI analysis
  try {
    const aiResult = await analyzeWithAi(text, filename);

    if (!aiResult) {
      return localAnalysis;
    }

    // 3. Intelligent Synthesis: Fuse Local + AI Results
    // If either detects a Scam, the overall verdict is Scam
    const isLocalScam = localAnalysis.verdict === "Scam";
    const isAiScam = aiResult.verdict === "Scam";
    const isEitherScam = isLocalScam || isAiScam;

    const finalRisk = isEitherScam
      ? Math.max(85, Math.max(localAnalysis.riskScore, aiResult.riskScore))
      : Math.round((localAnalysis.riskScore + aiResult.riskScore) / 2);

    let finalVerdict = "Genuine";
    if (finalRisk >= 70 || isEitherScam) {
      finalVerdict = "Scam";
    } else if (finalRisk >= 35 || localAnalysis.verdict === "Suspicious" || aiResult.verdict === "Suspicious") {
      finalVerdict = "Suspicious";
    }

    // Combine anomalies and recommendations
    const mergedFlags = [...localAnalysis.flags];
    if (aiResult.detectedAnomalies?.length > 0) {
      aiResult.detectedAnomalies.forEach((anomaly, i) => {
        if (!mergedFlags.some((f) => f.label.toLowerCase().includes(anomaly.toLowerCase()))) {
          mergedFlags.push({
            id: `ai_anomaly_${i}`,
            type: "risk",
            severity: "HIGH",
            label: anomaly,
            score: 25,
            description: "Contextual anomaly identified by AI forensics model.",
            matchedPhrase: anomaly,
          });
        }
      });
    }

    return {
      ...localAnalysis,
      riskScore: finalRisk,
      confidenceScore: Math.max(localAnalysis.confidenceScore, aiResult.confidenceScore),
      verdict: finalVerdict,
      status: finalVerdict === "Scam" ? "scam" : finalVerdict === "Suspicious" ? "suspicious" : "safe",
      primaryReason: aiResult.primaryReason || localAnalysis.primaryReason,
      detailedExplanation: aiResult.detailedExplanation || "",
      aiAssisted: true,
      flags: mergedFlags,
      recommendedActions: aiResult.recommendedActions?.length > 0
        ? aiResult.recommendedActions
        : localAnalysis.recommendedActions,
    };
  } catch (err) {
    console.warn("AI synthesis fallback to local analysis:", err);
    return localAnalysis;
  }
}
