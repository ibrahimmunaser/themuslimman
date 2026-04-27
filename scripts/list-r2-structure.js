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

async function listAll() {
  try {
    console.log("Listing all folders and files in R2 bucket...\n");

    const prefixes = ["", "seerah-media/", "Infographics-"];
    
    for (const prefix of prefixes) {
      console.log(`\n=== Checking prefix: "${prefix}" ===`);
      
      const command = new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET,
        Prefix: prefix,
        MaxKeys: 100,
        Delimiter: prefix === "" ? "/" : "",
      });

      const response = await r2Client.send(command);

      if (response.CommonPrefixes) {
        console.log("\nDirectories:");
        response.CommonPrefixes.forEach((p) => {
          console.log(`  📁 ${p.Prefix}`);
        });
      }

      if (response.Contents && response.Contents.length > 0) {
        console.log(`\nFiles (showing first 20):`);
        response.Contents.slice(0, 20).forEach((item) => {
          const sizeMB = (item.Size / (1024 * 1024)).toFixed(2);
          console.log(`  📄 ${item.Key} (${sizeMB} MB)`);
        });
        if (response.Contents.length > 20) {
          console.log(`  ... and ${response.Contents.length - 20} more files`);
        }
      }
    }

  } catch (error) {
    console.error("Error:", error.message);
  }
}

listAll();
