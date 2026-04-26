/**
 * seed-assets.ts
 *
 * Scans the local Seerah-data directory and inserts one SeerahPartAsset row
 * per discovered file into Supabase (via Prisma).
 *
 * Asset types written:
 *   video · audio · mindmap
 *   infographic_concise · infographic_standard · infographic_bento
 *   briefing · statement_of_facts · study_guide · report
 *   flashcards · quiz_data
 *   slide_presented · slide_detailed · slide_facts
 *
 * Run:  npx tsx prisma/seed-assets.ts
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

import {
  SEERAH_ROOT,
  videoExists,
  audioExists,
  getAudioFilename,
  mindmapExists,
  getInfographicFilename,
  getSlideFiles,
  readBriefing,
  readStatementOfFacts,
  readStudyGuide,
  readReport,
  readFlashcards,
  readQuiz,
} from "../lib/files";

const prisma = new PrismaClient();

const pad2 = (n: number) => String(n).padStart(2, "0");

// ─────────────────────────────────────────────────────────────────────────────

type AssetRow = {
  assetType: string;
  title: string;
  url: string | null;
  filePath: string | null;
  assetOrder: number;
  metadataJson: string | null;
};

function assetsForPart(partNum: number): AssetRow[] {
  const rows: AssetRow[] = [];
  const n = partNum;

  // ── Video ──────────────────────────────────────────────────────────────────
  if (videoExists(n)) {
    rows.push({
      assetType:    "video",
      title:        `Part ${n} — Video`,
      url:          `/api/media/video/${n}`,
      filePath:     `Videos/Part ${n}.mp4`,
      assetOrder:   0,
      metadataJson: null,
    });
  }

  // ── Audio ──────────────────────────────────────────────────────────────────
  const audioFile = getAudioFilename(n);
  if (audioFile) {
    rows.push({
      assetType:    "audio",
      title:        `Part ${n} — Audio`,
      url:          `/api/media/audio/${n}`,
      filePath:     `Audio/${audioFile}`,
      assetOrder:   0,
      metadataJson: null,
    });
  }

  // ── Mindmap ────────────────────────────────────────────────────────────────
  if (mindmapExists(n)) {
    rows.push({
      assetType:    "mindmap",
      title:        `Part ${n} — Mindmap`,
      url:          `/seerah-media/Mindmaps/Part ${n} - Mindmap.png`,
      filePath:     `Mindmaps/Part ${n} - Mindmap.png`,
      assetOrder:   0,
      metadataJson: null,
    });
  }

  // ── Infographics ───────────────────────────────────────────────────────────
  const infographicStyles = [
    { style: "Concise",    assetType: "infographic_concise" },
    { style: "Standard",   assetType: "infographic_standard" },
    { style: "Bento Grid", assetType: "infographic_bento" },
  ] as const;

  for (const { style, assetType } of infographicStyles) {
    const filename = getInfographicFilename(n, style);
    if (filename) {
      rows.push({
        assetType,
        title:        `Part ${n} — Infographic (${style})`,
        url:          `/seerah-media/Infographics/${style}/${filename}`,
        filePath:     `Infographics/${style}/${filename}`,
        assetOrder:   0,
        metadataJson: null,
      });
    }
  }

  // ── Text documents (content stored in DB) ─────────────────────────────────
  const briefing = readBriefing(n);
  if (briefing) {
    rows.push({
      assetType:    "briefing",
      title:        `Part ${n} — Briefing`,
      url:          null,
      filePath:     `Briefing/Part ${n} Briefing Document.txt`,
      assetOrder:   0,
      metadataJson: briefing,
    });
  }

  const sof = readStatementOfFacts(n);
  if (sof) {
    rows.push({
      assetType:    "statement_of_facts",
      title:        `Part ${n} — Statement of Facts`,
      url:          null,
      filePath:     `StatementOfFacts/Part ${n} - Statement of Facts.txt`,
      assetOrder:   0,
      metadataJson: sof,
    });
  }

  const guide = readStudyGuide(n);
  if (guide) {
    rows.push({
      assetType:    "study_guide",
      title:        `Part ${n} — Study Guide`,
      url:          null,
      filePath:     `Studyguides/Part ${n} - Study Guide.txt`,
      assetOrder:   0,
      metadataJson: guide,
    });
  }

  const report = readReport(n);
  if (report) {
    rows.push({
      assetType:    "report",
      title:        `Part ${n} — Report`,
      url:          null,
      filePath:     null,           // variable filename — content stored in DB
      assetOrder:   0,
      metadataJson: report,
    });
  }

  // ── Flashcards (JSON stored in DB) ────────────────────────────────────────
  const flashcards = readFlashcards(n);
  if (flashcards) {
    rows.push({
      assetType:    "flashcards",
      title:        `Part ${n} — Flashcards`,
      url:          null,
      filePath:     `Flashcards/Part_${pad2(n)}.json`,
      assetOrder:   0,
      metadataJson: JSON.stringify(flashcards),
    });
  }

  // ── Quiz data (JSON stored in DB) ─────────────────────────────────────────
  const quiz = readQuiz(n);
  if (quiz) {
    rows.push({
      assetType:    "quiz_data",
      title:        `Part ${n} — Quiz`,
      url:          null,
      filePath:     `Quizzes/Part_${pad2(n)}.json`,
      assetOrder:   0,
      metadataJson: JSON.stringify(quiz),
    });
  }

  // ── Slides ─────────────────────────────────────────────────────────────────
  const slideTypes = [
    { type: "presented" as const, assetType: "slide_presented" },
    { type: "detailed"  as const, assetType: "slide_detailed"  },
    { type: "facts"     as const, assetType: "slide_facts"     },
  ];

  for (const { type, assetType } of slideTypes) {
    const files = getSlideFiles(n, type);
    files.forEach((relPath, i) => {
      rows.push({
        assetType,
        title:        `Part ${n} — ${type.charAt(0).toUpperCase() + type.slice(1)} Slide ${i + 1}`,
        url:          `/api/media/slides/${relPath}`,
        filePath:     relPath,
        assetOrder:   i,
        metadataJson: null,
      });
    });
  }

  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n→ Seerah asset seeder");
  console.log(`  Data root : ${SEERAH_ROOT}`);
  console.log(`  Exists    : ${fs.existsSync(SEERAH_ROOT)}\n`);

  if (!fs.existsSync(SEERAH_ROOT)) {
    console.error("✗ Seerah-data directory not found. Set SEERAH_DATA_DIR env var if it's in a non-default location.");
    process.exit(1);
  }

  const parts = await prisma.seerahPart.findMany({ orderBy: { partNumber: "asc" } });
  console.log(`  Parts in DB: ${parts.length}\n`);

  let totalCreated = 0;
  const summary: Record<string, number> = {};

  for (const part of parts) {
    const n = part.partNumber;
    const rows = assetsForPart(n);

    if (rows.length === 0) {
      console.log(`  Part ${String(n).padStart(3)}: — (no assets found)`);
      continue;
    }

    // Wipe existing assets for this part then re-insert
    await prisma.seerahPartAsset.deleteMany({ where: { seerahPartId: part.id } });

    await prisma.seerahPartAsset.createMany({
      data: rows.map((r) => ({
        seerahPartId: part.id,
        assetType:    r.assetType,
        title:        r.title,
        url:          r.url,
        filePath:     r.filePath,
        assetOrder:   r.assetOrder,
        metadataJson: r.metadataJson,
        isActive:     true,
      })),
    });

    totalCreated += rows.length;

    // Tally by type
    for (const r of rows) {
      summary[r.assetType] = (summary[r.assetType] ?? 0) + 1;
    }

    const types = [...new Set(rows.map((r) => r.assetType))].join(", ");
    console.log(`  Part ${String(n).padStart(3)}: ${String(rows.length).padStart(3)} assets  [${types}]`);
  }

  console.log("\n──────────────────────────────────────────────");
  console.log("  Asset type breakdown:");
  for (const [type, count] of Object.entries(summary).sort()) {
    console.log(`    ${type.padEnd(24)} ${count}`);
  }
  console.log("──────────────────────────────────────────────");
  console.log(`  Total rows inserted: ${totalCreated}`);
  console.log("✓ Done.\n");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
