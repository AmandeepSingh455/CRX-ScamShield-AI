/**
 * CRX ScamShield AI - AI Document & Live Stream Scanning Engine
 * Performs deep contextual verification using Groq (Qwen/Llama) or xAI Grok.
 * Provides fallback to heuristic analysis if API is offline or unconfigured.
 */
import { getApiConfig } from './aiChatService.js';

const AI_ANALYSIS_PROMPT = `You are the Lead Cybersecurity Forensics AI for CRX ScamShield.
Your mission is to perform a rigorous, zero-trust scam and authenticity evaluation of the provided text (which may be a job offer letter, recruitment message, police/customs notice, task invitation, or chat message).

CRITICAL FORENSIC RULES:
1. ZERO TOLERANCE FOR PAYMENT DEMANDS: Legitimate employers NEVER charge candidates for registration, onboarding, interview, training, gate pass, laptop security deposit, background checks, or courier delivery. If any money/deposit/UPI transfer is requested, classify as SCAM (Risk >= 85) regardless of how official or genuine the company name appears!
2. CORPORATE IMPERSONATION: If a document claims to be from a major company (e.g. Tata Motors, TCS, Infosys, Amazon, Google, Reliance, Wipro) but uses a public webmail address (@gmail.com, @yahoo.com, @outlook.com) or an unverified Telegram handle, it is an IMPERSONATION SCAM.
3. DIGITAL ARREST / LAW ENFORCEMENT FRAUD: Indian police, CBI, and Customs never arrest citizens over video calls or demand clearance bonds via bank/UPI. Classify as SCAM (Risk >= 95).
4. UNREALISTIC SALARY / NO INTERVIEW: Direct job offer letters issued without an interview round or offering absurd daily task wages (e.g., ₹5,000/day for liking YouTube videos) are advance-fee fraud traps.
5. GENUINE CRITERIA: A document is GENUINE (Risk < 25) ONLY if: official enterprise domain email (@company.com), zero fees/deposits, legitimate hiring process, and verified corporate presence.

You MUST respond strictly with a valid JSON object in the following format (no markdown, no extra commentary):
{
  "verdict": "Scam" | "Suspicious" | "Genuine",
  "riskScore": number (0 to 100),
  "confidenceScore": number (50 to 99),
  "primaryReason": "One-sentence executive reason explaining why it is Scam, Suspicious, or Genuine.",
  "detailedExplanation": "Clear, direct forensic explanation of the findings.",
  "companyVerificationStatus": "Verified Active MCA Entity" | "Suspected Impersonation" | "Unregistered / Unknown Entity" | "Government Agency Impersonation" | "Not Applicable",
  "detectedAnomalies": ["Array of concise detected red flags or safety markers"],
  "highlightedQuotes": ["Exact suspicious words or phrases extracted from the text"],
  "recommendedActions": ["Clear actionable recommendations for the user"]
}`;

/**
 * Evaluates document or conversation text with the AI model.
 * Returns parsed forensic assessment or null if API is unavailable.
 */
export async function analyzeWithAi(text = '', filename = '') {
  const config = getApiConfig();

  if (!config.isConfigured || !text || text.trim().length < 15) {
    return null;
  }

  const userContent = `[DOCUMENT TITLE / METADATA]: ${filename || 'Direct Text Input'}

[DOCUMENT / CONVERSATION TEXT]:
${text.slice(0, 4000)}

Perform thorough forensic scam and company verification. Return only valid JSON.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7500); // 7.5s max timeout

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: AI_ANALYSIS_PROMPT },
          { role: 'user', content: userContent },
        ],
        temperature: 0.1, // Near deterministic for consistent forensic evaluation
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn('AI Scan API returned status:', response.status);
      return null;
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim();

    if (!rawContent) return null;

    // Clean JSON markdown fences if present
    const cleanJson = rawContent
      .replace(/^```json/i, '')
      .replace(/^```/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJson);

    // Normalize verdict
    let normalizedVerdict = 'Suspicious';
    if (parsed.riskScore >= 70 || parsed.verdict?.toLowerCase() === 'scam') {
      normalizedVerdict = 'Scam';
    } else if (parsed.riskScore <= 30 && parsed.verdict?.toLowerCase() === 'genuine') {
      normalizedVerdict = 'Genuine';
    }

    return {
      source: 'AI Intelligence Engine (' + config.provider + ')',
      verdict: normalizedVerdict,
      riskScore: Math.max(0, Math.min(100, Number(parsed.riskScore) || 50)),
      confidenceScore: Math.max(50, Math.min(99, Number(parsed.confidenceScore) || 85)),
      primaryReason: parsed.primaryReason || 'Contextual AI assessment completed.',
      detailedExplanation: parsed.detailedExplanation || '',
      companyVerificationStatus: parsed.companyVerificationStatus || 'Under Review',
      detectedAnomalies: Array.isArray(parsed.detectedAnomalies) ? parsed.detectedAnomalies : [],
      highlightedQuotes: Array.isArray(parsed.highlightedQuotes) ? parsed.highlightedQuotes : [],
      recommendedActions: Array.isArray(parsed.recommendedActions) ? parsed.recommendedActions : [],
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('AI Scan skipped or timed out, relying on local forensic engine:', err.message);
    return null;
  }
}
