import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  ShieldAlert,
  Bot,
} from 'lucide-react';
import { analyzeScam } from '../../utils/scamAnalyzer';

export const TELEGRAM_SCENARIOS = [
  {
    id: 'task_scam',
    title: 'YouTube Like & Earn Task Scam',
    subtitle: 'Classic prepaid task trap demanding ₹3,000 activation deposit',
    initialScore: 88,
    messages: [
      {
        sender: 'recruiter',
        senderName: 'Elena HR Global Tasks',
        time: '14:20',
        text: 'Hello dear! We have an online part-time position. You only need to like YouTube videos. We pay ₹150 per task directly to UPI.',
        risk: 'low',
      },
      {
        sender: 'victim',
        senderName: 'You',
        time: '14:21',
        text: 'Okay, I completed the 3 video likes. Sent screenshots.',
        risk: 'none',
      },
      {
        sender: 'recruiter',
        senderName: 'Elena HR Global Tasks',
        time: '14:22',
        text: 'Great work! ₹150 credited to your GPay. Now for Task 4 (VIP High Yield), deposit ₹3,000 security to unlock your ₹9,500 daily merchant salary package. Pay immediately to UPI: taskpay99@okaxis.',
        risk: 'critical',
        trigger: 'Upfront Security Deposit & Task Scam UPI demand',
      },
    ],
  },
  {
    id: 'digital_arrest',
    title: 'Digital Arrest Cyber Extortion',
    subtitle: 'Fake Customs / Police intimidation demanding money transfer',
    initialScore: 92,
    messages: [
      {
        sender: 'recruiter',
        senderName: 'DCP Crime Investigation Officer',
        time: '10:05',
        text: 'CRITICAL NOTICE: A consignment sent from Delhi Airport containing contraband drugs and 5 fake passports has been traced to your Aadhaar card number.',
        risk: 'high',
      },
      {
        sender: 'victim',
        senderName: 'You',
        time: '10:06',
        text: 'Sir I have never sent any courier! This is some mistake.',
        risk: 'none',
      },
      {
        sender: 'recruiter',
        senderName: 'DCP Crime Investigation Officer',
        time: '10:07',
        text: 'You are under 24-hour Digital Arrest. To avoid instant physical arrest warrant, transfer ₹45,000 government clearance verification bond to RBI safety account right now.',
        risk: 'critical',
        trigger: 'Digital Arrest Extortion & Urgent Fund Transfer',
      },
    ],
  },
  {
    id: 'fake_job_offer',
    title: 'Fake Tata Motors Offer Letter',
    subtitle: 'Bogus recruitment letter demanding onboarding laptop fee',
    initialScore: 84,
    messages: [
      {
        sender: 'recruiter',
        senderName: 'Tata Careers Placement Desk',
        time: '11:15',
        text: 'Congratulations! You have been selected for Senior Executive role with Tata Motors Limited. Direct offer letter issued with ₹12,00,000 CTC.',
        risk: 'medium',
      },
      {
        sender: 'victim',
        senderName: 'You',
        time: '11:16',
        text: 'Thank you! But I never attended an interview round?',
        risk: 'none',
      },
      {
        sender: 'recruiter',
        senderName: 'Tata Careers Placement Desk',
        time: '11:17',
        text: 'Selection was made based on your resume. To receive your official gate pass and company laptop, please pay ₹2,500 courier and registration fee to tatarecruit@gmail.com.',
        risk: 'critical',
        trigger: 'Free Gmail Domain & Mandatory Laptop Registration Fee',
      },
    ],
  },
];

export default function TelegramSimulator({ onScenarioStep }) {
  const [activeScenarioId, setActiveScenarioId] = useState('task_scam');
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const messagesEndRef = useRef(null);

  const scenario =
    TELEGRAM_SCENARIOS.find((s) => s.id === activeScenarioId) ||
    TELEGRAM_SCENARIOS[0];

  const visibleMessages = scenario.messages.slice(0, currentStep);

  // When step changes, propagate visible text to Live Monitor Analysis
  useEffect(() => {
    const combinedText = visibleMessages.map((m) => m.text).join('\n');
    const analysis = analyzeScam(combinedText, scenario.title);
    if (onScenarioStep) {
      onScenarioStep({
        ...analysis,
        timestamp: new Date().toLocaleTimeString(),
        source: 'Telegram Scenario Simulator',
      });
    }
  }, [currentStep, activeScenarioId, onScenarioStep, scenario.title, visibleMessages]);

  // Auto-play timer
  useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < scenario.messages.length) {
            return prev + 1;
          } else {
            setIsAutoPlaying(false);
            return prev;
          }
        });
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, scenario.messages.length]);

  const handleNextMessage = () => {
    if (currentStep < scenario.messages.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleResetScenario = () => {
    setIsAutoPlaying(false);
    setCurrentStep(1);
  };

  const handleSelectScenario = (id) => {
    setIsAutoPlaying(false);
    setActiveScenarioId(id);
    setCurrentStep(1);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 transition-colors space-y-4">
      {/* Header & Scenario Selection Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#eff6ff] dark:bg-blue-950/40 border border-[#dbeafe] dark:border-blue-900/50 flex items-center justify-center text-[#2563eb] dark:text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0f172a] dark:text-white tracking-tight">
              Telegram Chat Threat Simulator
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Simulates live conversational fraud vectors in real time
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              isAutoPlaying
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-[#2563eb] hover:bg-blue-700 text-white shadow-xs'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isAutoPlaying ? 'Auto-Playing...' : 'Auto-Play Sequence'}</span>
          </button>

          <button
            type="button"
            onClick={handleNextMessage}
            disabled={currentStep >= scenario.messages.length}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Send Next Message
          </button>

          <button
            type="button"
            onClick={handleResetScenario}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Reset scenario"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scenario Pills Selector */}
      <div className="flex flex-wrap gap-2">
        {TELEGRAM_SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => handleSelectScenario(sc.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              activeScenarioId === sc.id
                ? 'bg-[#2563eb] text-white border-blue-600 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            {sc.title}
          </button>
        ))}
      </div>

      {/* Telegram Chat Simulation Window */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[#f1f5f9]/70 dark:bg-[#070b14] p-4 min-h-[300px] flex flex-col justify-between">
        {/* Messages Container */}
        <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
          {visibleMessages.map((msg, idx) => {
            const isRecruiter = msg.sender === 'recruiter';
            const isCritical = msg.risk === 'critical';

            return (
              <div
                key={idx}
                className={`flex flex-col ${isRecruiter ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs transition-all ${
                    isRecruiter
                      ? isCritical
                        ? 'bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200'
                        : 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      : 'bg-[#2563eb] text-white font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-[10px] opacity-80">
                      {msg.senderName}
                    </span>
                    <span className="text-[9px] opacity-70 font-mono">
                      {msg.time}
                    </span>
                  </div>

                  <p className="leading-relaxed">{msg.text}</p>

                  {isCritical && msg.trigger && (
                    <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-800/60 flex items-center gap-1.5 text-[10px] font-bold text-[#dc2626] dark:text-red-400">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>FLAGGED TRIGGER: {msg.trigger}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer input placeholder */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Guardian Active • Listening for payment demands
          </span>
          <span className="font-mono text-[11px]">
            Step {currentStep} of {scenario.messages.length}
          </span>
        </div>
      </div>
    </div>
  );
}
