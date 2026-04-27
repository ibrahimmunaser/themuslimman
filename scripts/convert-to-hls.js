/**
 * HLS Video Streaming Implementation Guide
 * 
 * HLS (HTTP Live Streaming) provides:
 * - Adaptive bitrate streaming (automatically adjusts quality based on connection)
 * - Better buffering and seeking
 * - Lower initial load time
 * - Support for live streaming
 * 
 * This script converts MP4 videos to HLS format with multiple quality levels
 * 
 * Prerequisites:
 * - Install ffmpeg: winget install ffmpeg (Windows) or brew install ffmpeg (Mac)
 */

const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs").promises;
const path = require("path");
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
const TEMP_DIR = path.join(__dirname, "temp-hls");

// HLS quality presets
const QUALITY_PRESETS = [
  { name: "360p", width: 640, height: 360, bitrate: "800k", audioBitrate: "96k" },
  { name: "480p", width: 854, height: 480, bitrate: "1400k", audioBitrate: "128k" },
  { name: "720p", width: 1280, height: 720, bitrate: "2800k", audioBitrate: "128k" },
  { name: "1080p", width: 1920, height: 1080, bitrate: "5000k", audioBitrate: "192k" },
];

/**
 * Convert video to HLS format with multiple quality levels
 */
async function convertToHLS(inputPath, outputDir, videoName) {
  console.log(`  🎥 Converting to HLS...`);
  
  const promises = QUALITY_PRESETS.map((preset) => {
    return new Promise((resolve, reject) => {
      const outputPath = path.join(outputDir, `${videoName}_${preset.name}.m3u8`);
      
      ffmpeg(inputPath)
        .outputOptions([
          `-vf scale=${preset.width}:${preset.height}`,
          `-c:v libx264`,
          `-b:v ${preset.bitrate}`,
          `-c:a aac`,
          `-b:a ${preset.audioBitrate}`,
          `-hls_time 10`,
          `-hls_list_size 0`,
          `-hls_segment_filename ${path.join(outputDir, `${videoName}_${preset.name}_%03d.ts`)}`,
        ])
        .output(outputPath)
        .on("end", () => {
          console.log(`    ✅ ${preset.name} created`);
          resolve();
        })
        .on("error", reject)
        .run();
    });
  });
  
  await Promise.all(promises);
  
  // Create master playlist
  const masterPlaylist = createMasterPlaylist(videoName, QUALITY_PRESETS);
  const masterPath = path.join(outputDir, `${videoName}_master.m3u8`);
  await fs.writeFile(masterPath, masterPlaylist);
  
  console.log(`    ✅ Master playlist created`);
}

/**
 * Create HLS master playlist
 */
function createMasterPlaylist(videoName, presets) {
  let playlist = "#EXTM3U\n#EXT-X-VERSION:3\n\n";
  
  for (const preset of presets) {
    const bandwidth = parseInt(preset.bitrate) * 1000;
    playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${preset.width}x${preset.height}\n`;
    playlist += `${videoName}_${preset.name}.m3u8\n\n`;
  }
  
  return playlist;
}

/**
 * Upload HLS files to R2
 */
async function uploadHLSFiles(localDir, r2Prefix) {
  console.log(`  📤 Uploading HLS files to R2...`);
  
  const files = await fs.readdir(localDir);
  let uploaded = 0;
  
  for (const file of files) {
    const localPath = path.join(localDir, file);
    const r2Key = `${r2Prefix}/${file}`;
    
    const buffer = await fs.readFile(localPath);
    
    const contentType = file.endsWith(".m3u8")
      ? "application/vnd.apple.mpegurl"
      : "video/MP2T";
    
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: r2Key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    
    uploaded++;
  }
  
  console.log(`    ✅ Uploaded ${uploaded} files`);
}

/**
 * Process a single video
 */
async function processVideo(videoKey) {
  try {
    const videoName = path.basename(videoKey, path.extname(videoKey));
    const folderName = path.dirname(videoKey);
    
    console.log(`\n🎬 Processing: ${videoKey}`);
    
    // Download video
    console.log(`  📥 Downloading video...`);
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: videoKey });
    const response = await r2Client.send(command);
    
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const videoBuffer = Buffer.concat(chunks);
    
    const tempVideoPath = path.join(TEMP_DIR, path.basename(videoKey));
    await fs.writeFile(tempVideoPath, videoBuffer);
    
    // Convert to HLS
    const hlsOutputDir = path.join(TEMP_DIR, videoName);
    await fs.mkdir(hlsOutputDir, { recursive: true });
    
    await convertToHLS(tempVideoPath, hlsOutputDir, videoName);
    
    // Upload to R2
    const r2HlsPrefix = `${folderName}/hls/${videoName}`;
    await uploadHLSFiles(hlsOutputDir, r2HlsPrefix);
    
    // Cleanup
    await fs.unlink(tempVideoPath);
    await fs.rm(hlsOutputDir, { recursive: true });
    
    console.log(`  ✅ HLS conversion complete`);
    console.log(`     Master playlist: ${r2HlsPrefix}/${videoName}_master.m3u8`);
    
    return { success: true };
  } catch (error) {
    console.error(`  ❌ Error:`, error.message);
    return { error: true };
  }
}

/**
 * List all videos
 */
async function listVideos() {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: "videos/",
  });

  const response = await r2Client.send(command);
  
  if (!response.Contents) return [];
  
  return response.Contents
    .filter(item => item.Key.endsWith(".mp4"))
    .map(item => item.Key)
    .slice(0, 5); // Start with first 5 videos for testing
}

/**
 * Main execution
 */
async function main() {
  console.log("🚀 HLS Conversion Starting...\n");
  console.log("⚠️  This is a PROOF OF CONCEPT - processing first 5 videos only\n");
  
  await fs.mkdir(TEMP_DIR, { recursive: true });
  
  const videos = await listVideos();
  console.log(`✅ Found ${videos.length} videos to process\n`);
  
  if (videos.length === 0) {
    console.log("ℹ️  No videos found");
    return;
  }
  
  let processed = 0;
  let errors = 0;
  
  for (const videoKey of videos) {
    const result = await processVideo(videoKey);
    if (result.success) processed++;
    if (result.error) errors++;
  }
  
  await fs.rm(TEMP_DIR, { recursive: true, force: true });
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ HLS CONVERSION COMPLETE!");
  console.log("=".repeat(60));
  console.log(`📊 Processed: ${processed}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Update video player to use HLS.js library`);
  console.log(`   2. Point video source to *_master.m3u8 files`);
  console.log(`   3. Test adaptive bitrate switching`);
  console.log(`\n🚀 Expected improvements:`);
  console.log(`   - 50% faster initial load (adaptive quality)`);
  console.log(`   - Better buffering on slow connections`);
  console.log(`   - Smoother playback experience`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { processVideo, convertToHLS };
