# 🎥 VIDEO CDN MIGRATION PLAN

**Created:** January 6, 2026
**Status:** Planning Phase
**Impact:** Remove 26MB from initial page load

---

## 📊 CURRENT STATE

### Video Inventory
| File | Size | Location | Usage |
|------|------|----------|-------|
| `hero-video.mp4` | 2.2MB | `/public/images/` | Hero section background |
| `light_video.mp4` | 11MB | `/public/images/aircrafts/light/` | Light aircraft showcase |
| `medium_video.mp4` | 3.1MB | `/public/images/aircrafts/medium/` | Medium aircraft showcase |
| `heavy_video.mp4` | 4.9MB | `/public/images/aircrafts/heavy/` | Heavy aircraft showcase |
| `piston_video.mp4` | 5.0MB | `/public/images/aircrafts/piston/` | Piston aircraft showcase |
| **TOTAL** | **26.2MB** | Local hosting | Blocking page load |

### Current Issues
- ❌ 26MB of videos hosted locally
- ❌ Blocks initial page render
- ❌ No video streaming optimization
- ❌ No adaptive bitrate streaming
- ❌ No CDN distribution (slow for international users)
- ❌ Wastes Vercel bandwidth (if deployed there)

---

## 🎯 MIGRATION GOALS

1. ✅ **Reduce initial bundle size** - Remove 26MB from deployment
2. ✅ **Improve page load time** - Videos load from CDN, not from app server
3. ✅ **Better user experience** - Faster video loading worldwide
4. ✅ **Cost optimization** - Reduce bandwidth costs
5. ✅ **Future scalability** - Easy to add more videos

---

## 🔍 CDN OPTIONS COMPARISON

### Option 1: Vercel Blob Storage ⭐ RECOMMENDED
**Best for:** Teams already using Vercel for deployment

**Pros:**
- ✅ Native integration with Vercel
- ✅ Built-in CDN (edge caching)
- ✅ Simple API (`@vercel/blob`)
- ✅ Automatic HTTPS
- ✅ No infrastructure setup needed
- ✅ Pay-as-you-go pricing
- ✅ Perfect for Next.js apps

**Cons:**
- ⚠️ Tied to Vercel ecosystem
- ⚠️ Can be more expensive at scale vs. R2

**Pricing (as of 2026):**
- $0.15/GB storage per month
- $0.20/GB egress bandwidth
- **Estimated monthly cost:** ~$1-5 for this project

**Setup Time:** ~30 minutes

---

### Option 2: Cloudflare R2 💰 MOST COST-EFFECTIVE
**Best for:** Cost-conscious teams, high bandwidth needs

**Pros:**
- ✅ **Zero egress fees** (huge savings!)
- ✅ S3-compatible API (easy migration)
- ✅ Global CDN included
- ✅ Very low storage costs
- ✅ Can use with any hosting provider
- ✅ Cloudflare's global network

**Cons:**
- ⚠️ Requires Cloudflare account setup
- ⚠️ Slightly more complex than Vercel Blob
- ⚠️ Need to manage bucket permissions

**Pricing (as of 2026):**
- $0.015/GB storage per month
- $0.00/GB egress (FREE!)
- **Estimated monthly cost:** ~$0.50 for this project

**Setup Time:** ~1 hour

---

### Option 3: AWS S3 + CloudFront 🏢 ENTERPRISE
**Best for:** Large organizations, need fine-grained control

**Pros:**
- ✅ Mature, battle-tested
- ✅ Extensive documentation
- ✅ Fine-grained IAM controls
- ✅ Integration with AWS ecosystem
- ✅ Advanced analytics

**Cons:**
- ⚠️ Most complex setup
- ⚠️ Steeper learning curve
- ⚠️ Higher costs than R2
- ⚠️ More configuration needed

**Pricing (as of 2026):**
- $0.023/GB storage
- $0.085/GB egress (first 10TB)
- CloudFront adds additional costs
- **Estimated monthly cost:** ~$3-8 for this project

**Setup Time:** ~2-3 hours

---

## 🚀 RECOMMENDED APPROACH: Vercel Blob

