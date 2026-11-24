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
      // English phrasing
      "registration fee",
      "registration fees",
      "registration charge",
      "registration charges",
      "registration amount",
      "entry fee",
      "processing fee",
      "processing fees",
      "processing charge",
      "processing charges",
      "onboarding fee",
      "onboarding charges",
      "training fee",
      "training fees",
      "training charge",
      "training kit fee",
      "training kit charges",
      "interview fee",
      "interview charges",
      "seat booking charge",
      "seat booking fee",
      "placement fee",
      "placement charges",
      "laptop security",
      "device deposit",
      "laptop fee",
      "laptop deposit",
      "hardware security fee",
      "tools fee",
      "software licensing fee",
      "software license fee",
      "gate pass fee",
      "gate pass issuance",
      "gate pass charge",
      "gate pass charges",
      "id card fee",
      "id card charge",
      "id card charges",
      "gate pass fee",
      "gate pass charges",
      "gate pass and id card",
      "gate pass",
      "laptop gate pass",
      "id card fee",
      "id card fees",
      "id card charges",
      "laptop deposit",
      "laptop security deposit",
      "id card issuance",
      "courier delivery fee",
      "courier fee",
      "courier charges",
      "uniform fee",
      "uniform charges",
      "document verification fee",
      "document verification charges",
      "background check fee",
      "refundable security deposit",
      "security deposit to activate",
      "refundable deposit of",
      "refundable deposit",
      "pay deposit",
      "deposit fee",
      "advance payment required",
      "upfront fee",
      "upfront payment",
      "form fee",
      "form fees",
      "form charges",
      "verification fee",
      "verification charges",
      "activation fee",
      "account activation fee",
      "task deposit",

      // Hindi / Hinglish Phrasing
      "registration fees bharein",
      "registration charges jama karein",
      "paise jama karo",
      "paise jama karein",
      "paisa bhejo",
      "paise bhejo",
      "security deposit dena padega",
      "security deposit jama karein",
      "kharcha aayega",
      "kit ke paise",
      "form fees bharein",
      "form fees jama karein",
      "joining charges pay karein",
      "id card ke paise",
      "advance paise dene honge",

      // Punjabi / Roman Punjabi Phrasing
      "naukri confirm vaste paise",
      "naukri confirm karne vaste",
      "naukri confirm vaste",
      "confirm karne vaste",
      "naukri pakki vaste pay karo",
      "advance payment bhejni pavegi",
      "form fees bharna",
      "form fees pay karo",
      "paise pay karo",
      "security deposit karvao",
      "advance payment bhej deo",
      "joining vaste paise deo",
      "direct appointment letter milega",
      "appointment letter milega",
    ],
    score: 85,
    label: "Upfront Recruitment Fee / Security Deposit Demand",
    description: "CRITICAL: Legitimate employers never charge candidates for interviews, onboarding, laptops, ID cards, gate passes, or training. Demanding upfront fees is a primary marker of recruitment fraud.",
  },
  {
    id: "digital_arrest_extortion",
    phrases: [
      // English
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
      "cbi warrant issued",
      "arrest warrant issued",
      "aadhaar card blocked by customs",
      "money laundering clearance bond",

      // Hindi / Hinglish
      "digital arrest kiya gaya hai",
      "police notice aayega",
      "customs me parcel pakda gaya hai",
      "aadhaar card block hoga",
      "arrest warrant jari ho gaya",
      "skype pe video call karein",
    ],
    score: 95,
    label: "Digital Arrest / Law Enforcement Extortion Fraud",
    description: "EMERGENCY: Law enforcement never places citizens under 'digital arrest' nor do they demand money transfers to clearance accounts over Skype, WhatsApp, or phone. Call 1930 immediately.",
  },
  {
    id: "task_investment_fraud",
    phrases: [
      // English
      "like youtube videos",
      "like & earn",
      "subscribe youtube channel",
      "subscribe to telegram channels",
      "hotel rating task",
      "google review task",
      "google maps rating task",
      "earn 3000 daily",
      "earn 5000 daily",
      "earn 2000 to 5000",
      "earn 3000 to 5000",
      "earn 5000 to 10000",
      "prepaid task",
      "prepaid orders",
      "merchant order task",
      "vip high yield task",
      "merchant task account",
      "deposit 500 security deposit",
      "deposit 3000 security",
      "daily payout to upi or gpay",
      "daily task income",
      "crypto task commission",

      // Hindi / Hinglish
      "rozana 2000 se 5000 kamayein",
      "rozana 3000 kamayein",
      "video like karke paise kamayein",
      "task complete karke kamayein",
      "ghar baithe daily kamai",
      "prepaid task me invest karein",

      // Punjabi
      "ghar baithe rozana kamai",
      "video like karke paise",
      "daily task karke paise kamai",
    ],
    score: 85,
    label: "Part-Time Task & Review Scam (Prepaid Task Trap)",
    description: "High daily earnings for liking videos or writing reviews are used to lure victims into paying large prepaid 'task activation deposits' that cannot be recovered.",
  },
];

