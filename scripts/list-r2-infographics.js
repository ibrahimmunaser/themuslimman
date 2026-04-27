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

async function listInfographics() {
  try {
    console.log("Listing infographics in R2 bucket...\n");

    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET,
      Prefix: "infographics/",
      MaxKeys: 50,
    });

    const response = await r2Client.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      console.log("❌ No infographic files found");
      return;
    }

    console.log(`Found ${response.Contents.length} infographic files:\n`);

    response.Contents.forEach((item) => {
      const sizeMB = (item.Size / (1024 * 1024)).toFixed(2);
      console.log(`  - ${item.Key} (${sizeMB} MB)`);
    });

  } catch (error) {
    console.error("Error listing infographics:", error.message);
  }
}

listInfographics();
