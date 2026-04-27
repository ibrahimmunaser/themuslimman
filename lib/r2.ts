import { S3Client, GetObjectCommand, ListObjectsV2Command, HeadObjectCommand } from "@aws-sdk/client-s3";

// ─── R2 Client Configuration ──────────────────────────────────────────────────

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.warn("⚠️  R2 credentials not configured. Some features may not work.");
}

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

// ─── Public URL Generation ────────────────────────────────────────────────────

/**
 * Generate a public URL for an R2 object
 * @param key - The object key in R2 (e.g., "videos/Part 1.mp4")
 * @returns Public URL or null if not configured
 */
export function getR2PublicUrl(key: string): string | null {
  if (!R2_PUBLIC_URL || !R2_BUCKET) return null;
  // Remove leading slash if present
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return `${R2_PUBLIC_URL}/${cleanKey}`;
}

/**
 * Generate an asset URL (for API proxy route)
 * @param key - The object key in R2
 * @returns API route URL
 */
export function getR2AssetUrl(key: string): string {
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return `/api/r2/asset?key=${encodeURIComponent(cleanKey)}`;
}

// ─── File Existence & Metadata ────────────────────────────────────────────────

/**
 * Check if a file exists in R2
 */
export async function r2FileExists(key: string): Promise<boolean> {
  if (!R2_BUCKET) return false;
  
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });
    await r2Client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file metadata from R2
 */
export async function r2GetMetadata(key: string) {
  if (!R2_BUCKET) return null;
  
  try {
    const command = new HeadObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });
    const response = await r2Client.send(command);
    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType || "application/octet-stream",
      lastModified: response.LastModified,
      etag: response.ETag,
    };
  } catch {
    return null;
  }
}

// ─── Streaming & Downloads ────────────────────────────────────────────────────

/**
 * Stream a file from R2 with range support
 */
export async function r2StreamFile(key: string, range?: string) {
  if (!R2_BUCKET) throw new Error("R2 not configured");
  
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Range: range,
  });
  
  return await r2Client.send(command);
}

// ─── Directory Listing ─────────────────────────────────────────────────────────

/**
 * List files in a folder/prefix
 * @param prefix - Folder path (e.g., "videos/", "mindmaps/")
 * @param maxKeys - Maximum number of files to return (default: 1000)
 */
export async function r2ListFiles(prefix: string, maxKeys = 1000) {
  if (!R2_BUCKET) return [];
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Prefix: prefix,
      MaxKeys: maxKeys,
    });
    
    const response = await r2Client.send(command);
    
    return (response.Contents || []).map((item) => ({
      key: item.Key || "",
      size: item.Size || 0,
      lastModified: item.LastModified,
      etag: item.ETag || "",
    }));
  } catch (error) {
    console.error("Error listing R2 files:", error);
    return [];
  }
}

/**
 * List all folders in R2 bucket
 */
export async function r2ListFolders() {
  if (!R2_BUCKET) return [];
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET,
      Delimiter: "/",
      MaxKeys: 100,
    });
    
    const response = await r2Client.send(command);
    
    return (response.CommonPrefixes || [])
      .map((prefix) => prefix.Prefix || "")
      .filter((p) => p.length > 0);
  } catch (error) {
    console.error("Error listing R2 folders:", error);
    return [];
  }
}

// ─── Asset Detection Helpers ───────────────────────────────────────────────────

/**
 * Get video filename for a part number
 */
export async function r2GetVideoKey(partNum: number): Promise<string | null> {
  const key = `videos/Part ${partNum}.mp4`;
  const exists = await r2FileExists(key);
  return exists ? key : null;
}

/**
 * Get audio filename for a part number
 */
export async function r2GetAudioKey(partNum: number): Promise<string | null> {
  // Check for duplicate naming artifact first
  const withSuffix = `audio/Part ${partNum} (1).wav`;
  if (await r2FileExists(withSuffix)) return withSuffix;
  
  const normal = `audio/Part ${partNum}.wav`;
  if (await r2FileExists(normal)) return normal;
  
  return null;
}

/**
 * Get mindmap image key
 */
export async function r2GetMindmapKey(partNum: number): Promise<string | null> {
  const key = `mindmaps/Part ${partNum} - Mindmap.png`;
  const exists = await r2FileExists(key);
  return exists ? key : null;
}

/**
 * Get infographic filename (checks multiple naming patterns)
 */
export async function r2GetInfographicKey(
  partNum: number,
  style: "Bento Grid" | "Concise" | "Standard"
): Promise<string | null> {
  // Map style names to actual R2 folder names (with hyphens)
  const folderMap: Record<string, string> = {
    "Bento Grid": "Infographics-Bento-Grid",
    "Concise": "Infographics-Concise",
    "Standard": "Infographics-Standard",
  };
  
  const prefix = `${folderMap[style]}/`;
  
  // Simple filename: "Part X.png"
  const simpleKey = `${prefix}Part ${partNum}.png`;
  if (await r2FileExists(simpleKey)) {
    return simpleKey;
  }
  
  // List files in the folder to find alternate naming
  const files = await r2ListFiles(prefix);
  
  // Try to find with " - Infographic" suffix
  const withSuffix = files.find((f) => 
    f.key === `${prefix}Part ${partNum} - Infographic.png`
  );
  if (withSuffix) return withSuffix.key;
  
  // Fallback: find any file matching "Part X" (but not "Part XY")
  const looseRe = new RegExp(`^${prefix.replace(/\//g, "\\/")}Part ${partNum}[^0-9]`);
  const looseMatch = files.find((f) => 
    f.key.endsWith(".png") && looseRe.test(f.key)
  );
  
  return looseMatch?.key || null;
}

