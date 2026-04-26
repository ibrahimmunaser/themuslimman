import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { SEERAH_ROOT, getAudioFilename } from "@/lib/files";

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

  const filename = getAudioFilename(partNum);
  if (!filename) return new NextResponse("Not found", { status: 404 });

  const filePath = path.join(SEERAH_ROOT, "Audio", filename);
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const rangeHeader = req.headers.get("range");

  let start = 0;
  let end = Math.min(CHUNK_SIZE - 1, fileSize - 1);

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
    status: 206,
    headers: {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": String(chunkSize),
      "Content-Type": "audio/wav",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
