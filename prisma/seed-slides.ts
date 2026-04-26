/**
 * seed-slides.ts
 *
 * Scans the three watermarked slide folders and upserts one SeerahPartAsset
 * row per slide image into Supabase.
 *
 * Asset types:
 *   slide_presented  – Slides - Watermark - Presented / Part 0N / *.png
 *   slide_detailed   – Slides - Watermark - Detailed  / Part N Watermark / *.png
 *   slide_facts      – Slides - Watermark - Facts     / Part N / *.png
 *
 * Run: npx tsx prisma/seed-slides.ts
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEERAH_ROOT =
  process.env.SEERAH_DATA_DIR ??
  path.resolve(process.cwd(), "..", "Seerah-data");

// ─── helpers ─────────────────────────────────────────────────────────────────

function getPngs(dir: string): string[] {
  try {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.toLowerCase().endsWith(".png"))
      .sort();
  } catch {
    return [];
  }
}

async function upsertSlide(data: {
  seerahPartId: string;
  assetType: string;
  title: string;
  url: string;
  filePath: string;
  assetOrder: number;
}) {
  const existing = await prisma.seerahPartAsset.findFirst({
    where: {
      seerahPartId: data.seerahPartId,
      assetType: data.assetType,
      assetOrder: data.assetOrder,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.seerahPartAsset.update({
      where: { id: existing.id },
      data: { title: data.title, url: data.url, filePath: data.filePath, isActive: true },
    });
  } else {
    await prisma.seerahPartAsset.create({ data: { ...data, isActive: true } });
  }
}

// ─── main ─────────────────────────────────────────────────────────────────────

const SETS: Array<{
  assetType: string;
  folderFn: (n: number) => string;
  urlBase: string;
}> = [
  {
    assetType: "slide_presented",
    folderFn: (n) => {
      const pad = n < 10 ? `0${n}` : `${n}`;
      return path.join(SEERAH_ROOT, "Slides - Watermark - Presented", `Part ${pad}`);
    },
    urlBase: "Slides - Watermark - Presented",
  },
  {
    assetType: "slide_detailed",
    folderFn: (n) =>
      path.join(SEERAH_ROOT, "Slides - Watermark - Detailed", `Part ${n} Watermark`),
    urlBase: "Slides - Watermark - Detailed",
  },
  {
    assetType: "slide_facts",
    folderFn: (n) =>
      path.join(SEERAH_ROOT, "Slides - Watermark - Facts", `Part ${n}`),
    urlBase: "Slides - Watermark - Facts",
  },
];

async function main() {
  if (!fs.existsSync(SEERAH_ROOT)) {
    console.error(`✗  Seerah-data not found at: ${SEERAH_ROOT}`);
    process.exit(1);
  }

  console.log(`→  Seeding slides from: ${SEERAH_ROOT}\n`);

  const parts = await prisma.seerahPart.findMany({
    select: { id: true, partNumber: true },
    orderBy: { partNumber: "asc" },
  });

  let grandTotal = 0;

  for (const { assetType, folderFn, urlBase } of SETS) {
    console.log(`── ${assetType} ──`);
    let setTotal = 0;

    for (const part of parts) {
      const n = part.partNumber;
      const folder = folderFn(n);
      const pngs = getPngs(folder);

      if (pngs.length === 0) continue;

      process.stdout.write(`  Part ${String(n).padStart(3)} — ${pngs.length} slides ... `);

      for (let i = 0; i < pngs.length; i++) {
        const filename = pngs[i];
        const subfolder = path.relative(SEERAH_ROOT, folder).replace(/\\/g, "/");
        await upsertSlide({
          seerahPartId: part.id,
          assetType,
          title: `Part ${n} — Slide ${i + 1}`,
          url: `/seerah-media/${urlBase}/${path.basename(folder)}/${filename}`,
          filePath: `${subfolder}/${filename}`,
          assetOrder: i + 1,
        });
      }

      setTotal += pngs.length;
      console.log("✓");
    }

    console.log(`  → ${setTotal} slides\n`);
    grandTotal += setTotal;
  }

  console.log(`✓  Done. ${grandTotal} slide rows upserted.\n`);
}

main()
  .catch((e) => { console.error("✗  Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
