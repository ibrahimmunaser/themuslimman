import { NextRequest, NextResponse } from "next/server";
import { r2StreamFile, r2GetMetadata, r2GetVideoKey, generateETag, isCached } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ part: string }> }
) {
  const { part } = await params;
  const partNum = parseInt(part, 10);
  if (isNaN(partNum)) return new NextResponse("Bad request", { status: 400 });

  try {
    // Get video key from R2
    const videoKey = await r2GetVideoKey(partNum);
    
    if (!videoKey) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Get file metadata
    const metadata = await r2GetMetadata(videoKey);
    
    if (!metadata) {
      return new NextResponse("Not found", { status: 404 });
    }

    const fileSize = metadata.size;
    const etag = generateETag({ size: metadata.size, lastModified: metadata.lastModified });
    const clientETag = req.headers.get("if-none-match");
    
    // Check cache
    if (isCached(etag, clientETag)) {
      return new NextResponse(null, { status: 304 });
    }

    // Handle range requests
    const rangeHeader = req.headers.get("range");
    
    if (!rangeHeader) {
      // Stream entire file (not recommended for videos, but supported)
      const response = await r2StreamFile(videoKey);
      
      if (!response.Body) {
        return new NextResponse("Error reading file", { status: 500 });
      }

      const stream = response.Body.transformToWebStream();

      return new NextResponse(stream as any, {
        status: 200,
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": String(fileSize),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
          "ETag": etag,
        },
      });
    }

    // Parse range header
    const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
    
    if (!match) {
      return new NextResponse("Invalid range", { status: 416 });
    }

    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize || start > end) {
      return new NextResponse("Range Not Satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${fileSize}` },
      });
    }

    const chunkSize = end - start + 1;

    // Stream range from R2
    const response = await r2StreamFile(videoKey, `bytes=${start}-${end}`);
    
    if (!response.Body) {
      return new NextResponse("Error reading file", { status: 500 });
    }

    const stream = response.Body.transformToWebStream();

    return new NextResponse(stream as any, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": etag,
      },
    });
  } catch (error) {
    console.error("Error streaming video from R2:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
