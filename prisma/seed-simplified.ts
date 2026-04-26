/**
 * Simplified seed script for direct-to-student Seerah LMS
 *
 * Populates:
 *  - 100 SeerahPart rows from lib/content.ts
 *  - Platform admin account (themuslimman_admin)
 *  - Course template: "Full Seerah — All 100 Parts"
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PARTS } from "../lib/content";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ﷺ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function moduleFor(era: string): string {
  switch (era) {
    case "pre-islamic":       return "Pre-Islamic Arabia";
    case "birth-early-life":  return "Birth & Early Life";
    case "early-revelation":  return "Beginning of Revelation";
    case "makkah-persecution":return "Makkah — Persecution";
    case "hijrah":            return "The Hijrah";
    case "madinah":           return "Madinah Period";
    case "campaigns":         return "Major Campaigns";
    case "final-years":       return "Final Years & Legacy";
    default:                  return "Module";
  }
}

async function main() {
  console.log("→ Seeding simplified Seerah LMS…");

  // ── 1. Seerah parts ───────────────────────────────────────────────────────
  console.log(`  • Importing ${PARTS.length} Seerah parts`);
  for (const p of PARTS) {
    const slug = `part-${p.partNumber}-${slugify(p.title)}`;
    await prisma.seerahPart.upsert({
      where: { partNumber: p.partNumber },
      create: {
        partNumber: p.partNumber, 
        title: p.title, 
        slug,
        subtitle: p.subtitle ?? null, 
        era: p.era,
        shortDescription: p.description, 
        orderIndex: p.partNumber,
        includedInEssentials: p.includedInEssentials, 
        isPublished: true,
      },
      update: {
        title: p.title, 
        slug, 
        subtitle: p.subtitle ?? null, 
        era: p.era,
        shortDescription: p.description, 
        orderIndex: p.partNumber,
        includedInEssentials: p.includedInEssentials,
      },
    });
  }

  // ── 2. Platform admin (if doesn't exist) ──────────────────────────────────
  console.log("  • Checking platform admin account");
  const existingAdmin = await prisma.user.findUnique({
    where: { username: "themuslimman_admin" },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash("Chemithabet22?", 12);
    await prisma.user.create({
      data: {
        username: "themuslimman_admin",
        email: "themuslimman77@gmail.com",
        fullName: "TheMuslimMan Admin",
        passwordHash,
        role: "platform_admin",
        isActive: true,
        emailVerified: true,
      },
    });
    console.log("    ✓ Platform admin created");
  } else {
    console.log("    ✓ Platform admin already exists");
  }

  // ── 3. Course template ────────────────────────────────────────────────────
  console.log("  • Master course template: Full Seerah");
  const template = await prisma.courseTemplate.upsert({
    where: { slug: "full-seerah" },
    create: {
      title: "Full Seerah — All 100 Parts",
      slug: "full-seerah",
      description: "Complete biography of Prophet Muhammad ﷺ from birth to death, covering all major events, battles, and lessons.",
      isActive: true,
    },
    update: {
      isActive: true,
    },
  });

  // Link all 100 parts to the course template
  console.log("  • Linking 100 parts to course template");
  await prisma.courseTemplateItem.deleteMany({ 
    where: { courseTemplateId: template.id } 
  });
  
  const partRows = await prisma.seerahPart.findMany({ 
    orderBy: { partNumber: "asc" } 
  });
  
  await prisma.courseTemplateItem.createMany({
    data: partRows.map((p, i) => ({
      courseTemplateId: template.id,
      seerahPartId: p.id,
      moduleName: moduleFor(p.era),
      itemOrder: i,
    })),
  });

  console.log("\n✓ Seed complete!\n");
  console.log("Platform Details:");
  console.log("  • 100 Seerah parts imported");
  console.log("  • Full Seerah course template created");
  console.log("  • Admin account: themuslimman_admin");
  console.log("  • Password: Chemithabet22?\n");
}

main()
  .catch((err) => { 
    console.error("❌ Seed error:", err); 
    process.exit(1); 
  })
  .finally(() => prisma.$disconnect());