/**
 * Advanced Dynamic Regex Detectors for Payment Demands & Fraudulent Intents
 * Covers arbitrary currency amounts, spelling variations, and multi-language phrasing.
 */
export const DYNAMIC_PAYMENT_REGEX_PATTERNS = [
  {
    id: "regex_fee_demand",
    regex: /\b(?:registration|processing|interview|training|joining|onboarding|gate\s*pass|courier|delivery|uniform|document|verification|id\s*card|laptop|device|software|license|portal|exam|form|seat|booking|clearance)\s*(?:fees?|charges?|cost|amount|payment|deposit|paisa|rupees?|da\s*kharcha|kharach)\b/i,
    score: 85,
    label: "Upfront Fee or Processing Charge Demanded",
    description: "Demanding payment for registration, training, ID cards, gate passes, or software is a hallmark of employment fraud. Legitimate employers never charge candidates.",
  },
  {
    id: "regex_pay_action_amount",
    regex: /\b(?:pay|transfer|deposit|send|bhejo|jama\s*karo|jama\s*karein|pay\s*karo|pay\s*karein|bhej\s*devo|bharna\s*pavega)\s*(?:an?\s*amount\s*(?:of)?)?\s*(?:₹|rs\.?|inr|\$)?\s*[\d,]{2,8}\b/i,
    score: 85,
    label: "Explicit Financial Transfer / Money Payment Request",
    description: "The document explicitly requests transferring or paying money (e.g. ₹500, 1200 rs). Corporate recruiters never solicit funds from prospective hires.",
  },
  {
    id: "regex_amount_before_action",
    regex: /\b(?:\$|₹|rs\.?|inr)?\s*[\d,]{2,8}\s*(?:rupees?|rs\.?|inr)?\s*(?:pay\s*karo|pay\s*karein|bhejo|jama\s*karo|jama\s*karein|transfer\s*karo|de\s*deo|bhej\s*devo|pay|deposit|transfer|charges?|fees?)\b/i,
    score: 85,
    label: "Monetary Fee Requirement Detected",
    description: "Specific monetary values paired with payment terms indicate an advance-fee solicitation trap.",
  },
  {
    id: "regex_action_vaste_pay",
    regex: /\b(?:confirm|pakki|joining|appointment|selection|naukri|job)\s*(?:karne|karan)?\s*vaste\s*(?:(?:\$|₹|rs\.?|inr)?\s*[\d,]{1,8}|paise|payment|fees?)\s*(?:pay|bhej|jama|de|transfer)?\b/i,
    score: 90,
    label: "Recruitment Confirmation Payment Trap (Confirm Vaste Pay)",
    description: "Demanding money or payments to confirm a job or release an appointment letter is fraudulent.",
  },
  {
    id: "regex_security_deposit",
    regex: /\b(?:refundable|security|activation)\s*(?:deposit|guarantee|amount|fees?|charges?)\b/i,
    score: 85,
    label: "Security Deposit / Activation Fee Demanded",
    description: "Scammers frequently promise 'refundable' security deposits to lower candidate defenses. These funds are never returned.",
  },
  {
    id: "regex_hindi_payment_demand",
    regex: /\b(?:paise?|rupaye?|rakam|paisa)\s*(?:bhejo|jama\s*karo|jama\s*karein|transfer\s*karo|pay\s*karein|dena\s*hoga|bharein|deni\s*padegi)\b/i,
    score: 85,
    label: "Hindi Recruitment Payment Demand (पैसे जमा करें / भेजें)",
    description: "Direct demand for money or fees expressed in Hindi/Hinglish. Legitimate companies never demand candidate payments.",
  },
  {
    id: "regex_punjabi_payment_demand",
    regex: /\b(?:paise?|payment|advance\s*paisa)\s*(?:pay\s*karo|bhej\s*devo|de\s*deo|bhejni\s*pavegi|bharna\s*pavega|jama\s*karvao)\b/i,
    score: 85,
    label: "Punjabi Recruitment Payment Demand (ਪੈਸੇ ਜਮ੍ਹਾ ਕਰਵਾਓ / ਭੇਜੋ)",
    description: "Direct demand for money or advance payment in Punjabi/Roman Punjabi. Official companies do not charge candidates.",
  },
];