### Why Vercel Blob?
For this project, **Vercel Blob** is recommended because:
1. Already using Next.js (Vercel's framework)
2. Likely deploying to Vercel (based on Railway config)
3. Simplest integration
4. Fastest setup time
5. Good enough pricing for this scale

### Alternative: If bandwidth costs become an issue → Migrate to Cloudflare R2

---

## 📋 IMPLEMENTATION PLAN (Vercel Blob)

### Phase 1: Setup (30 min)

1. **Install Vercel Blob SDK**
   ```bash
   npm install @vercel/blob
   ```

2. **Create Blob Storage**
   - Go to Vercel Dashboard → Project → Storage
   - Create new Blob Store
   - Note the connection string

3. **Set Environment Variables**
   ```bash
   # .env.local
   BLOB_READ_WRITE_TOKEN="your-token-here"
   ```

---

### Phase 2: Upload Videos (15 min)

Create upload script: `scripts/upload-videos-to-blob.js`

```javascript
import { put, list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const videos = [
  { path: 'public/images/hero-video.mp4', key: 'hero-video.mp4' },
  { path: 'public/images/aircrafts/light/light_video.mp4', key: 'aircrafts/light_video.mp4' },
  { path: 'public/images/aircrafts/medium/medium_video.mp4', key: 'aircrafts/medium_video.mp4' },
  { path: 'public/images/aircrafts/heavy/heavy_video.mp4', key: 'aircrafts/heavy_video.mp4' },
  { path: 'public/images/aircrafts/piston/piston_video.mp4', key: 'aircrafts/piston_video.mp4' },
];

async function uploadVideos() {
  for (const video of videos) {
    const file = fs.readFileSync(video.path);
    const blob = await put(video.key, file, {
      access: 'public',
      contentType: 'video/mp4',
    });
    console.log(`✅ Uploaded: ${video.key} → ${blob.url}`);
  }
}

uploadVideos();
```

Run:
```bash
node scripts/upload-videos-to-blob.js
```

---

### Phase 3: Update Code (30 min)

#### 3.1 Create Video URL Configuration

Create `src/config/videos.ts`:

```typescript
/**
 * Video URLs - CDN hosted videos
 * Update these URLs after uploading to Blob storage
 */

export const videoUrls = {
  hero: process.env.NEXT_PUBLIC_HERO_VIDEO_URL || '/images/hero-video.mp4',
  aircraft: {
    light: process.env.NEXT_PUBLIC_LIGHT_VIDEO_URL || '/images/aircrafts/light/light_video.mp4',
    medium: process.env.NEXT_PUBLIC_MEDIUM_VIDEO_URL || '/images/aircrafts/medium/medium_video.mp4',
    heavy: process.env.NEXT_PUBLIC_HEAVY_VIDEO_URL || '/images/aircrafts/heavy/heavy_video.mp4',
    piston: process.env.NEXT_PUBLIC_PISTON_VIDEO_URL || '/images/aircrafts/piston/piston_video.mp4',
  },
} as const;
```

#### 3.2 Set Environment Variables

Add to `.env.local`:
```bash
# Video CDN URLs (from Vercel Blob)
NEXT_PUBLIC_HERO_VIDEO_URL="https://[blob-url]/hero-video.mp4"
NEXT_PUBLIC_LIGHT_VIDEO_URL="https://[blob-url]/aircrafts/light_video.mp4"
NEXT_PUBLIC_MEDIUM_VIDEO_URL="https://[blob-url]/aircrafts/medium_video.mp4"
NEXT_PUBLIC_HEAVY_VIDEO_URL="https://[blob-url]/aircrafts/heavy_video.mp4"
NEXT_PUBLIC_PISTON_VIDEO_URL="https://[blob-url]/aircrafts/piston_video.mp4"
```

Also add to Vercel project settings (Production environment).

#### 3.3 Update Components

Find components using videos:
```bash
grep -r "hero-video\|light_video\|medium_video\|heavy_video\|piston_video" src/
```

Replace hardcoded paths with imports from `src/config/videos.ts`.

**Example for Hero component:**
```typescript
import { videoUrls } from '@/config/videos';

// Replace:
<video src="/images/hero-video.mp4" ... />

// With:
<video src={videoUrls.hero} ... />
```

---

### Phase 4: Test (15 min)

1. **Test locally:**
   ```bash
   npm run dev
   ```
   - Verify videos load from CDN URLs
   - Check browser network tab
   - Confirm no 404 errors

2. **Test production build:**
   ```bash
   npm run build
   npm start
   ```

3. **Verify bundle size:**
   ```bash
   ls -lh .next/standalone/
   ```
   - Should be ~26MB smaller

---

### Phase 5: Deploy & Cleanup (15 min)

1. **Deploy to production:**
   ```bash
   git add .
   git commit -m "feat: migrate videos to CDN (saves 26MB)"
   git push
   ```

2. **Monitor deployment:**
   - Check Vercel deployment logs
   - Test videos on production URL
   - Verify CDN serving (check response headers)

3. **Delete local videos (after confirming CDN works):**
   ```bash
   rm public/images/hero-video.mp4
   rm public/images/aircrafts/*/\*_video.mp4
   ```

4. **Update `.gitignore` (optional):**
   ```gitignore
   # Videos (hosted on CDN)
   *.mp4
   ```

5. **Commit cleanup:**
   ```bash
   git add .
   git commit -m "chore: remove local videos (migrated to CDN)"
   git push
   ```

---

## 🎯 SUCCESS METRICS

### Before Migration
```
Public directory size: 97MB
Hero video: Served locally (2.2MB)
Aircraft videos: Served locally (24MB)
Page load time: ~4-6 seconds (on slow 3G)
Lighthouse Performance: ~65
```

### After Migration
```
Public directory size: 71MB → 7MB after image optimization
Hero video: Served from CDN (streaming)
Aircraft videos: Served from CDN (streaming)
Page load time: ~1-2 seconds (on slow 3G)
Lighthouse Performance: ~85+
```

---

## ⚠️ IMPORTANT CONSIDERATIONS

### 1. Video Lazy Loading
After CDN migration, implement lazy loading for below-fold videos:

```typescript
<video
  src={videoUrls.aircraft.light}
  loading="lazy" // Native lazy loading
  preload="none"  // Don't preload
  // ... other props
/>
```

### 2. Fallback Strategy
Always include fallback for CDN failures:

```typescript
const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
  console.error('CDN video failed, trying fallback');
  e.currentTarget.src = '/images/fallback.mp4'; // Local fallback
};

<video
  src={videoUrls.hero}
  onError={handleVideoError}
/>
```

### 3. Cache Headers
Verify CDN sets proper cache headers:
```
Cache-Control: public, max-age=31536000, immutable
```

### 4. Video Optimization
Before uploading to CDN, consider optimizing videos:
```bash
# Install ffmpeg
brew install ffmpeg

# Optimize video (reduce file size, maintain quality)
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4
```

**Potential savings:**
- Hero video: 2.2MB → ~1MB
- Aircraft videos: 24MB → ~12MB

---

## 📅 TIMELINE

| Phase | Duration | Status |
|-------|----------|--------|
| 1. Setup Vercel Blob | 30 min | ⏳ Not started |
| 2. Upload videos | 15 min | ⏳ Not started |
| 3. Update code | 30 min | ⏳ Not started |
| 4. Testing | 15 min | ⏳ Not started |
| 5. Deploy & cleanup | 15 min | ⏳ Not started |
| **TOTAL** | **~2 hours** | **Planning phase** |

---

## 🔄 ROLLBACK PLAN

If CDN migration causes issues:

1. **Immediate rollback:**
   ```bash
   git revert HEAD
   git push
   ```

2. **Restore local videos:**
   ```bash
   git checkout HEAD~1 -- public/images/
   ```

3. **Update environment variables:**
   - Remove `NEXT_PUBLIC_*_VIDEO_URL` variables
   - Videos will fall back to local paths

4. **Redeploy:**
   ```bash
   git push
   ```

---

## 📝 CHECKLIST

Before starting migration:
- [ ] Choose CDN provider (Vercel Blob recommended)
- [ ] Create Blob storage / bucket
- [ ] Get API credentials
- [ ] Set up environment variables locally

During migration:
- [ ] Install dependencies
- [ ] Upload videos to CDN
- [ ] Verify uploads successful
- [ ] Create video configuration file
- [ ] Update all components using videos
- [ ] Test locally
- [ ] Test production build

After deployment:
- [ ] Verify videos load from CDN
- [ ] Check Lighthouse scores
- [ ] Monitor error logs
- [ ] Delete local videos (keep backup for 1 week)
- [ ] Update documentation

---

## 🎓 FUTURE IMPROVEMENTS

After successful CDN migration:

1. **Adaptive Bitrate Streaming**
   - Generate multiple video qualities (480p, 720p, 1080p)
   - Use HLS or DASH for adaptive streaming
   - Better experience on slow connections

2. **Video Thumbnails**
   - Generate poster images from first frame
   - Faster perceived load time

3. **Analytics**
   - Track video play rates
   - Monitor CDN performance
   - Identify popular content

4. **Cost Optimization**
   - Monitor actual bandwidth usage
   - Consider migration to R2 if costs increase
   - Implement caching strategies

---

**Prepared by:** Claude Code
**Date:** January 6, 2026
**Status:** Ready for implementation
**Estimated effort:** 2 hours
**Expected impact:** 26MB reduction, faster page loads
