/**
 * CRX ScamShield AI - AI Chat Service
 * Supports official xAI Grok (grok-2-latest / grok-beta) and Groq Cloud (llama-3.3-70b / qwen3.8-27b)
 * Compatible with OpenAI chat completions format.
 */

const DEFAULT_GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_XAI_ENDPOINT = 'https://api.x.ai/v1/chat/completions';

const SYSTEM_PROMPT = `You are the Cyber Threat & Security Intelligence Assistant for "CRX ScamShield AI" — an advanced AI-driven cybersecurity and scam detection platform.

Your mission:
1. Provide accurate, professional, conversational, and deeply helpful assistance like ChatGPT or Gemini.
2. Act as a specialized Senior Cybersecurity Analyst & Corporate Verification Expert:
   - Identify, deconstruct, and explain online scams, phishing emails, SMS smishing, fake recruiters, and fraudulent job offers.
   - Analyze suspicious messages, emails, URLs, and offers provided by the user with precision.
   - Explain how to identify fake vs genuine companies:
     * Check official corporate email domains (never trust recruiters using @gmail.com, @yahoo.com, Telegram, or WhatsApp for official hiring).
     * Verify Corporate Identification Number (CIN) on India's Ministry of Corporate Affairs portal (mca.gov.in). Standard MCA CIN format is 21 characters: [U/L][5 digits Industry][2 letters State][4 digits Year][PLC/PTC/GOI/FTC][6 digits Registration].
     * Never hallucinate or invent company details. Distinguish verified facts from unverified claims.
   - Advise on immediate remediation: contact India's National Cybercrime Helpline 1930 (especially for financial fraud within the 2-hour golden period) and report on https://cybercrime.gov.in.
   - Guide users to protect personal data (never send Aadhaar, PAN, Passport, or bank OTPs to unverified entities).
3. Multilingual Capability:
   - Fluent in English, Hindi (हिन्दी), and Punjabi (ਪੰਜਾਬੀ).
   - If the user talks in Hindi (or Hinglish), respond in natural, polite Hindi/Hinglish.
   - If the user talks in Punjabi, respond in fluent Punjabi (Gurmukhi or Shahmukhi/Latin based on their prompt).
   - If the user talks in English, respond in fluent English.
4. Versatility:
   - While cybersecurity, fraud prevention, and document verification are your specialty, you can also answer general questions, technical questions, career advice, and general knowledge accurately and intelligently.
5. Formatting:
   - Use clean Markdown with bullet points, bold highlights, and structured sections where helpful.
   - Keep answers clear, engaging, and easy to understand without overly robotic jargon.`;

/**
 * Resolves API configuration based on the provided key or environment variable.
 */
export function getApiConfig(customKey = '') {
  const envKey = (import.meta.env.VITE_AI_API_KEY || '').trim();
  const apiKey = (customKey || envKey).trim();
  const envModel = (import.meta.env.VITE_AI_MODEL || '').trim();

  const isXai = apiKey.startsWith('xai-');
  const endpoint = isXai ? DEFAULT_XAI_ENDPOINT : DEFAULT_GROQ_ENDPOINT;

  let model = envModel && envModel !== 'auto' ? envModel : (isXai ? 'grok-2-latest' : 'qwen/qwen3.8-27b');

  return {
    apiKey,
    endpoint,
    model,
    provider: isXai ? 'xAI Grok' : 'Groq AI',
    isConfigured: Boolean(apiKey),
  };
}

/**
 * Sends a conversation message list to the AI model.
 * @param {Array<{ role: 'user' | 'assistant' | 'system', content: string }>} conversationHistory 
 * @param {Object} [activeScan] - Optional active scan context
 * @param {string} [customApiKey] - Optional runtime custom API key
 * @returns {Promise<string>} Model reply text
 */
export async function sendChatMessage(conversationHistory = [], activeScan = null, customApiKey = '') {
  const config = getApiConfig(customApiKey);

  if (!config.isConfigured) {
    throw new Error('MISSING_API_KEY');
  }

  // Build system message with active scan context if available
  let dynamicSystemPrompt = SYSTEM_PROMPT;
  if (activeScan && activeScan.filename) {
    const risk = activeScan.result?.riskScore ?? 'N/A';
    const verdict = activeScan.result?.verdict ?? 'Under Review';
    const flags = (activeScan.result?.flags || []).map(f => `- ${f.label}: ${f.description}`).join('\n');

    dynamicSystemPrompt += `\n\n[Active Document Context]:
User is currently inspecting document "${activeScan.filename}".
Platform Threat Index: ${risk}% (${verdict}).
Detected Suspicious Flags:
${flags || 'No critical threat signatures triggered.'}
When the user asks about this document or scan, refer directly to this context.`;
  }

  const messages = [
    { role: 'system', content: dynamicSystemPrompt },
    ...conversationHistory.map(m => ({
      role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
      content: m.content || m.text || '',
    })),
  ];

  const payload = {
    model: config.model,
    messages,
    temperature: 0.7,
    max_tokens: 1200,
  };

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errBody = '';
      try {
        const json = await response.json();
        errBody = json.error?.message || JSON.stringify(json);
      } catch {
        errBody = await response.text();
      }

      if (response.status === 401) {
        throw new Error('INVALID_API_KEY: ' + errBody);
      } else if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED: ' + errBody);
      } else {
        throw new Error(`API_ERROR (${response.status}): ${errBody}`);
      }
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content?.trim();

    if (!replyText) {
      throw new Error('EMPTY_RESPONSE: No response content received from AI.');
    }

    return replyText;
  } catch (error) {
    console.error('[CRX AI Chat Service Error]:', error);
    throw error;
  }
}
