import { NextRequest, NextResponse } from "next/server";
import { r2StreamFile, r2GetMetadata, generateETag, isCached } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function getMimeType(key: string): string {
  const ext = key.substring(key.lastIndexOf(".")).toLowerCase();
  return MIME[ext] ?? "application/octet-stream";
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const relPath = searchParams.get("p");

  if (!relPath) return new NextResponse("Missing path", { status: 400 });

  try {
    // Remove leading slash if present and construct R2 key
    const key = relPath.startsWith("/") ? relPath.slice(1) : relPath;

    // Get file metadata
    const metadata = await r2GetMetadata(key);
    
    if (!metadata) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Generate ETag and check cache
    const etag = generateETag({ size: metadata.size, lastModified: metadata.lastModified });
    const clientETag = req.headers.get("if-none-match");
    
    if (isCached(etag, clientETag)) {
      return new NextResponse(null, { status: 304 });
    }

    // Determine content type
    const contentType = getMimeType(key);

    // Stream file from R2
    const response = await r2StreamFile(key);
    
    if (!response.Body) {
      return new NextResponse("Error reading file", { status: 500 });
    }

    const stream = response.Body.transformToWebStream();

    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(metadata.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": etag,
      },
    });
  } catch (error) {
    console.error("Error streaming image from R2:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
