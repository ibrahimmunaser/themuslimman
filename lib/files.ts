import fs from "fs";
import path from "path";

export const SEERAH_ROOT =
  process.env.SEERAH_DATA_DIR ?? path.resolve(process.cwd(), "..", "Seerah-data");

// ─── Audio ───────────────────────────────────────────────────────────────────
// Some files have a " (1)" suffix (Windows duplicate naming artifact)

export function getAudioFilename(partNum: number): string | null {
  const withSuffix = path.join(SEERAH_ROOT, "Audio", `Part ${partNum} (1).wav`);
  if (fs.existsSync(withSuffix)) return `Part ${partNum} (1).wav`;

  const normal = path.join(SEERAH_ROOT, "Audio", `Part ${partNum}.wav`);
  if (fs.existsSync(normal)) return `Part ${partNum}.wav`;

  return null;
}

// ─── Text file reader ─────────────────────────────────────────────────────────

export function readTextFile(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

// ─── Briefing ─────────────────────────────────────────────────────────────────

export function readBriefing(partNum: number): string | null {
  const p = path.join(SEERAH_ROOT, "Briefing", `Part ${partNum} Briefing Document.txt`);
  return readTextFile(p);
}

// ─── Statement of Facts ───────────────────────────────────────────────────────

export function readStatementOfFacts(partNum: number): string | null {
  const p = path.join(SEERAH_ROOT, "StatementOfFacts", `Part ${partNum} - Statement of Facts.txt`);
  return readTextFile(p);
}

// ─── Study Guide ──────────────────────────────────────────────────────────────
// Part 1 is .docx — skip it (no easy server-side docx reader without a dep)

export function readStudyGuide(partNum: number): string | null {
  const txt = path.join(SEERAH_ROOT, "Studyguides", `Part ${partNum} - Study Guide.txt`);
  if (fs.existsSync(txt)) return readTextFile(txt);

  // .docx exists but we can't parse it without a library — return null for now
  return null;
}

// ─── Report ───────────────────────────────────────────────────────────────────
// Report filenames have variable titles, so we glob the directory

export function readReport(partNum: number): string | null {
  const dir = path.join(SEERAH_ROOT, "Reports");
  try {
    const files = fs.readdirSync(dir);
    const prefix = `Part ${partNum} - Report`;
    const match = files.find(
      (f) => f.startsWith(prefix) && (f.endsWith(".txt") || f.endsWith(".docx"))
    );
    if (!match) return null;
    if (match.endsWith(".docx")) return null; // skip docx without parser
    return readTextFile(path.join(dir, match));
  } catch {
    return null;
  }
}

// ─── Image existence check ────────────────────────────────────────────────────

export function mindmapExists(partNum: number): boolean {
  return fs.existsSync(path.join(SEERAH_ROOT, "Mindmaps", `Part ${partNum} - Mindmap.png`));
}

/**
 * Infographic filenames differ by style:
 *   Standard/Concise: "Part N - Infographic.png" (sometimes "Part N - Infographic - 2.png" or "Part N - Infographic 2.png")
 *   Bento Grid:       "Part N.png"
 * We scan the directory for the first matching file so naming quirks don't break things.
 */
export function getInfographicFilename(partNum: number, style: "Bento Grid" | "Concise" | "Standard"): string | null {
  const dir = path.join(SEERAH_ROOT, "Infographics", style);
  try {
    const files = fs.readdirSync(dir);

    if (style === "Bento Grid") {
      return files.find((f) => f === `Part ${partNum}.png`) ?? null;
    }

    // Standard / Concise: strict match first ("Part N - Infographic*.png")
    const strictPrefix = `Part ${partNum} - Infographic`;
    const strictMatch = files.find((f) => f.startsWith(strictPrefix) && f.endsWith(".png"));
    if (strictMatch) return strictMatch;

    // Fallback: some files use non-standard names like "Part N-2.png", "Part N.png",
    // "Part N -2.png", "Part N- Infographic 2.png". Match any PNG that starts with
    // "Part {n}" followed by a non-digit character (prevents Part 4 matching Part 42, etc.)
    const looseRe = new RegExp(`^Part ${partNum}[^0-9]`);
    return files.find((f) => f.endsWith(".png") && looseRe.test(f)) ?? null;
  } catch {
    return null;
  }
}

export function infographicExists(partNum: number, style: "Bento Grid" | "Concise" | "Standard"): boolean {
  return getInfographicFilename(partNum, style) !== null;
}

// ─── Slides ───────────────────────────────────────────────────────────────────
// Presented: "Slides - Watermark - Presented/Part 01/" (zero-padded to 2 digits, but 100 is "Part 100")
// Detailed:  "Slides - Watermark - Detailed/Part N Watermark/" (no padding)
// Facts:     "Slides - Watermark - Facts/Part N/" (no padding)

function zeroPad(n: number): string {
  if (n < 10) return `0${n}`;
  return `${n}`;
}

export function getPresentedSlideFolder(partNum: number): string {
  const padded = zeroPad(partNum);
  return path.join(SEERAH_ROOT, "Slides - Watermark - Presented", `Part ${padded}`);
}

export function getDetailedSlideFolder(partNum: number): string {
  return path.join(SEERAH_ROOT, "Slides - Watermark - Detailed", `Part ${partNum} Watermark`);
}

export function getFactsSlideFolder(partNum: number): string {
  return path.join(SEERAH_ROOT, "Slides - Watermark - Facts", `Part ${partNum}`);
}

export function getSlideFiles(partNum: number, type: "presented" | "detailed" | "facts"): string[] {
  let folder: string;
  if (type === "presented") folder = getPresentedSlideFolder(partNum);
  else if (type === "detailed") folder = getDetailedSlideFolder(partNum);
  else folder = getFactsSlideFolder(partNum);

  try {
    if (!fs.existsSync(folder)) return [];
    return fs
      .readdirSync(folder)
      .filter((f) => f.endsWith(".png"))
      .sort()
      .map((f) => {
        // Return relative path from SEERAH_ROOT for use in the API
        const rel = path.relative(SEERAH_ROOT, path.join(folder, f));
        return rel.replace(/\\/g, "/"); // normalize to forward slashes
      });
  } catch {
    return [];
  }
}

// ─── Flashcards ───────────────────────────────────────────────────────────────

export function readFlashcards(partNum: number): import("./types").FlashcardSet | null {
  const pad = partNum < 10 ? `0${partNum}` : `${partNum}`;
  const p = path.join(SEERAH_ROOT, "Flashcards", `Part_${pad}.json`);
  try {
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export function readQuiz(partNum: number): import("./types").Quiz | null {
  const pad = partNum < 10 ? `0${partNum}` : `${partNum}`;
  const p = path.join(SEERAH_ROOT, "Quizzes", `Part_${pad}.json`);
  try {
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Video / Audio existence ──────────────────────────────────────────────────

export function videoExists(partNum: number): boolean {
  return fs.existsSync(path.join(SEERAH_ROOT, "Videos", `Part ${partNum}.mp4`));
}

export function audioExists(partNum: number): boolean {
  return getAudioFilename(partNum) !== null;
}
