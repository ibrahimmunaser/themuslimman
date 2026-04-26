import { NextResponse } from "next/server";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
  const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
  const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
  const R2_BUCKET = process.env.R2_BUCKET;

  const diagnostics = {
    envVarsPresent: {
      R2_ACCOUNT_ID: !!R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID: !!R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: !!R2_SECRET_ACCESS_KEY,
      R2_BUCKET: !!R2_BUCKET,
    },
    r2Connection: null as any,
    videoCheck: null as any,
  };

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
    return NextResponse.json({
      success: false,
      error: "Missing R2 environment variables",
      diagnostics,
    });
  }

  const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  try {
    const videoKey = "videos/Part 1.mp4";
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET,
      Key: videoKey,
    });

    const response = await r2Client.send(command);

    diagnostics.r2Connection = "SUCCESS";
    diagnostics.videoCheck = {
      key: videoKey,
      exists: true,
      size: response.ContentLength,
      contentType: response.ContentType,
    };

    return NextResponse.json({
      success: true,
      message: "R2 connection and video check successful",
      diagnostics,
    });
  } catch (error: any) {
    diagnostics.r2Connection = "FAILED";
    diagnostics.videoCheck = {
      error: error.message,
      code: error.Code || error.code,
      statusCode: error.$metadata?.httpStatusCode,
    };

    return NextResponse.json({
      success: false,
      error: "R2 connection failed",
      diagnostics,
    });
  }
}