/**
 * 2. SECONDARY SUSPICIOUS PATTERNS
 */
export const SECONDARY_SCAM_PATTERNS = [
  {
    id: "direct_selection_no_interview",
    phrases: [
      // English
      "direct selection without interview",
      "direct offer letter without interview",
      "selection was made based on your resume",
      "no interview needed",
      "100% guaranteed job",
      "spot offer letter",
      "confirmed placement without test",
      "direct selection",
      "selection without exam",
      "direct appointment without exam",

      // Hindi
      "bina interview direct selection",
      "bina interview ke naukri",
      "seedhi bharti bina exam",
      "100% pakki naukri",
      "resume dekh kar direct selection",

      // Punjabi
      "bina interview naukri",
      "direct selection bina paper",
      "naukri pakki bina interview",
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
      "phonepe number",
      "google pay number",
      "paytm number",
      "gpay number",
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
      "offer expires in 24 hours",
      "urgent response required",
      "immediate clearance required",
      "last chance to claim",
      "warrant will be issued today",
      "aaj hi fees bharein",
      "jaldi pay karo slots khatam",
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
      "earn 50000 per month typing",
      "ghar baithe 50000 mahina",
      "mahine da 40000 kamai",
    ],
    score: 25,
    label: "Unrealistic Compensation for Entry-Level or Unscreened Work",
    description: "Offering unusually high hourly or annual packages for basic copy-paste or unverified roles is standard advance-fee bait.",
  },
  {
    id: "unofficial_contact_channel",
    phrases: [
      "contact hr on whatsapp",
      "send resume on whatsapp",
      "dm on telegram",
      "contact on telegram",
      "join telegram group for task",
      "whatsapp number for joining",
      "whatsapp pe contact karein",
      "telegram pe message karo",
      "skype interview only",
    ],
    score: 30,
    label: "Recruitment Directed Exclusively Through WhatsApp or Telegram",
    description: "Official recruiters communicate through corporate email domains and certified career portals, not anonymous messaging apps.",
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

  // --- Stage 2: Critical Zero-Tolerance Scams (Phrases) ---
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

  // --- Stage 2B: Dynamic Multilingual Regex Payment & Fee Detectors ---
  DYNAMIC_PAYMENT_REGEX_PATTERNS.forEach((pattern) => {
    // Avoid duplicate flag if already detected under same category
    if (flags.some((f) => f.id === pattern.id)) return;

    const regexMatch = cleanText.match(pattern.regex) || normalizedText.match(pattern.regex);
    if (regexMatch) {
      const matchedSnippet = regexMatch[0];
      if (isDisclaimerContext(cleanText, matchedSnippet)) {
        return; // Corporate anti-fraud warning
      }

      hasCriticalScam = true;
      totalScore += pattern.score;
      flags.push({
        id: pattern.id,
        type: "risk",
        severity: "CRITICAL",
        label: pattern.label,
        score: pattern.score,
        description: `${pattern.description} (Matched: "${matchedSnippet}")`,
        matchedPhrase: matchedSnippet,
      });
      matchedPhrases.push(matchedSnippet);
      addHighlight(matchedSnippet, "risk");
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
    totalScore += 40;
    hasCriticalScam = true;
    flags.push({
      id: "upi_id_detected",
      type: "risk",
      severity: "CRITICAL",
      label: `Suspicious Personal / Merchant UPI ID: ${extractedUpiIds.join(", ")}`,
      score: 40,
      description: "Document directs payments directly to a UPI Virtual Payment Address instead of official corporate banking accounts.",
      matchedPhrase: extractedUpiIds.join(", "),
    });
    extractedUpiIds.forEach((u) => addHighlight(u, "risk"));
  }

  // --- Stage 5: MCA Corporate & CIN Registry Verification ---
  const companyVerification = verifyDocumentCompanyAndCIN(cleanText);
  let isImpersonation = false;
  let hasVerifiedEnterpriseCredentials = false;

  if (companyVerification) {
    const { detectedCINs, fakeCinMatch, matchedCompanies, cinMismatch, verifiedCompany } = companyVerification;

    // 5A. Forged / Invalid CIN
    if (fakeCinMatch) {
      hasCriticalScam = true;
      totalScore += 50;
      flags.push({
        id: "forged_mca_cin",
        type: "risk",
        severity: "CRITICAL",
        label: `Forged / Invalid Corporate CIN Cited: "${fakeCinMatch}"`,
        score: 50,
        description: `The document cites an invalid Corporate Identification Number (${fakeCinMatch}) that fails Ministry of Corporate Affairs (MCA) 21-digit verification standards.`,
        matchedPhrase: fakeCinMatch,
      });
      matchedPhrases.push(fakeCinMatch);
      addHighlight(fakeCinMatch, "risk");
    }

    // 5B. CIN - Company Mismatch
    if (cinMismatch) {
      totalScore += 45;
      flags.push({
        id: "cin_company_mismatch",
        type: "risk",
        severity: "HIGH",
        label: "Mismatched Corporate CIN & Company Identity",
        score: 45,
        description: "The cited CIN belongs to a completely different registered corporate entity than the organization claiming to issue this offer.",
        matchedPhrase: detectedCINs.join(", "),
      });
    }

    // 5C. Corporate Impersonation (Major Company + Free Webmail OR Payment Demand OR Unofficial Contact)
    if (matchedCompanies.length > 0) {
      const targetComp = matchedCompanies[0];
      const hasPaymentDemand = hasCriticalScam || flags.some((f) => f.id.includes("payment") || f.id.includes("fee") || f.id.includes("regex"));
      const hasUnofficialChannel = flags.some((f) => f.id === "unofficial_contact_channel");

      if (hasFreeEmail || hasPaymentDemand) {
        isImpersonation = true;
        totalScore += 45;
        flags.push({
          id: "corporate_impersonation",
          type: "risk",
          severity: "CRITICAL",
          label: `Suspected Impersonation of ${targetComp.name}`,
          score: 45,
          description: `The document falsely references registered enterprise ${targetComp.name}, but routes communication through public webmail (${extractedEmails.join(", ") || "free inbox"}) or demands candidate payments. Legitimate enterprises never charge fees.`,
          matchedPhrase: targetComp.name,
        });
        addHighlight(targetComp.name, "risk");
      } else if (hasUnofficialChannel) {
        totalScore += 30;
        flags.push({
          id: "corporate_impersonation_informal",
          type: "risk",
          severity: "HIGH",
          label: `Unverified Informal Recruitment for ${targetComp.name}`,
          score: 30,
          description: `Offer claims association with ${targetComp.name} but directs candidate communication to personal WhatsApp or Telegram channels.`,
          matchedPhrase: targetComp.name,
        });
      }
    }
  }

  // Generic Free Email penalty (when not already covered under impersonation)
  if (hasFreeEmail && !isImpersonation) {
    totalScore += 30;
    flags.push({
      id: "generic_webmail_recruiter",
      type: "risk",
      severity: "HIGH",
      label: "Official Offer Sent from Public Webmail Inbox",
      score: 30,
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
        totalScore -= 30;
        hasVerifiedEnterpriseCredentials = true;
        flags.push({
          id: "verified_enterprise_email",
          type: "mitigating",
          label: `Authentic Enterprise Mailbox: ${matchingEmail}`,
          score: -30,
          description: `Sender mailbox matches the registered domain (${companyVerification.verifiedCompany.domain}) for ${companyVerification.verifiedCompany.name}.`,
          matchedPhrase: matchingEmail,
        });
        addHighlight(matchingEmail, "mitigating");
      }
    }

    // Genuine MCA record with valid CIN and no red flags
    if (companyVerification?.verifiedCompany && !companyVerification.cinMismatch && totalScore <= 0) {
      totalScore -= 20;
      hasVerifiedEnterpriseCredentials = true;
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

  // --- Stage 7: Zero-Trust Verdict & Score Calculation ---
  let finalRiskScore = Math.max(0, Math.min(100, totalScore));

  // If any critical scam was detected, enforce a floor of 85
  if (hasCriticalScam || isImpersonation || flags.some((f) => f.severity === "CRITICAL")) {
    finalRiskScore = Math.max(85, finalRiskScore);
  }

  let verdict = "Needs Verification";
  let status = "unverified";

  if (finalRiskScore >= 70 || hasCriticalScam || isImpersonation) {
    verdict = "Scam";
    status = "scam";
  } else if (finalRiskScore >= 35 || flags.some((f) => f.type === "risk")) {
    verdict = "Suspicious";
    status = "suspicious";
  } else if (hasVerifiedEnterpriseCredentials && finalRiskScore < 20) {
    verdict = "Genuine";
    status = "safe";
  } else {
    // Zero-Trust Standard: Do not blindly certify as Genuine if credentials are missing
    verdict = "Needs Verification";
    status = "unverified";
    finalRiskScore = Math.max(25, finalRiskScore);
  }

  // Formulate clear, authoritative Primary Reason
  let primaryReason = "Document lacks verified corporate domain credentials or MCA registration. Independent verification required before proceeding.";
  if (verdict === "Scam") {
    const criticalFlag = flags.find((f) => f.severity === "CRITICAL") || flags[0];
    primaryReason = criticalFlag
      ? `High-risk fraud detected: ${criticalFlag.label}.`
      : "High-probability scam detected with unauthorized payment demands or extortion.";
  } else if (verdict === "Suspicious") {
    primaryReason = "Suspicious anomalies identified (such as direct hiring without interview, informal messaging channels, or public webmail). Do not send money.";
  } else if (verdict === "Genuine") {
    primaryReason = `Authentic recruitment document verified against MCA corporate records for ${companyVerification?.verifiedCompany?.name || "registered entity"} with zero fee demands.`;
  }

  // Generate actionable recommended actions
  const recommendedActions = [];
  if (verdict === "Scam") {
    recommendedActions.push("DO NOT TRANSFER ANY MONEY via UPI, QR code, PhonePe, GPay, or bank transfer.");
    recommendedActions.push("Do not provide copies of PAN, Aadhaar, bank passbook, or OTP.");
    recommendedActions.push("Immediately report this incident to India's 1930 Cyber Helpline or cybercrime.gov.in.");
    recommendedActions.push("Block and report the sender on Telegram / WhatsApp.");
  } else if (verdict === "Suspicious") {
    recommendedActions.push("Verify this recruitment independently via the company's official careers portal.");
    recommendedActions.push("Never agree to pay for laptops, gate passes, or security deposits.");
    recommendedActions.push("Insist on official corporate email communication from the company's registered domain.");
  } else if (verdict === "Needs Verification") {
    recommendedActions.push("Check whether the recruiter is emailing from an official corporate domain (@company.com).");
    recommendedActions.push("Search for the company's Corporate Identification Number (CIN) on the MCA portal (mca.gov.in).");
    recommendedActions.push("Never transfer registration fees or security deposits under any circumstances.");
  } else {
    recommendedActions.push("Document appears genuine based on verified MCA corporate records and absence of fee demands.");
    recommendedActions.push("Always cross-check final employment contracts via the official company career portal.");
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
    const localVerdict = (localAnalysis.verdict || "").toLowerCase();
    const aiVerdict = (aiResult.verdict || "").toLowerCase();

    const isLocalScam = localVerdict === "scam" || localAnalysis.riskScore >= 70;
    const isAiScam = aiVerdict === "scam" || aiResult.riskScore >= 70;
    const isEitherScam = isLocalScam || isAiScam;

    const isLocalSuspicious = localVerdict === "suspicious" || localAnalysis.riskScore >= 35;
    const isAiSuspicious = aiVerdict === "suspicious" || aiResult.riskScore >= 35;
    const isEitherSuspicious = isLocalSuspicious || isAiSuspicious;

    let finalVerdict = "Needs Verification";
    let finalRisk = Math.max(localAnalysis.riskScore, aiResult.riskScore);

    if (isEitherScam) {
      finalVerdict = "Scam";
      finalRisk = Math.max(85, localAnalysis.riskScore, aiResult.riskScore);
    } else if (isEitherSuspicious) {
      finalVerdict = "Suspicious";
      finalRisk = Math.max(35, localAnalysis.riskScore, aiResult.riskScore);
    } else if (localVerdict === "genuine" && (aiVerdict === "genuine" || aiVerdict === "legitimate" || aiVerdict === "safe") && finalRisk < 20) {
      finalVerdict = "Genuine";
      finalRisk = Math.min(localAnalysis.riskScore, aiResult.riskScore);
    } else {
      finalVerdict = "Needs Verification";
      finalRisk = Math.max(25, localAnalysis.riskScore, aiResult.riskScore);
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

    let primaryReason = aiResult.primaryReason || localAnalysis.primaryReason;
    if (finalVerdict === "Scam" && !primaryReason.toLowerCase().includes("scam") && !primaryReason.toLowerCase().includes("fraud") && !primaryReason.toLowerCase().includes("demand")) {
      primaryReason = `High-risk fraud detected: ${primaryReason}`;
    }

    return {
      ...localAnalysis,
      riskScore: finalRisk,
      confidenceScore: Math.max(localAnalysis.confidenceScore, aiResult.confidenceScore),
      verdict: finalVerdict,
      status: finalVerdict === "Scam" ? "scam" : finalVerdict === "Suspicious" ? "suspicious" : finalVerdict === "Genuine" ? "safe" : "unverified",
      primaryReason,
      detailedExplanation: aiResult.detailedExplanation || localAnalysis.detailedExplanation || "",
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
