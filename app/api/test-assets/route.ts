import { NextResponse } from "next/server";
import { getPartAssetUrls } from "@/lib/files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Testing getPartAssetUrls for Part 1...");
    
    const assetUrls = await getPartAssetUrls(1);
    
    return NextResponse.json({
      success: true,
      assetUrls,
      diagnostics: {
        videoUrl: assetUrls.videoUrl,
        audioUrl: assetUrls.audioUrl,
        mindmapUrl: assetUrls.mindmapUrl,
        hasVideo: !!assetUrls.videoUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
}
