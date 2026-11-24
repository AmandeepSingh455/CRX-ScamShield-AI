import React from "react";

/**
 * Maps common superscript exponents to Unicode characters.
 */
const SUPERSCRIPTS = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  "n": "ⁿ",
  "i": "ⁱ",
  "x": "ˣ",
};

/**
 * Sanitizes math delimiters ($$, $, \(, \)) and replaces LaTeX operators with Unicode.
 */
function cleanMathDelimiters(text) {
  if (!text) return "";
  let cleaned = text;

  // Convert standard powers like x^2, (a+b)^2, 7^2, 10^3, x^{2} to Unicode superscripts
  cleaned = cleaned.replace(/\^\{?([0-9nix+-]+)\}?/g, (match, exp) => {
    return exp
      .split("")
      .map((char) => SUPERSCRIPTS[char] || char)
      .join("");
  });

  // Replace common LaTeX symbols with Unicode equivalents
  cleaned = cleaned
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\pm/g, "±")
    .replace(/\\approx/g, "≈")
    .replace(/\\le(q)?\b/g, "≤")
    .replace(/\\ge(q)?\b/g, "≥")
    .replace(/\\neq\b/g, "≠")
    .replace(/\\rightarrow/g, "→")
    .replace(/\\infty/g, "∞")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    .replace(/\\sqrt/g, "√")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
    .replace(/\\left\(/g, "(")
    .replace(/\\right\)/g, ")")
    .replace(/\\left\[/g, "[")
    .replace(/\\right\]/g, "]")
    .replace(/\\left\\\{/g, "{")
    .replace(/\\right\\\}/g, "}");

  // Remove \[ \] and \( \)
  cleaned = cleaned
    .replace(/\\\[\s*/g, "")
    .replace(/\s*\\\]/g, "")
    .replace(/\\\(\s*/g, "")
    .replace(/\s*\\\)/g, "");

  // Strip $$ ... $$ and $ ... $
  cleaned = cleaned.replace(/\$\$([^$]+)\$\$/g, "$1");
  cleaned = cleaned.replace(/\$([^$\n]+)\$/g, "$1");

  // Remove any remaining stray math delimiter $
  cleaned = cleaned.replace(/\$(?=[a-zA-Z0-9²³⁰¹⁴⁵⁶⁷⁸⁹⁺⁻ⁿ⁽⁾])/g, "");
  cleaned = cleaned.replace(/(?<=[a-zA-Z0-9²³⁰¹⁴⁵⁶⁷⁸⁹⁺⁻ⁿ⁽⁾])\$/g, "");

  return cleaned;
}

/**
 * Parses inline formatting: bold (**text**), italics (*text*), inline code (`code`).
 */
