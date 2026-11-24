import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { MessageSquare, X, Send, Bot, Trash2, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendChatMessage, getApiConfig } from "../services/aiChatService";

const QUICK_PROMPTS = [
  { label: "Verify Company & CIN", query: "How do I check if a company CIN and job recruiter are genuine on MCA portal?" },
  { label: "Is this job offer fake?", query: "How can I tell if a job offer or recruiter demanding fees is a scam?" },
  { label: "What is 1930 Helpline?", query: "What is the 1930 Cyber Crime Helpline and when should I call it?" },
  { label: "Telegram Task Scam", query: "Why are Telegram and WhatsApp part-time rating tasks scams?" }
];

export default function AiAssistant() {
  const { activeScan, updateScanChat, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const initialGreeting = () => ({
    id: "init-1",
    sender: "ai",
    text: t('aiAssistantGreeting'),
    timestamp: new Date().toISOString(),
  });

  const [messages, setMessages] = useState(() => [initialGreeting()]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // When activeScan changes, announce scan context to user in chat
  useEffect(() => {
    if (activeScan && activeScan.filename) {
      const scanContextMessage = {
        id: `scan-${activeScan.id || Date.now()}`,
        sender: "ai",
        text: `🔍 **Document Loaded:** "${activeScan.filename}"\nThreat Index: **${activeScan.result?.riskScore ?? 0}%** (${activeScan.result?.verdict || 'Analysis Complete'}).\n\nAsk me *"Why was this document flagged?"* or paste specific clauses to inspect them with AI.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => {
        if (prev.some((m) => m.text?.includes(activeScan.filename))) return prev;
        return [...prev, scanContextMessage];
      });
    }
  }, [activeScan]);

  const handleClearChat = () => {
    setMessages([initialGreeting()]);
  };

  const handleSendMessage = async (textToSend) => {
    const trimmed = (textToSend || inputText).trim();
    if (!trimmed || isTyping) return;

    setInputText("");

    const userMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);

    if (activeScan) {
      updateScanChat(activeScan.id, "user", trimmed);
    }

    setIsTyping(true);

    try {
      // Build conversation history for API
      const history = nextMessages
        .filter((m) => m.sender === "user" || m.sender === "ai")
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const replyText = await sendChatMessage(history, activeScan);

      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: replyText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (activeScan) {
        updateScanChat(activeScan.id, "ai", replyText);
      }
    } catch (err) {
      console.error("AI Assistant error:", err);
      let errorNotice = "Unable to reach the AI engine right now. Please check your internet connection.";
      if (err.message?.includes("MISSING_API_KEY")) {
        errorNotice = "⚠️ AI API Key is not configured. Please ensure `VITE_AI_API_KEY` is set in your `.env` file.";
      } else if (err.message?.includes("INVALID_API_KEY")) {
        errorNotice = "⚠️ Invalid API Key. Please verify the `VITE_AI_API_KEY` in your `.env` configuration.";
      } else if (err.message?.includes("RATE_LIMIT")) {
        errorNotice = "⚠️ High API request volume. Please wait a moment and try again.";
      }

      const fallbackAiMessage = {
        id: `err-${Date.now()}`,
        sender: "ai",
        isError: true,
        text: errorNotice,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackAiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const apiConfig = getApiConfig();

  // Helper to format simple markdown bolding and bullet lists
  const renderFormattedText = (raw) => {
    if (!raw) return null;
    return raw.split("\n").map((line, idx) => {
      // Bold replacer
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <span key={idx} className="block min-h-[1.1rem]">
          {formattedLine}
        </span>
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-[92vw] sm:w-[410px] h-[550px] max-h-[84vh] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header Layout */}
            <div className="px-4 py-3 bg-slate-900 dark:bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white tracking-wide">
                      {t('aiAssistantTitle')}
                    </h3>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {apiConfig.provider}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cybersecurity Specialist • EN / HI / PA
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Clear Chat Button */}
                <button
                  type="button"
                  onClick={handleClearChat}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/70 dark:bg-slate-950/40">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                      m.sender === "user"
                        ? "bg-slate-900 text-white dark:bg-emerald-600 dark:text-white rounded-br-xs font-medium"
                        : m.isError
                        ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 rounded-bl-xs"
                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-xs"
                    }`}
                  >
                    {renderFormattedText(m.text)}
                  </div>
                </div>
              ))}

              {/* Typing Loader */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-bl-xs p-3 shadow-xs flex items-center gap-1.5 min-w-16 justify-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Chips */}
            {messages.length <= 3 && !isTyping && (
              <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none">
                {activeScan && (
                  <button
                    type="button"
                    onClick={() => handleSendMessage(`Analyze the threat score and flags for "${activeScan.filename}". Why is it flagged?`)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/50 text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shrink-0 cursor-pointer"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Why is this flagged?
                  </button>
                )}
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(qp.query)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                    {qp.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Action Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-center"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                disabled={isTyping}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isTyping ? "AI is analyzing..." : t('aiInputPlaceholder')}
                className="grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 font-medium disabled:opacity-50 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                title="Send message"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 shadow-xl flex items-center justify-center text-white dark:text-slate-950 border border-slate-800 dark:border-emerald-400/20 cursor-pointer relative transition-all"
        aria-label="Toggle AI Cybersecurity Advisor"
        title="Open AI Cybersecurity Advisor"
      >
        <MessageSquare className="w-5 h-5" />
        {activeScan && (activeScan.result?.riskScore ?? 0) >= 50 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 border-2 border-white dark:border-slate-950 text-[9px] font-bold text-white shadow-xs">
            !
          </span>
        )}
      </motion.button>
    </div>
  );
}
