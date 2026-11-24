/**
 * Advanced Scam Detection & MCA Corporate Intelligence Engine for Corex ScamShield AI
 */
import { verifyDocumentCompanyAndCIN } from "./companyVerifier";

export const SCAM_KEYWORDS = [
  {
    id: "registration_fee",
    phrases: [
      "registration fee",
      "entry fee",
      "processing fee",
      "onboarding fee",
      "training fee",
      "interview fee",
      "seat booking charge",
      "placement fee",
    ],
    score: 30,
    label: "Registration / Training Fee Request",
    description:
      "Real companies will never ask you to pay money for training, interviews, or to start a job. This is a classic recruitment scam indicator.",
  },
  {
    id: "pay_now",
    combination: {
      groupA: [
        "pay now",
        "pay upfront",
        "make payment",
        "send money",
        "wire transfer",
        "transfer funds",
        "gpay",
        "google pay",
        "phonepe",
        "paytm",
        "venmo",
        "crypto deposit",
        "usdt deposit",
        "upi transfer",
        "qr code payment",
      ],
      groupB: [
        "job",
        "interview",
        "selection",
        "offer",
        "joining",
        "training",
        "recruitment",
        "hiring",
        "vacancy",
        "employment",
      ],
    },
    score: 25,
    label: "Upfront Payment Demanded in Recruitment Context",
    description:
      "The sender asks you to transfer funds via UPI, QR code, or crypto for an employment opportunity. Legitimate employers never charge candidates.",
  },
  {
    id: "urgent",
    phrases: [
      "urgent",
      "immediately",
      "immediate joiner",
      "hiring today",
      "act fast",
      "quick reply",
      "apply now immediately",
      "limited time only",
      "offer expires in 2 hours",
      "immediate response required",
    ],
    score: 10,
    label: "Urgency Pressure Tactics",
    description:
      "Scammers rush candidates into quick decisions to prevent them from conducting background checks or consulting authorities.",
  },
  {
    id: "limited_seats",
    phrases: [
      "limited seats",
      "limited slots",
      "few vacancies left",
      "only few open",
      "last chance",
      "slots closing",
      "only 2 slots remaining",
    ],
    score: 10,
    label: "Artificial Scarcity Trap",
    description:
      "Saying 'few seats left' or 'slots closing' creates panic and forces immediate unverified compliance.",
  },
  {
    id: "task_scam",
    phrases: [
      "like youtube videos",
      "subscribe youtube channel",
      "subscribe channel",
      "like and subscribe",
      "hotel rating task",
      "google review task",
      "earn 3000 daily",
      "earn 5000 daily",
      "part time task",
      "telegram task group",
      "task earnings",
      "merchant order task",
      "prepaid task",
      "commission task",
    ],
    score: 30,
    label: "Part-time Review / YouTube / Telegram Task Scam",
    description:
      "Promises of high daily payouts for simple social media likes or hotel reviews are a known trap leading to prepaid task extortion.",
  },
  {
    id: "digital_arrest_fraud",
    phrases: [
      "digital arrest",
      "mumbai police",
      "cyber cell delhi",
      "narcotics control bureau",
      "customs department",
      "parcel seized with drugs",
      "illegal contraband found",
      "passport cancellation",
      "skype video interrogation",
      "cbi investigation notice",
      "arrest warrant issued",
    ],
    score: 40,
    label: "Digital Arrest / Law Enforcement Impersonation",
    description:
      "CRITICAL: Law enforcement agencies never arrest citizens over Skype or WhatsApp video calls, nor do they ask to transfer funds to 'clearance accounts'. Call 1930 immediately.",
  },
  {
    id: "utility_electricity_scam",
    phrases: [
      "electricity power will be disconnected",
      "power cut at 9:30 pm",
      "update your electricity bill",
      "call electricity officer",
      "bill update pending",
      "bijli bill update",
    ],
    score: 35,
    label: "Electricity / Utility Disconnection Threat",
    description:
      "Threats of immediate power disconnection sent via SMS or WhatsApp from private numbers are phishing attempts to steal banking credentials.",
  },
  {
    id: "kyc_apk_fraud",
    phrases: [
      "pan card update required",
      "kyc expired",
      "sim card block warning",
      "download apk",
      "install anydesk",
      "install teamviewer",
      "install rustdesk",
      "download quicksupport",
      "screen share app",
      "click link to update kyc",
      "bank account suspended",
    ],
    score: 35,
    label: "KYC Suspension / Remote Access APK Scam",
    description:
      "Never install APK files or remote screen-sharing tools (AnyDesk, TeamViewer) sent by unknown callers. This grants full access to your bank accounts.",
  },
  {
    id: "lottery_kbc_scam",
    phrases: [
      "kbc lottery",
      "kaun banega crorepati lottery",
      "lucky winner",
      "won 25 lakh",
      "won 25,00,000",
      "claim your prize money",
      "customs clearance fee for prize",
      "gift parcel at airport",
    ],
    score: 35,
    label: "Lottery / KBC / Prize Fee Fraud",
    description:
      "Unsolicited lottery winnings or prize notifications asking for tax or processing fees upfront are 100% fraudulent.",
  },
  {
    id: "work_from_home_high_salary",
    combination: {
      groupA: [
        "work from home",
        "wfh",
        "remote job",
        "work online",
        "flexible hours",
        "part time job",
        "data entry job",
      ],
      groupB: [
        "high salary",
        "high pay",
        "earn daily",
        "big money",
        "huge income",
        "earn $",
        "earn ₹",
        "easy money",
        "daily payout",
        "per day earning",
      ],
    },
    score: 20,
    label: "Unrealistic Remote Pay Promise",
    description:
      "Offers promising exorbitant daily income for simple entry-level or remote work are typical bait used in advance-fee scams.",
  },
  {
    id: "generic_company_email",
    phrases: [
      "@gmail.com",
      "@yahoo.com",
      "@outlook.com",
      "@hotmail.com",
      "@proton.me",
      "@protonmail.com",
      "@live.com",
    ],
    score: 20,
    label: "Generic Public Email Domain",
    description:
      "Official corporate job offers originate from verified enterprise domains (e.g. @tcs.com), not free webmail services.",
  },
  {
    id: "guaranteed_job",
    phrases: [
      "100% guaranteed job",
      "guaranteed placement",
      "no interview needed",
      "direct selection",
      "100% selection",
      "confirmed job",
      "direct offer letter",
      "spot offer without interview",
    ],
    score: 25,
    label: "Guaranteed Placement without Evaluation",
    description:
      "Legitimate employers never extend guaranteed offers or offer letters without rigorous technical or HR evaluation.",
  },
  {
    id: "security_deposit",
    phrases: [
      "security deposit",
      "refundable deposit",
      "laptop security",
      "device deposit",
      "software fee",
      "tools insurance",
      "gate pass fee",
      "courier delivery charge",
    ],
    score: 25,
    label: "Hardware / Security Deposit Demand",
    description:
      "Real enterprises supply necessary work equipment and software licenses free of charge. Asking candidates for deposits is fraudulent.",
  },
  {
    id: "crypto_investment_trap",
    phrases: [
      "guaranteed 200% return",
      "usdt mining",
      "vip trading signal",
      "crypto investment pool",
      "forex trading profit",
      "double your investment",
      "daily trading profit",
    ],
    score: 30,
    label: "High-Yield Crypto / Trading Trap",
    description:
      "Guaranteed returns in cryptocurrency or unauthorized forex groups are notorious Ponzi schemes.",
  },
  {
    id: "identity_harvesting",
    phrases: [
      "send passport copy",
      "aadhaar card upfront",
      "pan card front and back",
      "ssn photo",
      "id card copy before interview",
      "bank passbook photo",
      "blank cheque photo",
    ],
    score: 20,
    label: "Premature Sensitive Identity Harvesting",
    description:
      "Demanding full identity proof, PAN, Aadhaar, or bank details prior to formal interviews is often used for identity theft.",
  },
];

