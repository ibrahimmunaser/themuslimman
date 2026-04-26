"use client";

interface TextViewerProps {
  content: string;
  className?: string;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineFormat(line: string): string {
  return escapeHtml(line)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
}

function formatText(raw: string): string {
  const lines = raw.split("\n");
  let html = "";
  let inList = false;
  let inOrderedList = false;

  const closeList = () => {
    if (inList) { html += "</ul>"; inList = false; }
    if (inOrderedList) { html += "</ol>"; inOrderedList = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip pure separator lines (===, ---, ___)
    if (/^[=\-_]{3,}$/.test(line)) continue;

    // Markdown headings
    if (line.startsWith("### ")) {
      closeList();
      html += `<h3>${inlineFormat(line.slice(4))}</h3>`;
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      html += `<h2>${inlineFormat(line.slice(3))}</h2>`;
      continue;
    }
    if (line.startsWith("# ")) {
      closeList();
      html += `<h1>${inlineFormat(line.slice(2))}</h1>`;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      closeList();
      html += `<blockquote>${inlineFormat(line.slice(2))}</blockquote>`;
      continue;
    }

    // Unordered list: "- " or "* "
    const ulMatch = line.match(/^[-*]\s+(.+)/);
    if (ulMatch) {
      if (inOrderedList) { html += "</ol>"; inOrderedList = false; }
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${inlineFormat(ulMatch[1])}</li>`;
      continue;
    }

    // Ordered list: "1. " "2. " etc.
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (inList) { html += "</ul>"; inList = false; }
      if (!inOrderedList) { html += "<ol>"; inOrderedList = true; }
      html += `<li>${inlineFormat(olMatch[1])}</li>`;
      continue;
    }

    // Table row (tab-separated or | separated)
    if (line.includes("\t") && !line.startsWith(" ")) {
      closeList();
      const cells = line.split("\t").filter(Boolean);
      const cellHtml = cells.map((c) => `<td>${inlineFormat(c.trim())}</td>`).join("");
      html += `<table><tr>${cellHtml}</tr></table>`;
      continue;
    }

    // Empty line
    if (line === "") {
      closeList();
      continue;
    }

    // Heuristic: short standalone line (no punctuation end, ≤ 80 chars) → treat as section heading
    // only if the next non-empty line is not another plain line (i.e., it's followed by content)
    const nextLine = lines.slice(i + 1).find((l) => l.trim() !== "")?.trim() ?? "";
    if (
      line.length <= 80 &&
      !line.endsWith(".") &&
      !line.endsWith(",") &&
      !line.endsWith(":") &&
      !line.startsWith(" ") &&
      !/^[-*\d]/.test(line) &&
      nextLine !== "" &&
      !inList &&
      !inOrderedList
    ) {
      closeList();
      // Use h2 for lines that look like document titles (contain "Briefing" or "Report" etc.)
      if (i === 0 || /briefing|report|statement|study guide/i.test(line)) {
        html += `<h1>${inlineFormat(line)}</h1>`;
      } else {
        html += `<h2>${inlineFormat(line)}</h2>`;
      }
      continue;
    }

    // Regular paragraph
    closeList();
    html += `<p>${inlineFormat(line)}</p>`;
  }

  closeList();
  return html;
}

export function TextViewer({ content, className }: TextViewerProps) {
  const html = formatText(content);

  return (
    <div
      className={`formatted-text ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
