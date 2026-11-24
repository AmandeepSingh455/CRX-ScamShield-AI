/**
 * CRX ScamShield AI - AI Chat Service
 * Supports official xAI Grok (grok-2-latest / grok-beta) and Groq Cloud (llama-3.3-70b / qwen3.8-27b)
 * Compatible with OpenAI chat completions format.
 */

const DEFAULT_GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_XAI_ENDPOINT = 'https://api.x.ai/v1/chat/completions';

const SYSTEM_PROMPT = `You are ScamShield Security AI — an intelligent, natural, and helpful security and general assistant for the CRX ScamShield platform.

Core Behavior & Tone:
1. Natural & Conversational: Give direct, human-like, friendly answers similar to ChatGPT or Gemini. Understand what the user wants first.
2. Avoid Bloat & Unnecessary Headings: Do not overwhelm the user with repetitive headings (like "### Breakdown:", "### Summary:") or long-winded boilerplate unless specifically requested. Keep answers clean, direct, and structured with natural paragraphs.
3. Clean Mathematical & Technical Formatting:
   - NEVER output LaTeX math delimiters such as $$, $, \\(, or \\).
   - Write math formulas and powers in clean Unicode format (for example, write "(a + b)² = a² + 2ab + b²" instead of "$(a + b)^2 = a^2 + 2ab + b^2$").
   - When showing examples or steps, present them simply and clearly line-by-line.
4. Cybersecurity & Verification Specialist:
   - Identify online scams, fake job offers, phishing emails, SMS fraud, and recruitment fee traps.
   - Explain how to check official company domains vs. suspicious webmail/Telegram recruiters.
   - Clarify Corporate Identification Number (CIN) verification rules on India's Ministry of Corporate Affairs portal (mca.gov.in). Never invent fake company records.
   - Guide victims to contact India's National Cybercrime Helpline 1930 and file complaints on cybercrime.gov.in.
5. Multilingual Fluency:
   - Automatically adapt to the language of the user: English, Hindi (हिन्दी / Hinglish), or Punjabi (ਪੰਜਾਬੀ).
   - Respond naturally and courteously in the user's chosen language.
6. Context Retention:
   - Keep track of previous messages in the conversation to handle follow-up questions smoothly.`;

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
