import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { SEERAH_ROOT } from "@/lib/files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHUNK_SIZE = 256 * 1024;
const HIGH_WATER_MARK = 64 * 1024;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ part: string }> }
) {
  const { part } = await params;
  const partNum = parseInt(part, 10);
  if (isNaN(partNum)) return new NextResponse("Bad request", { status: 400 });

  const filePath = path.join(SEERAH_ROOT, "Videos", `Part ${partNum}.mp4`);
  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const rangeHeader = req.headers.get("range");

  let start = 0;
  let end = Math.min(CHUNK_SIZE - 1, fileSize - 1);
  let status = 206;

  if (rangeHeader) {
    const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
    if (match) {
      start = parseInt(match[1], 10);
      end = match[2]
        ? Math.min(parseInt(match[2], 10), fileSize - 1)
        : Math.min(start + CHUNK_SIZE - 1, fileSize - 1);
    }
  }

  if (start >= fileSize || end >= fileSize || start > end) {
    return new NextResponse("Range Not Satisfiable", {
      status: 416,
      headers: { "Content-Range": `bytes */${fileSize}` },
    });
  }

  const chunkSize = end - start + 1;

  const nodeStream = fs.createReadStream(filePath, {
    start,
    end,
    highWaterMark: HIGH_WATER_MARK,
  });

  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  return new NextResponse(webStream, {
    status,
    headers: {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": String(chunkSize),
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
