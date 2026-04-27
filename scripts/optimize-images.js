/**
 * Image Optimization Script for R2
 * 
 * This script:
 * 1. Downloads PNG infographics from R2
 * 2. Converts to WebP format (80-90% size reduction)
 * 3. Generates responsive sizes (thumbnail, medium, large, original)
 * 4. Uploads optimized versions back to R2
 */

const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

// R2 Configuration
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET || "seerah-media";
const TEMP_DIR = path.join(__dirname, "temp-images");

// Responsive image sizes
const SIZES = {
  thumbnail: { width: 400, suffix: "-thumb" },
  medium: { width: 800, suffix: "-medium" },
  large: { width: 1200, suffix: "-large" },
  // original: no resize, just convert to WebP
};

// WebP quality settings (80-85 gives best balance of quality/size)
const WEBP_QUALITY = 82;

/**
 * Download a file from R2
 */
async function downloadFromR2(key) {
  console.log(`  📥 Downloading: ${key}`);
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const response = await r2Client.send(command);
  const chunks = [];
  
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}

/**
 * Upload a file to R2
 */
async function uploadToR2(key, buffer, contentType) {
  console.log(`  📤 Uploading: ${key} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
  
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable", // Cache for 1 year
  });

  await r2Client.send(command);
}

/**
 * Convert and optimize a single image
 */
async function optimizeImage(buffer, originalKey) {
  const fileName = path.basename(originalKey, ".png");
  const folderName = path.dirname(originalKey);
  
  console.log(`\n🎨 Processing: ${originalKey}`);
  console.log(`  Original size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

  const results = [];

  // Get original dimensions
  const metadata = await sharp(buffer).metadata();
  console.log(`  Dimensions: ${metadata.width}x${metadata.height}px`);

  // Generate WebP in multiple sizes
  for (const [sizeName, config] of Object.entries(SIZES)) {
    const outputKey = `${folderName}/${fileName}${config.suffix}.webp`;
    
    let processor = sharp(buffer);
    
    // Resize if not original
    if (config.width) {
      processor = processor.resize(config.width, null, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Convert to WebP
    const webpBuffer = await processor
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toBuffer();

    const sizeMB = (webpBuffer.length / 1024 / 1024).toFixed(2);
    const reduction = (((buffer.length - webpBuffer.length) / buffer.length) * 100).toFixed(1);
    
    console.log(`  ✅ ${sizeName}: ${sizeMB} MB (${reduction}% smaller)`);

    results.push({
      key: outputKey,
      buffer: webpBuffer,
      size: webpBuffer.length,
    });
  }

  // Also create full-size WebP
  const fullSizeKey = `${folderName}/${fileName}.webp`;
  const fullSizeWebP = await sharp(buffer)
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toBuffer();

  const fullSizeMB = (fullSizeWebP.length / 1024 / 1024).toFixed(2);
  const fullReduction = (((buffer.length - fullSizeWebP.length) / buffer.length) * 100).toFixed(1);
  console.log(`  ✅ original-webp: ${fullSizeMB} MB (${fullReduction}% smaller)`);

  results.push({
    key: fullSizeKey,
    buffer: fullSizeWebP,
    size: fullSizeWebP.length,
  });

  return results;
}

/**
 * List all PNG files in infographic folders
 */
async function listInfographics() {
  const folders = ["Infographics-Bento-Grid", "Infographics-Concise", "Infographics-Standard"];
  const allFiles = [];

  for (const folder of folders) {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: `${folder}/`,
    });

    const response = await r2Client.send(command);
    
    if (response.Contents) {
      const pngFiles = response.Contents
        .filter(item => item.Key.endsWith(".png"))
        .map(item => item.Key);
      
      allFiles.push(...pngFiles);
    }
  }

  return allFiles;
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 Image Optimization Pipeline Starting...\n");

  // Create temp directory
  await fs.mkdir(TEMP_DIR, { recursive: true });

  // Get all infographic PNGs
  console.log("📋 Finding infographic files...");
  const infographics = await listInfographics();
  console.log(`✅ Found ${infographics.length} PNG files\n`);

  // Process in batches to avoid memory issues
  const BATCH_SIZE = 5;
  let processed = 0;
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (let i = 0; i < infographics.length; i += BATCH_SIZE) {
    const batch = infographics.slice(i, i + BATCH_SIZE);
    
    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(infographics.length / BATCH_SIZE)}`);

    for (const key of batch) {
      try {
        // Download original PNG
        const buffer = await downloadFromR2(key);
        totalOriginalSize += buffer.length;

        // Optimize and generate sizes
        const optimizedVersions = await optimizeImage(buffer, key);

        // Upload all optimized versions
        for (const version of optimizedVersions) {
          await uploadToR2(version.key, version.buffer, "image/webp");
          totalOptimizedSize += version.size;
        }

        processed++;
        
      } catch (error) {
        console.error(`❌ Error processing ${key}:`, error.message);
      }
    }
  }

  // Cleanup
  await fs.rm(TEMP_DIR, { recursive: true, force: true });

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("✅ OPTIMIZATION COMPLETE!");
  console.log("=".repeat(60));
  console.log(`📊 Files processed: ${processed}`);
  console.log(`📦 Original total size: ${(totalOriginalSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`📦 Optimized total size: ${(totalOptimizedSize / 1024 / 1024 / 1024).toFixed(2)} GB`);
  console.log(`💾 Space saved: ${(((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100).toFixed(1)}%`);
  console.log(`💰 Storage cost reduction: $${(((totalOriginalSize - totalOptimizedSize) / 1024 / 1024 / 1024) * 0.015).toFixed(2)}/month`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { optimizeImage, downloadFromR2, uploadToR2 };