// Mitigating signals: known legitimate recruitment platforms
const TRUSTED_PLATFORMS = [
  "internshala",
  "linkedin",
  "naukri",
  "indeed",
  "glassdoor",
  "wellfound",
  "unstop",
  "hirist",
  "instahyre",
];

const FREE_MAIL_DOMAINS = [
  "@gmail.com",
  "@yahoo.com",
  "@outlook.com",
  "@hotmail.com",
  "@proton.me",
  "@protonmail.com",
  "@live.com",
];

/**
 * Analyzes text content and validates against 1000 MCA companies and scam patterns.
 * @param {string} text - Raw content strings.
 * @param {string} filename - Document title metadata.
 */
export function analyzeScam(text = "", filename = "") {
  const cleanText = text || "";
  const normalizedText = (cleanText + " " + (filename || "")).toLowerCase();

  if (!cleanText.trim() && !filename.trim()) {
    return {
      riskScore: 0,
      confidenceScore: 0,
      verdict: "Likely Safe",
      status: "safe",
      flags: [],
      matchedPhrases: [],
      highlightedText: "No text content scanned.",
      companyVerification: null,
    };
  }

  let totalScore = 0;
  const flags = [];
  const matchedPhrases = [];
  const highlightMap = new Map();

  const addHighlight = (phrase, type) => {
    if (!phrase) return;
    if (cleanText.toLowerCase().includes(phrase.toLowerCase())) {
      highlightMap.set(phrase, type);
    }
  };

  // --- 1. Risk keyword / combination rules ---
  SCAM_KEYWORDS.forEach((keywordRule) => {
    let matched = false;
    let detectedPhrase = "";

    if (keywordRule.combination) {
      const matchA = keywordRule.combination.groupA.find((phrase) =>
        normalizedText.includes(phrase),
      );
      const matchB = keywordRule.combination.groupB.find((phrase) =>
        normalizedText.includes(phrase),
      );

      if (matchA && matchB) {
        matched = true;
        detectedPhrase = `"${matchA}" + "${matchB}"`;
        keywordRule.combination.groupA.forEach((p) => addHighlight(p, "risk"));
        keywordRule.combination.groupB.forEach((p) => addHighlight(p, "risk"));
      }
    } else {
      const found = keywordRule.phrases.find((phrase) =>
        normalizedText.includes(phrase),
      );
      if (found) {
        matched = true;
        detectedPhrase = found;
        keywordRule.phrases.forEach((phrase) => addHighlight(phrase, "risk"));
      }
    }

    if (matched) {
      totalScore += keywordRule.score;
      flags.push({
        id: keywordRule.id,
        type: "risk",
        label: keywordRule.label,
        score: keywordRule.score,
        description: keywordRule.description,
        matchedPhrase: detectedPhrase,
      });
      matchedPhrases.push(detectedPhrase);
    }
  });

  // --- 2. MCA Company & Corporate Identification Number (CIN) Verification ---
  const companyVerification = verifyDocumentCompanyAndCIN(cleanText);

  if (companyVerification) {
    const { detectedCINs, fakeCinMatch, matchedCompanies, verifiedCompany, cinMismatch } =
      companyVerification;

    // Check fake CIN string
    if (fakeCinMatch) {
      const fakeCinScore = 35;
      totalScore += fakeCinScore;
      flags.push({
        id: "fake_mca_cin",
        type: "risk",
        label: "Invalid / Forged Corporate CIN Detected",
        score: fakeCinScore,
        description: `The document cites an invalid Corporate Identification Number (${fakeCinMatch}) that fails Ministry of Corporate Affairs (MCA) 21-digit verification standards.`,
        matchedPhrase: fakeCinMatch,
      });
      matchedPhrases.push(fakeCinMatch);
      addHighlight(fakeCinMatch, "risk");
    }

    // Check CIN Mismatch
    if (cinMismatch) {
      const mismatchScore = 30;
      totalScore += mismatchScore;
      flags.push({
        id: "cin_company_mismatch",
        type: "risk",
        label: "Mismatched Corporate CIN & Company Identity",
        score: mismatchScore,
        description: `The CIN specified belongs to a different registered corporate entity than the company name claimed in the document.`,
        matchedPhrase: detectedCINs.join(", "),
      });
    }

    // Check Corporate Impersonation (e.g. claims to be TCS/Google/Amazon but uses gmail or asks money)
    if (matchedCompanies.length > 0) {
      const hasFreeEmail = FREE_MAIL_DOMAINS.some((domain) =>
        normalizedText.includes(domain),
      );
      const asksMoney = flags.some((f) =>
        ["registration_fee", "pay_now", "security_deposit"].includes(f.id),
      );

      if (hasFreeEmail || asksMoney) {
        const impersonationScore = 25;
        totalScore += impersonationScore;
        const targetComp = matchedCompanies[0];
        flags.push({
          id: "corporate_impersonation",
          type: "risk",
          label: `Suspected Impersonation of ${targetComp.name}`,
          score: impersonationScore,
          description: `The document references a major registered company (${targetComp.name}), but pairs it with red-flag communication channels (free email domain or upfront payment demands). Legitimate enterprises never recruit through free public webmails.`,
          matchedPhrase: targetComp.name,
        });
        addHighlight(targetComp.name, "risk");
      } else if (verifiedCompany && detectedCINs.length > 0 && !cinMismatch) {
        // Genuine corporate entity verified through MCA database!
        const trustBonus = -20;
        totalScore += trustBonus;
        flags.push({
          id: "mca_verified_entity",
          type: "mitigating",
          label: `Verified MCA Corporate Identity: ${verifiedCompany.name}`,
          score: trustBonus,
          description: `Corporate Identification Number (${verifiedCompany.cin}) matches the Ministry of Corporate Affairs registered record for ${verifiedCompany.name} (${verifiedCompany.city}, ${verifiedCompany.state}).`,
          matchedPhrase: verifiedCompany.cin,
        });
        addHighlight(verifiedCompany.cin, "mitigating");
      }
    }
  }

  // --- 3. Mitigating signal: recognized hiring platform ---
  const matchedPlatform = TRUSTED_PLATFORMS.find((p) =>
    normalizedText.includes(p),
  );
  if (matchedPlatform) {
    const adjustment = -15;
    totalScore += adjustment;
    flags.push({
      id: "trusted_platform",
      type: "mitigating",
      label: "Recognized Hiring Platform Reference",
      score: adjustment,
      description:
        "Document references a recognized recruitment portal, slightly reducing baseline fraud likelihood.",
      matchedPhrase: matchedPlatform,
    });
    matchedPhrases.push(matchedPlatform);
    addHighlight(matchedPlatform, "mitigating");
  }

  // --- 4. Mitigating signal: official corporate domain ---
  const officialDomainRegex = /@[a-z0-9-]+\.(com|in|org|net|co\.in)/gi;
  const domainsFound = cleanText.match(officialDomainRegex) || [];
  const officialDomain = domainsFound.find(
    (d) => !FREE_MAIL_DOMAINS.includes(d.toLowerCase()),
  );
  if (officialDomain) {
    const adjustment = -10;
    totalScore += adjustment;
    flags.push({
      id: "official_domain",
      type: "mitigating",
      label: "Verified Corporate Mailbox Domain",
      score: adjustment,
      description:
        "Communication uses an enterprise domain rather than a free public inbox provider.",
      matchedPhrase: officialDomain,
    });
    matchedPhrases.push(officialDomain);
    addHighlight(officialDomain, "mitigating");
  }

  // Clamp score 0 - 100
  const riskScore = Math.max(0, Math.min(totalScore, 100));

  let verdict = "Likely Safe";
  let status = "safe";
  if (riskScore >= 70) {
    verdict = "Potential Scam";
    status = "scam";
  } else if (riskScore >= 35) {
    verdict = "Suspicious Anomaly";
    status = "suspicious";
  }

  // Confidence Engine
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  let confidenceScore = 75;

  if (wordCount < 15) confidenceScore -= 35;
  else if (wordCount < 40) confidenceScore -= 15;
  else if (wordCount > 200) confidenceScore += 15;

  if (riskScore >= 60) confidenceScore += 10;
  confidenceScore = Math.max(15, Math.min(confidenceScore, 99));

  // Highlighting
  let highlightedText = cleanText;
  if (cleanText && highlightMap.size > 0) {
    const sortedPhrases = [...highlightMap.keys()].sort(
      (a, b) => b.length - a.length,
    );
    const replacementMap = new Map();

    sortedPhrases.forEach((phrase, index) => {
      const token = `__SCAM_TOKEN_${index}__`;
      const escaped = phrase.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");
      const type = highlightMap.get(phrase);
      const css =
        type === "mitigating"
          ? "bg-green-500/10 text-green-600 font-semibold px-1 rounded border border-green-500/20"
          : "bg-red-500/10 text-red-500 font-semibold px-1 rounded border border-red-500/20";

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
    riskScore,
    confidenceScore,
    verdict,
    status,
    flags,
    matchedPhrases: [...new Set(matchedPhrases)],
    highlightedText: highlightedText || "No text content scanned.",
    companyVerification,
  };
}
