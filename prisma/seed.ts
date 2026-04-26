/**
 * Seed script for Seerah LMS (v2 — org model).
 *
 * Populates:
 *  - 100 SeerahPart rows from lib/content.ts.
 *  - Demo Organization: "Masjid al-Noor Institute"
 *  - Demo accounts:
 *      platform_admin  →  admin@demo.seerah          (email login)
 *      org_admin       →  username: demo-org-admin   (username login)
 *      teacher         →  username: ustadh-yusuf     (org-managed)
 *      student         →  username: amina-r          (org-managed, mustChangePassword=false)
 *      student         →  username: omar-s           (org-managed, mustChangePassword=true — first-login demo)
 *      extra students  →  usernames: hassan-a, khadija-m, fatima-n
 *      individual_user →  individual@demo.seerah     (public signup demo)
 *  - One course template ("Full Seerah").
 *  - One sample class linked to the demo org.
 *  - Quiz, exam, announcement, progress as before.
 *
 * Password for all demo accounts: seerah123
 * Re-runnable: uses upserts keyed on stable fields.
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PARTS } from "../lib/content";
import { ROLES } from "../lib/roles";

const prisma = new PrismaClient();
const DEMO_PASSWORD = "seerah123";
const HASH_ROUNDS = 10;

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
  console.log("→ Seeding Seerah LMS v2…");

  // ── 1. Seerah parts ───────────────────────────────────────────────────────
  console.log(`  • Importing ${PARTS.length} Seerah parts`);
  for (const p of PARTS) {
    const slug = `part-${p.partNumber}-${slugify(p.title)}`;
    await prisma.seerahPart.upsert({
      where: { partNumber: p.partNumber },
      create: {
        partNumber: p.partNumber, title: p.title, slug,
        subtitle: p.subtitle ?? null, era: p.era,
        shortDescription: p.description, orderIndex: p.partNumber,
        includedInEssentials: p.includedInEssentials, isPublished: true,
      },
      update: {
        title: p.title, slug, subtitle: p.subtitle ?? null, era: p.era,
        shortDescription: p.description, orderIndex: p.partNumber,
        includedInEssentials: p.includedInEssentials,
      },
    });
  }

  // ── 2. Platform admin ─────────────────────────────────────────────────────
  console.log("  • Platform admin");
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, HASH_ROUNDS);

  await prisma.user.upsert({
    where: { email: "admin@demo.seerah" },
    create: {
      fullName: "Platform Admin",
      email: "admin@demo.seerah",
      passwordHash,
      role: ROLES.PLATFORM_ADMIN,
      accountType: "individual",
      isActive: true,
    },
    update: { passwordHash, role: ROLES.PLATFORM_ADMIN, accountType: "individual" },
  });

  // ── 3. Demo organization ──────────────────────────────────────────────────
  console.log("  • Demo organization: Masjid al-Noor Institute");
  const org = await prisma.organization.upsert({
    where: { slug: "masjid-al-noor" },
    create: {
      name: "Masjid al-Noor Institute",
      slug: "masjid-al-noor",
      description: "A community Seerah learning program in the masjid.",
      contactEmail: "admin@masjid-al-noor.demo",
      timezone: "America/New_York",
      isActive: true,
    },
    update: {},
  });

  // ── 4. Org admin ──────────────────────────────────────────────────────────
  console.log("  • Org admin: demo-org-admin");
  await prisma.user.upsert({
    where: { username: "demo-org-admin" },
    create: {
      fullName: "Org Admin",
      username: "demo-org-admin",
      passwordHash,
      role: ROLES.ORG_ADMIN,
      accountType: "organization_managed",
      organizationId: org.id,
      mustChangePassword: false,
      isActive: true,
    },
    update: { passwordHash, organizationId: org.id, mustChangePassword: false },
  });

  // ── 5. Teacher ────────────────────────────────────────────────────────────
  console.log("  • Teacher: ustadh-yusuf");
  const teacherUser = await prisma.user.upsert({
    where: { username: "ustadh-yusuf" },
    create: {
      fullName: "Ustadh Yusuf",
      username: "ustadh-yusuf",
      email: "teacher@demo.seerah",
      passwordHash,
      role: ROLES.TEACHER,
      accountType: "organization_managed",
      organizationId: org.id,
      mustChangePassword: false,
      isActive: true,
      teacher: { create: { bio: "Seerah instructor for over 12 years." } },
    },
    update: { passwordHash, organizationId: org.id, mustChangePassword: false },
    include: { teacher: true },
  });
  if (!teacherUser.teacher) {
    await prisma.teacherProfile.create({ data: { userId: teacherUser.id } });
  }
  const teacher = await prisma.teacherProfile.findUniqueOrThrow({ where: { userId: teacherUser.id } });

  // ── 6. Students ───────────────────────────────────────────────────────────
  console.log("  • Students");

  const studentDefs = [
    { username: "amina-r",  fullName: "Amina Rahman",      email: "student@demo.seerah",   mustChange: false },
    { username: "omar-s",   fullName: "Omar Siddiqi",       email: null,                    mustChange: true  }, // first-login demo
    { username: "hassan-a", fullName: "Hassan Ali",         email: "hassan@demo.seerah",    mustChange: false },
    { username: "khadija-m",fullName: "Khadija Mahmoud",    email: "khadija@demo.seerah",   mustChange: false },
    { username: "fatima-n", fullName: "Fatima Noor",        email: "fatima@demo.seerah",    mustChange: false },
  ];

  const studentProfiles: { profileId: string; name: string }[] = [];

  for (const s of studentDefs) {
    const upserted = await prisma.user.upsert({
      where: { username: s.username },
      create: {
        fullName: s.fullName,
        username: s.username,
        email: s.email ?? undefined,
        passwordHash,
        role: ROLES.STUDENT,
        accountType: "organization_managed",
        organizationId: org.id,
        mustChangePassword: s.mustChange,
        tempPasswordGeneratedAt: s.mustChange ? new Date() : null,
        isActive: true,
        student: { create: {} },
      },
      update: {
        passwordHash,
        organizationId: org.id,
        mustChangePassword: s.mustChange,
      },
      include: { student: true },
    });
    const profile = upserted.student
      ? upserted.student
      : await prisma.studentProfile.upsert({
          where: { userId: upserted.id },
          create: { userId: upserted.id },
          update: {},
        });
    studentProfiles.push({ profileId: profile.id, name: s.fullName });
  }

  // ── 7. Individual user (public signup demo) ───────────────────────────────
  console.log("  • Individual learner: individual@demo.seerah");
  await prisma.user.upsert({
    where: { email: "individual@demo.seerah" },
    create: {
      fullName: "Bilal (Self-Paced)",
      email: "individual@demo.seerah",
      passwordHash,
      role: ROLES.INDIVIDUAL_USER,
      accountType: "individual",
      isActive: true,
    },
    update: { passwordHash, role: ROLES.INDIVIDUAL_USER, accountType: "individual" },
  });

  // ── 8. Course template ────────────────────────────────────────────────────
  console.log("  • Master course template: Full Seerah");
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@demo.seerah" } });
  const template = await prisma.courseTemplate.upsert({
    where: { slug: "full-seerah" },
    create: {
      title: "Full Seerah — All 100 Parts",
      slug: "full-seerah",
      description: "The complete structured Seerah curriculum.",
      createdByAdminId: adminUser!.id,
      isActive: true,
    },
    update: {},
  });
  await prisma.courseTemplateItem.deleteMany({ where: { courseTemplateId: template.id } });
  const partRows = await prisma.seerahPart.findMany({ orderBy: { partNumber: "asc" } });
  await prisma.courseTemplateItem.createMany({
    data: partRows.map((p, i) => ({
      courseTemplateId: template.id,
      seerahPartId: p.id,
      moduleName: moduleFor(p.era),
      itemOrder: i,
    })),
  });

  // ── 9. Sample class (linked to org) ───────────────────────────────────────
  console.log("  • Sample class: Seerah Fall 2026 (org: Masjid al-Noor)");
  const CLASS_JOIN_CODE = "SEERAH-FALL26";
  const sampleClass = await prisma.class.upsert({
    where: { joinCode: CLASS_JOIN_CODE },
    create: {
      organizationId: org.id,
      teacherId: teacher.id,
      title: "Seerah Fall 2026 — Evening Circle",
      slug: "seerah-fall-2026-evening",
      description: "A 12-week guided journey through the early Seerah for adult learners.",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-12-15"),
      status: "active",
      visibility: "private",
      joinCode: CLASS_JOIN_CODE,
      allowAutoJoin: true,
      lockSequence: false,
      showLockedContent: true,
    },
    update: { organizationId: org.id },
  });

  // Enroll all students
  for (const { profileId } of studentProfiles) {
    await prisma.classEnrollment.upsert({
      where: { classId_studentId: { classId: sampleClass.id, studentId: profileId } },
      create: { classId: sampleClass.id, studentId: profileId, status: "active" },
      update: { status: "active" },
    });
  }

  // ── 10. Class course ──────────────────────────────────────────────────────
  console.log("  • Class course: first 12 parts");
  const classCourse = await prisma.classCourse.upsert({
    where: { classId: sampleClass.id },
    create: {
      classId: sampleClass.id,
      courseTemplateId: template.id,
      title: "Early Seerah — 12 Week Plan",
      description: "Pre-Islamic context through the Year of Grief.",
      isCustom: true,
    },
    update: {},
  });
  await prisma.classCourseItem.deleteMany({ where: { classCourseId: classCourse.id } });
  const first12 = partRows.slice(0, 12);
  const courseItems = await prisma.$transaction(
    first12.map((p, i) =>
      prisma.classCourseItem.create({
        data: {
          classCourseId: classCourse.id,
          seerahPartId: p.id,
          moduleName: moduleFor(p.era),
          itemOrder: i,
          isRequired: true,
        },
      })
    )
  );

  // ── 11. Release rules ─────────────────────────────────────────────────────
  console.log("  • Release rules");
  await prisma.releaseRule.deleteMany({ where: { classId: sampleClass.id } });
  const now = new Date();
  for (let i = 0; i < courseItems.length; i++) {
    const item = courseItems[i];
    const release =
      i < 3
        ? { releaseMode: "manual", isReleased: true, releasedAt: now }
        : {
            releaseMode: "scheduled",
            scheduledAt: new Date(now.getTime() + i * 7 * 24 * 60 * 60 * 1000),
            isReleased: false,
          };
    await prisma.releaseRule.create({
      data: {
        classId: sampleClass.id,
        classCourseItemId: item.id,
        targetType: "lesson",
        ...release,
        createdByTeacherId: teacherUser.id,
      },
    });
  }

  // ── 12. Quiz ──────────────────────────────────────────────────────────────
  console.log("  • Sample quiz (Part 1)");
  const part1 = partRows[0];
  await prisma.quiz.deleteMany({ where: { seerahPartId: part1.id, classId: sampleClass.id } });
  const quiz = await prisma.quiz.create({
    data: {
      seerahPartId: part1.id,
      classId: sampleClass.id,
      title: "Part 1 — Pre-Islamic Arabia Quiz",
      quizType: "part_quiz",
      passingScore: 70,
      maxAttempts: 3,
      timeLimitMinutes: 10,
    },
  });
  const questions = [
    { q: "Which peninsula is the primary setting of the Seerah?",      opts: ["Iberian","Arabian","Balkan","Anatolian"],         answer: 1 },
    { q: "What was the dominant social unit in pre-Islamic Arabia?",   opts: ["Nation-state","Monastery","Tribe","Guild"],        answer: 2 },
    { q: "Which two empires bordered Arabia before Islam?",            opts: ["Roman & Mongol","Byzantine & Sassanid","Ottoman & Mughal","Greek & Persian"], answer: 1 },
  ];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const question = await prisma.quizQuestion.create({
      data: { quizId: quiz.id, questionText: q.q, questionType: "multiple_choice", orderIndex: i },
    });
    await prisma.quizOption.createMany({
      data: q.opts.map((text, idx) => ({ questionId: question.id, optionText: text, isCorrect: idx === q.answer, orderIndex: idx })),
    });
  }

  // ── 13. Exam ──────────────────────────────────────────────────────────────
  console.log("  • Sample exam (module-level)");
  await prisma.exam.deleteMany({ where: { classId: sampleClass.id } });
  const exam = await prisma.exam.create({
    data: {
      classId: sampleClass.id,
      title: "Midterm — Pre-Islamic Arabia Module",
      description: "Covers parts 1–10.",
      examScope: "module",
      passingScore: 75,
      isActive: true,
      availableFrom: new Date("2026-11-01"),
      availableUntil: new Date("2026-11-15"),
      maxAttempts: 2,
    },
  });
  await prisma.examPartLink.createMany({
    data: partRows.slice(0, 10).map((p) => ({ examId: exam.id, seerahPartId: p.id })),
  });

  // ── 14. Announcement ──────────────────────────────────────────────────────
  console.log("  • Welcome announcement");
  await prisma.announcement.deleteMany({ where: { classId: sampleClass.id } });
  await prisma.announcement.create({
    data: {
      classId: sampleClass.id,
      teacherId: teacherUser.id,
      title: "Welcome to Seerah Fall 2026",
      body: "Assalamu alaikum. The first three parts are released now. New parts unlock weekly. Reach out if you need help!",
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  // ── 15. Demo progress (amina-r completed Part 1) ──────────────────────────
  const aminaProfile = studentProfiles.find((s) => s.name === "Amina Rahman");
  if (aminaProfile) {
    await prisma.studentProgress.upsert({
      where: { studentId_classCourseItemId: { studentId: aminaProfile.profileId, classCourseItemId: courseItems[0].id } },
      create: {
        classId: sampleClass.id, studentId: aminaProfile.profileId,
        classCourseItemId: courseItems[0].id, status: "completed",
        completionPercentage: 100,
        startedAt: new Date(now.getTime() - 3 * 86400000),
        completedAt: new Date(now.getTime() - 86400000),
        lastAccessedAt: new Date(now.getTime() - 86400000),
      },
      update: {},
    });
    await prisma.studentProgress.upsert({
      where: { studentId_classCourseItemId: { studentId: aminaProfile.profileId, classCourseItemId: courseItems[1].id } },
      create: {
        classId: sampleClass.id, studentId: aminaProfile.profileId,
        classCourseItemId: courseItems[1].id, status: "in_progress",
        completionPercentage: 45,
        startedAt: new Date(now.getTime() - 86400000),
        lastAccessedAt: new Date(),
      },
      update: {},
    });
  }

  console.log("\n✓ Seed complete.\n");
  console.log("Demo credentials (password for all: seerah123):");
  console.log("  platform_admin  →  email: admin@demo.seerah");
  console.log("  org_admin       →  username: demo-org-admin");
  console.log("  teacher         →  username: ustadh-yusuf  (or email: teacher@demo.seerah)");
  console.log("  student (active)→  username: amina-r       (or email: student@demo.seerah)");
  console.log("  student (1st lg)→  username: omar-s        (mustChangePassword=true)");
  console.log("  individual user →  email: individual@demo.seerah");
  console.log(`  class join code →  ${CLASS_JOIN_CODE}\n`);
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
