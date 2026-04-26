import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { SEERAH_ROOT } from "@/lib/files";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const relPath = searchParams.get("p");

  if (!relPath) return new NextResponse("Missing path", { status: 400 });

  const resolved = path.resolve(SEERAH_ROOT, relPath);
  if (!resolved.startsWith(SEERAH_ROOT)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (!fs.existsSync(resolved)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const stat = fs.statSync(resolved);
  const etag = `"${stat.mtimeMs}-${stat.size}"`;

  // Return 304 if browser already has the current version
  if (req.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304 });
  }

  const ext = path.extname(resolved).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";

  const nodeStream = fs.createReadStream(resolved, {
    highWaterMark: 64 * 1024,
  });
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      // ETag-based revalidation — fast 304s for unchanged files, fresh content when replaced
      "Cache-Control": "public, no-cache, must-revalidate",
      "ETag": `"${stat.mtimeMs}-${stat.size}"`,
    },
  });
}