function renderInlineContent(text) {
  if (!text) return null;

  // First clean math and escape characters
  const sanitized = cleanMathDelimiters(text);

  // Split tokens by code, bold, italic
  const parts = [];
  let remaining = sanitized;
  let keyIndex = 0;

  // Regular expression to match inline code, bold, or italic
  const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = inlineRegex.exec(remaining)) !== null) {
    // Push preceding text
    if (match.index > lastIndex) {
      parts.push(remaining.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={`code-${keyIndex++}`}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono text-[11px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={`bold-${keyIndex++}`} className="font-semibold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      parts.push(
        <em key={`italic-${keyIndex++}`} className="italic text-slate-700 dark:text-slate-300">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = inlineRegex.lastIndex;
  }

  if (lastIndex < remaining.length) {
    parts.push(remaining.substring(lastIndex));
  }

  return parts.length > 0 ? parts : sanitized;
}

/**
 * Main FormattedMessage Component:
 * Handles code blocks, headings, bullet lists, numbered lists, math formulas, and paragraphs.
 */
export default function FormattedMessage({ text = "", isUser = false }) {
  if (!text) return null;

  if (isUser) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  // Split raw text into code-block sections and text sections
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const sections = [];
  let lastIdx = 0;
  let cbMatch;

  while ((cbMatch = codeBlockRegex.exec(text)) !== null) {
    if (cbMatch.index > lastIdx) {
      sections.push({ type: "text", content: text.substring(lastIdx, cbMatch.index) });
    }
    sections.push({
      type: "code",
      language: cbMatch[1] || "",
      code: cbMatch[2].trim(),
    });
    lastIdx = codeBlockRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    sections.push({ type: "text", content: text.substring(lastIdx) });
  }

  return (
    <div className="space-y-2 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
      {sections.map((section, sIdx) => {
        if (section.type === "code") {
          return (
            <div
              key={sIdx}
              className="my-2 rounded-xl bg-slate-950 p-3 text-[11px] font-mono text-slate-200 border border-slate-800 overflow-x-auto shadow-inner"
            >
              {section.language && (
                <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1.5 pb-1 border-b border-slate-800">
                  {section.language}
                </div>
              )}
              <pre className="whitespace-pre overflow-x-auto leading-normal">
                <code>{section.code}</code>
              </pre>
            </div>
          );
        }

        // Process line-by-line in text sections
        const lines = section.content.split("\n");
        const renderedElements = [];
        let currentList = null; // { type: 'ul' | 'ol', items: [] }

        const flushList = () => {
          if (!currentList) return;
          if (currentList.type === "ul") {
            renderedElements.push(
              <ul key={`ul-${renderedElements.length}`} className="my-1.5 space-y-1.5 pl-0.5">
                {currentList.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold text-sm leading-none mt-0.5">•</span>
                    <span className="flex-1">{renderInlineContent(item)}</span>
                  </li>
                ))}
              </ul>
            );
          } else {
            renderedElements.push(
              <ol key={`ol-${renderedElements.length}`} className="my-1.5 space-y-1.5 pl-0.5">
                {currentList.items.map((item, iIdx) => (
                  <li key={iIdx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-semibold text-xs min-w-4 text-right">
                      {item.number}.
                    </span>
                    <span className="flex-1">{renderInlineContent(item.text)}</span>
                  </li>
                ))}
              </ol>
            );
          }
          currentList = null;
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trimEnd();
          const trimmed = line.trim();

          if (!trimmed) {
            flushList();
            continue;
          }

          // Check Headings: #, ##, ###, ####
          const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
          if (headingMatch) {
            flushList();
            const level = headingMatch[1].length;
            const headingText = cleanMathDelimiters(headingMatch[2]);

            renderedElements.push(
              <div
                key={`h-${i}`}
                className={`font-bold text-slate-900 dark:text-white mt-2.5 mb-1 ${
                  level <= 2 ? "text-sm border-b border-slate-200 dark:border-slate-800 pb-1" : "text-xs"
                }`}
              >
                {renderInlineContent(headingText)}
              </div>
            );
            continue;
          }

          // Check Unordered List: "* ", "- ", "• ", "+ "
          const bulletMatch = trimmed.match(/^([*\-•+])\s+(.+)$/);
          if (bulletMatch) {
            if (!currentList || currentList.type !== "ul") {
              flushList();
              currentList = { type: "ul", items: [] };
            }
            currentList.items.push(bulletMatch[2]);
            continue;
          }

          // Check Ordered List: "1. ", "2. ", etc.
          const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.+)$/);
          if (numberedMatch) {
            if (!currentList || currentList.type !== "ol") {
              flushList();
              currentList = { type: "ol", items: [] };
            }
            currentList.items.push({ number: numberedMatch[1], text: numberedMatch[2] });
            continue;
          }

          // Regular paragraph / formula line
          flushList();

          // If the line looks like an equation (contains '=' or arithmetic) without list formatting
          const isEquationLine = trimmed.includes("=") && trimmed.length < 80;
          if (isEquationLine) {
            renderedElements.push(
              <div
                key={`eq-${i}`}
                className="my-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 font-medium text-slate-900 dark:text-slate-100 text-xs border-l-2 border-emerald-500 font-mono tracking-tight"
              >
                {renderInlineContent(trimmed)}
              </div>
            );
          } else {
            renderedElements.push(
              <p key={`p-${i}`} className="leading-relaxed">
                {renderInlineContent(trimmed)}
              </p>
            );
          }
        }

        flushList();
        return <React.Fragment key={sIdx}>{renderedElements}</React.Fragment>;
      })}
    </div>
  );
}
