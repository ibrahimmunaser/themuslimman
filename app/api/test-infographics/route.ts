import { NextResponse } from "next/server";
import { r2GetInfographicKey } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("Testing infographic detection for Part 1...");

    const [concise, standard, bentoGrid] = await Promise.all([
      r2GetInfographicKey(1, "Concise"),
      r2GetInfographicKey(1, "Standard"),
      r2GetInfographicKey(1, "Bento Grid"),
    ]);

    return NextResponse.json({
      success: true,
      infographics: {
        concise,
        standard,
        bentoGrid,
      },
      diagnostics: {
        hasConcise: !!concise,
        hasStandard: !!standard,
        hasBentoGrid: !!bentoGrid,
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
