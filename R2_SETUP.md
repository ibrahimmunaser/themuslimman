# Cloudflare R2 Storage Integration

This document explains how the Seerah app integrates with Cloudflare R2 for media storage.

## Overview

The website uses Cloudflare R2 as the primary storage backend for all media assets including:
- Video lessons
- Audio files
- Mindmaps
- Infographics
- Slide presentations
- Flashcards
- Quizzes
- Study materials (briefings, reports, study guides, statements of facts)

## R2 Bucket Structure

Your R2 bucket should follow this folder structure:

```
seerah-media/
├── videos/
│   ├── Part 1.mp4
│   ├── Part 2.mp4
│   └── ...
├── audio/
│   ├── Part 1.wav
│   ├── Part 2.wav
│   └── ...
├── mindmaps/
│   ├── Part 1 - Mindmap.png
│   └── ...
├── infographics/
│   ├── Concise/
│   │   ├── Part 1 - Infographic.png
│   │   └── ...
│   ├── Standard/
│   │   └── ...
│   └── Bento Grid/
│       └── ...
├── slides-presented/
│   ├── Part 01/
│   │   ├── slide-1.png
│   │   └── ...
│   └── ...
├── slides-detailed/
│   ├── Part 1 Watermark/
│   └── ...
├── slides-facts/
│   ├── Part 1/
│   └── ...
├── flashcards/
│   ├── Part_01.json
│   └── ...
├── quizzes/
│   ├── Part_01.json
│   └── ...
├── briefing/
│   ├── Part 1 Briefing Document.txt
│   └── ...
├── reports/
│   ├── Part 1 - Report.txt
│   └── ...
├── studyguides/
│   ├── Part 1 - Study Guide.txt
│   └── ...
└── statement-of-facts/
    ├── Part 1 - Statement of Facts.txt
    └── ...
```

## Environment Variables

Add these variables to your `.env` file:

```bash
# Cloudflare R2 Storage
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET="seerah-media"
R2_PUBLIC_URL="https://seerah-media.yourdomain.com"  # Optional: public domain
```

### Getting Your R2 Credentials

1. Log in to your Cloudflare dashboard
2. Go to R2 → Overview
3. Find your Account ID in the sidebar
4. Create an API token:
   - Go to R2 → Settings → API Tokens
   - Click "Create API Token"
   - Give it Admin Read & Write permissions
   - Copy the Access Key ID and Secret Access Key

## How It Works

### 1. Asset Detection

When a page loads, the system:
1. Checks if R2 is configured (via environment variables)
2. If yes, queries R2 for asset existence
3. If no, falls back to local filesystem (development mode)

### 2. Streaming & Delivery

- All media is streamed through Next.js API routes
- Range requests are supported for video/audio seeking
- ETags are used for browser caching
- Long cache headers are set for immutable assets

### 3. Performance Optimizations

- **Lazy Loading**: Assets are only loaded when needed
- **Parallel Fetching**: Multiple assets are fetched concurrently using `Promise.all`
- **CDN Caching**: Set cache headers for edge caching
- **Graceful Fallback**: Missing assets don't break the page

## API Routes

### `/api/r2/asset?key={key}`
Generic endpoint for streaming any R2 asset.

**Example:**
```
/api/r2/asset?key=videos/Part%201.mp4
```

### `/api/media/video/{partNumber}`
Streams video for a specific part.

**Example:**
```
/api/media/video/1
```

### `/api/media/audio/{partNumber}`
Streams audio for a specific part.

### `/api/media/image?p={path}`
Serves images (mindmaps, infographics, slides).

**Example:**
```
/api/media/image?p=mindmaps/Part%201%20-%20Mindmap.png
```

## Admin Panel

Visit `/admin/r2` to:
- Test R2 connection
- Browse folders and files
- View bucket structure
- Download assets

## Development vs Production

### Development (Local Files)
If R2 credentials are not set, the system falls back to reading from local filesystem:
```
../Seerah-data/Videos/
../Seerah-data/Audio/
...
```

### Production (R2)
When deployed to Vercel with R2 credentials, all assets are served from R2.

## Uploading Assets to R2

You can upload files using:

1. **Cloudflare Dashboard**: R2 → Your Bucket → Upload
2. **Wrangler CLI**:
   ```bash
   wrangler r2 object put seerah-media/videos/Part\ 1.mp4 --file=./Part\ 1.mp4
   ```
3. **AWS CLI** (S3-compatible):
   ```bash
   aws s3 cp ./Part\ 1.mp4 s3://seerah-media/videos/ \
     --endpoint-url https://[account-id].r2.cloudflarestorage.com
   ```

## Caching Strategy

| Asset Type | Cache-Control | Notes |
|-----------|---------------|-------|
| Videos/Audio | `immutable, max-age=31536000` | Long-lived, versioned content |
| Images | `immutable, max-age=31536000` | Static visual assets |
| JSON/Text | `max-age=3600` | May be updated occasionally |

## Troubleshooting

### "Connection Failed" in Admin Panel
- Verify R2 credentials in `.env`
- Check that the account ID matches your Cloudflare account
- Ensure API token has proper permissions

### Assets Not Loading
- Check R2 bucket structure matches expected paths
- Verify file names match exactly (case-sensitive)
- Check browser console for 404 errors
- Use admin panel to browse and verify files exist

### Slow Loading
- Enable Cloudflare CDN in front of R2
- Check Vercel region matches user location
- Consider using R2's public bucket feature for static assets

## Security

- R2 credentials are stored as environment variables
- Never commit credentials to Git
- API routes validate requests before streaming
- Path traversal attacks are prevented
- Only authenticated users can access media

## Cost Optimization

- R2 has no egress fees (unlike S3)
- Storage: $0.015/GB/month
- Class A operations (write): $4.50/million
- Class B operations (read): $0.36/million
- Typical cost for 100 parts: ~$5-10/month

## Migration from Local Files

To migrate from local filesystem to R2:

1. Upload all files to R2 following the folder structure
2. Add R2 credentials to `.env`
3. Deploy to Vercel
4. Test using the admin panel
5. Verify a few lesson pages load correctly

The system will automatically detect R2 and switch to cloud storage.

## Next Steps

- Set up a custom domain for R2 public access
- Enable Cloudflare CDN caching
- Consider creating a sync script for batch uploads
- Monitor R2 usage in Cloudflare dashboard
