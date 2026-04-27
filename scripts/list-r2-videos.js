const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");
require("dotenv").config();

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function listR2Videos() {
  try {
    console.log("Listing videos in R2 bucket...\n");
    
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET,
      Prefix: "videos/",
      MaxKeys: 100,
    });
    
    const response = await r2Client.send(command);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log("❌ No video files found in the 'videos/' folder");
      return;
    }
    
    console.log(`Found ${response.Contents.length} items in 'videos/' folder:\n`);
    
    response.Contents.forEach((item) => {
      const sizeMB = (item.Size / (1024 * 1024)).toFixed(2);
      console.log(`  - ${item.Key} (${sizeMB} MB)`);
    });
    
    // Check specifically for Part 1
    const part1 = response.Contents.find(item => item.Key === "videos/Part 1.mp4");
    console.log("\n" + "=".repeat(60));
    if (part1) {
      const sizeMB = (part1.Size / (1024 * 1024)).toFixed(2);
      console.log(`✅ Part 1 video exists: ${sizeMB} MB`);
    } else {
      console.log("❌ Part 1 video (videos/Part 1.mp4) does NOT exist");
    }
    
  } catch (error) {
    console.error("Error listing R2 videos:", error.message);
  }
}

listR2Videos();