/**
 * Get slide files for a part
 */
export async function r2GetSlideKeys(
  partNum: number,
  type: "presented" | "detailed" | "facts"
): Promise<string[]> {
  let prefix: string;
  
  if (type === "presented") {
    const padded = partNum < 10 ? `0${partNum}` : `${partNum}`;
    prefix = `slides-presented/Part ${padded}/`;
  } else if (type === "detailed") {
    prefix = `slides-detailed/Part ${partNum} Watermark/`;
  } else {
    prefix = `slides-facts/Part ${partNum}/`;
  }
  
  const files = await r2ListFiles(prefix);
  return files
    .filter((f) => f.key.endsWith(".png"))
    .map((f) => f.key)
    .sort();
}

/**
 * Get lesson assets for a specific part number
 */
export async function r2GetLessonAssets(partNum: number) {
  const [
    videoKey,
    audioKey,
    mindmapKey,
    infoConciseKey,
    infoStandardKey,
    infoBentoKey,
    slidesPresented,
    slidesDetailed,
    slidesFacts,
  ] = await Promise.all([
    r2GetVideoKey(partNum),
    r2GetAudioKey(partNum),
    r2GetMindmapKey(partNum),
    r2GetInfographicKey(partNum, "Concise"),
    r2GetInfographicKey(partNum, "Standard"),
    r2GetInfographicKey(partNum, "Bento Grid"),
    r2GetSlideKeys(partNum, "presented"),
    r2GetSlideKeys(partNum, "detailed"),
    r2GetSlideKeys(partNum, "facts"),
  ]);
  
  return {
    // Use public URLs for better performance (direct CDN access)
    video: videoKey ? getR2PublicUrl(videoKey) : undefined,
    audio: audioKey ? getR2PublicUrl(audioKey) : undefined,
    mindmap: mindmapKey ? getR2PublicUrl(mindmapKey) : undefined,
    infographics: {
      concise: infoConciseKey ? getR2PublicUrl(infoConciseKey) : undefined,
      standard: infoStandardKey ? getR2PublicUrl(infoStandardKey) : undefined,
      bentoGrid: infoBentoKey ? getR2PublicUrl(infoBentoKey) : undefined,
    },
    slides: {
      presented: slidesPresented.map((key) => getR2PublicUrl(key) || key),
      detailed: slidesDetailed.map((key) => getR2PublicUrl(key) || key),
      facts: slidesFacts.map((key) => getR2PublicUrl(key) || key),
    },
  };
}

// ─── Text Files (Briefings, Reports, etc.) ─────────────────────────────────────

/**
 * Read a text file from R2
 */
export async function r2ReadTextFile(key: string): Promise<string | null> {
  if (!R2_BUCKET) return null;
  
  try {
    const response = await r2StreamFile(key);
    if (!response.Body) return null;
    
    const bodyString = await response.Body.transformToString("utf-8");
    return bodyString;
  } catch {
    return null;
  }
}

/**
 * Read JSON file from R2
 */
export async function r2ReadJsonFile<T = any>(key: string): Promise<T | null> {
  const content = await r2ReadTextFile(key);
  if (!content) return null;
  
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Read briefing document
 */
export async function r2ReadBriefing(partNum: number): Promise<string | null> {
  return await r2ReadTextFile(`briefing/Part ${partNum} Briefing Document.txt`);
}

/**
 * Read statement of facts
 */
export async function r2ReadStatementOfFacts(partNum: number): Promise<string | null> {
  return await r2ReadTextFile(`statement-of-facts/Part ${partNum} - Statement of Facts.txt`);
}

/**
 * Read study guide
 */
export async function r2ReadStudyGuide(partNum: number): Promise<string | null> {
  const txt = await r2ReadTextFile(`studyguides/Part ${partNum} - Study Guide.txt`);
  return txt;
}

/**
 * Read report
 */
export async function r2ReadReport(partNum: number): Promise<string | null> {
  // List all files in reports folder
  const files = await r2ListFiles("reports/");
  const prefix = `reports/Part ${partNum} - Report`;
  
  const match = files.find((f) => 
    f.key.startsWith(prefix) && f.key.endsWith(".txt")
  );
  
  if (!match) return null;
  return await r2ReadTextFile(match.key);
}

/**
 * Read flashcards
 */
export async function r2ReadFlashcards(partNum: number) {
  const pad = partNum < 10 ? `0${partNum}` : `${partNum}`;
  return await r2ReadJsonFile(`flashcards/Part_${pad}.json`);
}

/**
 * Read quiz
 */
export async function r2ReadQuiz(partNum: number) {
  const pad = partNum < 10 ? `0${partNum}` : `${partNum}`;
  return await r2ReadJsonFile(`quizzes/Part_${pad}.json`);
}

// ─── Cache Utilities ───────────────────────────────────────────────────────────

/**
 * Generate ETag for cache validation
 */
export function generateETag(metadata: { size: number; lastModified?: Date }): string {
  const timestamp = metadata.lastModified?.getTime() || Date.now();
  return `"${timestamp}-${metadata.size}"`;
}

/**
 * Check if client has cached version
 */
export function isCached(etag: string, clientETag?: string | null): boolean {
  if (!clientETag) return false;
  return etag === clientETag;
}
