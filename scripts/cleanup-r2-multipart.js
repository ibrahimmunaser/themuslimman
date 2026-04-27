/**
 * Cleanup incomplete multipart uploads in Cloudflare R2
 * 
 * This script aborts all incomplete multipart uploads that are blocking
 * video files from being accessible.
 */

const { S3Client, ListMultipartUploadsCommand, AbortMultipartUploadCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error("❌ Missing R2 credentials in .env file");
  console.error("Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET");
  process.exit(1);
}

// Initialize R2 client
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function listIncompleteUploads() {
  console.log("🔍 Scanning for incomplete multipart uploads...\n");
  
  try {
    const command = new ListMultipartUploadsCommand({
      Bucket: R2_BUCKET,
    });
    
    const response = await r2Client.send(command);
    return response.Uploads || [];
  } catch (error) {
    console.error("❌ Error listing multipart uploads:", error);
    throw error;
  }
}

async function abortMultipartUpload(key, uploadId) {
  try {
    const command = new AbortMultipartUploadCommand({
      Bucket: R2_BUCKET,
      Key: key,
      UploadId: uploadId,
    });
    
    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error(`❌ Error aborting upload for ${key}:`, error.message);
    return false;
  }
}

async function main() {
  console.log("🧹 R2 Multipart Upload Cleanup Tool");
  console.log("=====================================\n");
  console.log(`Bucket: ${R2_BUCKET}`);
  console.log(`Account: ${R2_ACCOUNT_ID}\n`);
  
  // List all incomplete uploads
  const incompleteUploads = await listIncompleteUploads();
  
  if (incompleteUploads.length === 0) {
    console.log("✅ No incomplete multipart uploads found!");
    console.log("   Your bucket is clean.\n");
    return;
  }
  
  console.log(`Found ${incompleteUploads.length} incomplete upload(s):\n`);
  
  incompleteUploads.forEach((upload, index) => {
    console.log(`${index + 1}. ${upload.Key}`);
    console.log(`   Upload ID: ${upload.UploadId}`);
    console.log(`   Started: ${upload.Initiated}\n`);
  });
  
  console.log("🗑️  Aborting incomplete uploads...\n");
  
  let successCount = 0;
  let failCount = 0;
  
  for (const upload of incompleteUploads) {
    process.stdout.write(`   Aborting: ${upload.Key}... `);
    const success = await abortMultipartUpload(upload.Key, upload.UploadId);
    
    if (success) {
      console.log("✅ Done");
      successCount++;
    } else {
      console.log("❌ Failed");
      failCount++;
    }
  }
  
  console.log("\n=====================================");
  console.log("📊 Summary:");
  console.log(`   ✅ Successfully aborted: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log("=====================================\n");
  
  if (successCount > 0) {
    console.log("🎉 Cleanup complete!");
    console.log("   Your R2 bucket is now clean and videos should load correctly.\n");
  }
}

main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
