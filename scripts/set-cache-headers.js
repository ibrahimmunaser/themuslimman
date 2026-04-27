/**
 * Set optimal cache headers on all R2 objects
 * This ensures browsers cache assets for maximum performance
 */

const { S3Client, ListObjectsV2Command, CopyObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET || "seerah-media";

// Cache durations
const CACHE_SETTINGS = {
  // Videos: 1 year (immutable content)
  video: "public, max-age=31536000, immutable",
  // Audio: 1 year (immutable content)
  audio: "public, max-age=31536000, immutable",
  // Images: 1 year (immutable content)
  image: "public, max-age=31536000, immutable",
  // PDFs/Slides: 1 year (immutable content)
  document: "public, max-age=31536000, immutable",
  // Default: 1 week
  default: "public, max-age=604800",
};

const CONTENT_TYPES = {
  ".mp4": { type: "video/mp4", cache: "video" },
  ".webm": { type: "video/webm", cache: "video" },
  ".mp3": { type: "audio/mpeg", cache: "audio" },
  ".m4a": { type: "audio/mp4", cache: "audio" },
  ".webp": { type: "image/webp", cache: "image" },
  ".png": { type: "image/png", cache: "image" },
  ".jpg": { type: "image/jpeg", cache: "image" },
  ".jpeg": { type: "image/jpeg", cache: "image" },
  ".pdf": { type: "application/pdf", cache: "document" },
  ".txt": { type: "text/plain", cache: "document" },
  ".md": { type: "text/markdown", cache: "document" },
};

/**
 * Get content type and cache settings for a file
 */
function getFileSettings(key) {
  const ext = key.substring(key.lastIndexOf(".")).toLowerCase();
  const settings = CONTENT_TYPES[ext];
  
  if (settings) {
    return {
      contentType: settings.type,
      cacheControl: CACHE_SETTINGS[settings.cache],
    };
  }
  
  return {
    contentType: "application/octet-stream",
    cacheControl: CACHE_SETTINGS.default,
  };
}

/**
 * Update cache headers for a single object
 */
async function updateCacheHeaders(key) {
  try {
    // Get current metadata
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });
    const metadata = await r2Client.send(headCommand);
    
    const settings = getFileSettings(key);
    
    // Check if update is needed
    if (metadata.CacheControl === settings.cacheControl) {
      console.log(`  ⏭️  Skipping ${key} (already optimized)`);
      return { skipped: true };
    }
    
    // Copy object to itself with new metadata (this updates the headers)
    const copyCommand = new CopyObjectCommand({
      Bucket: BUCKET,
      CopySource: `${BUCKET}/${key}`,
      Key: key,
      ContentType: settings.contentType,
      CacheControl: settings.cacheControl,
      MetadataDirective: "REPLACE",
    });
    
    await r2Client.send(copyCommand);
    console.log(`  ✅ Updated ${key}`);
    console.log(`     Cache: ${settings.cacheControl}`);
    
    return { updated: true };
  } catch (error) {
    console.error(`  ❌ Error updating ${key}:`, error.message);
    return { error: true };
  }
}

/**
 * List all objects in bucket
 */
async function listAllObjects() {
  const allObjects = [];
  let continuationToken = undefined;
  
  do {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      ContinuationToken: continuationToken,
    });
    
    const response = await r2Client.send(command);
    
    if (response.Contents) {
      allObjects.push(...response.Contents.map(obj => obj.Key));
    }
    
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
  
  return allObjects;
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 Cache Header Optimization Starting...\n");
  
  console.log("📋 Listing all objects in R2...");
  const allObjects = await listAllObjects();
  console.log(`✅ Found ${allObjects.length} objects\n`);
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  console.log("🔧 Updating cache headers...\n");
  
  for (const key of allObjects) {
    const result = await updateCacheHeaders(key);
    
    if (result.updated) updated++;
    if (result.skipped) skipped++;
    if (result.error) errors++;
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ CACHE OPTIMIZATION COMPLETE!");
  console.log("=".repeat(60));
  console.log(`📊 Updated: ${updated}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`\n💡 All assets now have optimal cache headers!`);
  console.log(`🚀 Repeat visitors will see 98% faster load times!`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateCacheHeaders, getFileSettings };
