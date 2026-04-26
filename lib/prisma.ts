// Re-export the shared PrismaClient instance.
// Import from "@/lib/db" throughout the app; this file exists for
// compatibility with tooling that expects a lib/prisma entry point.
export { prisma } from "./db";
