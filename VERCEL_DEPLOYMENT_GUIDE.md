# Fly-Fleet Vercel Deployment Guide

## ✅ Phase 1: Foundation & Critical Fixes - COMPLETED

All critical serverless compatibility issues have been resolved:

### What Was Changed

#### 1. **Prisma Singleton Pattern** ✅
- **Created**: `/src/lib/database/prisma.ts` - Centralized Prisma client instance
- **Fixed**: Replaced 23+ separate `new PrismaClient()` instances across:
  - 17 API routes
  - 6 service files (EmailService, ContentService, FAQService, QuoteStatusService, WhatsAppService, ResendWebhookService)
- **Result**: Prevents "too many connections" errors in serverless environment

#### 2. **Database Configuration** ✅
- **Updated**: `/prisma/schema.prisma` with `directUrl` support
- **Configured**: For Neon serverless database with built-in connection pooling
- **Environment**: Separate URLs for pooled connections (runtime) and direct connections (migrations)

#### 3. **Vercel Configuration** ✅
- **Created**: `/vercel.json` with:
  - Function timeout configurations (10-15s based on route complexity)
  - Security headers (X-Frame-Options, CSP, HSTS, etc.)
  - Cache control headers for static assets
  - Memory allocation (1024MB per function)
- **Updated**: `/next.config.ts`:
  - Removed `output: 'standalone'` (Railway-specific)
  - Updated image domains from `**.railway.app` to `**.vercel.app`
  - Added `**.vercel-storage.com` for CDN assets

#### 4. **Environment Variables** ✅
- **Updated**: `.env.example` with Vercel-specific configuration:
  - Neon database URLs (pooled + direct)
  - Vercel deployment URLs
  - Email service configuration (BUSINESS_EMAIL, NOREPLY_EMAIL)
  - WhatsApp configuration

---

## 🚀 Next Steps: Deploying to Vercel

### Prerequisites

1. **Vercel Account**
   - Email: `Vickypericoli@gmail.com`
   - Password: `Fatiga2026&`
   - Login at: https://vercel.com/login

2. **Neon Database Account**
   - Create account at: https://neon.tech
   - Or use existing Vercel Postgres

### Step 1: Create Neon Database (10 minutes)

```bash
# 1. Go to https://console.neon.tech
# 2. Create new project: "fly-fleet-production"
# 3. Select region: US East (N. Virginia) - closest to Vercel iad1
# 4. Copy connection strings:
#    - Pooled connection (for DATABASE_URL)
#    - Direct connection (for DIRECT_DATABASE_URL)
```

**Connection String Format:**
```
# Pooled (runtime)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?pgbouncer=true"

# Direct (migrations)
DIRECT_DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb"
```

### Step 2: Migrate Data from Railway (Optional)

If you have existing data on Railway:

```bash
# Export from Railway
pg_dump $RAILWAY_DATABASE_URL > backup.sql

# Import to Neon
psql $NEON_DATABASE_URL < backup.sql

# Verify migration
psql $NEON_DATABASE_URL -c "SELECT COUNT(*) FROM quote_requests;"
psql $NEON_DATABASE_URL -c "SELECT COUNT(*) FROM contact_forms;"
```

### Step 3: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Set environment variables (you'll be prompted)
vercel env add DATABASE_URL production
vercel env add DIRECT_DATABASE_URL production
vercel env add RESEND_API_KEY production
vercel env add RECAPTCHA_SECRET_KEY production
# ... (add all variables from .env.example)

# Deploy to production
vercel --prod
```

#### Option B: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import Git repository
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `./`
5. Build command: `npm run build` (default)
6. Output directory: `.next` (default)
7. Install command: `npm install` (default)

### Step 4: Configure Environment Variables in Vercel

Go to: Project Settings → Environment Variables

Add these variables for **Production** environment:

```env
# Database (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?pgbouncer=true
DIRECT_DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db

# Email (Resend)
RESEND_API_KEY=re_your_api_key
RESEND_WEBHOOK_SECRET=whsec_your_webhook_secret
BUSINESS_EMAIL=contact@fly-fleet.com
NOREPLY_EMAIL=noreply@fly-fleet.com

# Security (reCAPTCHA)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LeXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=6LeXXXXXXXXXXXXXXXXXX
RECAPTCHA_SCORE_THRESHOLD=0.5

# Application URLs
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
FRONTEND_URL=https://your-domain.vercel.app
ADMIN_URL=https://admin.your-domain.vercel.app

# WhatsApp
WHATSAPP_BUSINESS_NUMBER=+1234567890
WHATSAPP_BUSINESS_PHONE=5491166601927

# Optional
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Step 5: Run Database Migrations

After deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy

# Or directly via Neon dashboard SQL editor
```

### Step 6: Configure Custom Domain (GoDaddy)

**GoDaddy Account**: Customer #667920057

#### In Vercel Dashboard:

1. Go to Project Settings → Domains
2. Add domain: `fly-fleet.com`
3. Add subdomain: `www.fly-fleet.com`

#### In GoDaddy DNS Management:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 600

Type: A
Name: @
Value: 76.76.21.21
TTL: 600
```

### Step 7: Configure Resend Email Domain

1. Go to: https://resend.com/domains
2. Add domain: `fly-fleet.com`
3. Copy DNS records
4. Add to GoDaddy DNS:

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all

Type: TXT
Name: resend._domainkey
Value: [provided by Resend]

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:contact@fly-fleet.com
```

### Step 8: Verify Deployment

#### Health Check:
```bash
curl https://your-domain.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "application": "running"
  }
}
```

#### Test Quote Submission:
```bash
curl -X POST https://your-domain.vercel.app/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "service": "charter",
    "fullName": "Test User",
    "email": "test@example.com",
    "passengers": 4,
    "origin": "MIA",
    "destination": "LAX",
    "date": "2026-02-15",
    "time": "14:00",
    "standardBagsCount": 2,
    "pets": false,
    "privacyConsent": true,
    "locale": "en",
    "recaptchaToken": "test"
  }'
```

---

## 📊 Success Criteria

After deployment, verify:

- ✅ `/api/health` returns status 200
- ✅ Quote form submission works
- ✅ Contact form submission works
- ✅ Emails are being sent via Resend
- ✅ No database connection errors in logs
- ✅ Response times < 1 second
- ✅ Custom domain resolves correctly

---

## 🐛 Troubleshooting

### Issue: "Too Many Connections" Error

**Symptom**: `Error: Can't reach database server`

**Solution**:
1. Verify DATABASE_URL has `?pgbouncer=true` parameter
2. Check Neon connection pooling is enabled
3. Verify using Prisma singleton (not `new PrismaClient()`)

### Issue: Build Fails

**Symptom**: Vercel build fails with TypeScript errors

**Current Config**: `typescript.ignoreBuildErrors = true` (intentional)

**Solution**: If needed, fix TypeScript errors locally:
```bash
npm run lint
npx tsc --noEmit
```

### Issue: Slow Response Times

**Symptom**: API responses take > 3 seconds

**Solution**:
1. Check function timeout in vercel.json (increase if needed)
2. Verify Neon database region matches Vercel region
3. Check function cold start time in Vercel dashboard

### Issue: Email Not Sending

**Symptom**: Emails not received, no errors in logs

**Solution**:
1. Verify RESEND_API_KEY is correct
2. Check domain verification in Resend dashboard
3. Verify DNS records (SPF, DKIM, DMARC)
4. Check Resend webhook is configured:
   ```
   https://your-domain.vercel.app/api/webhooks/resend
   ```

---

## 📈 Monitoring & Performance

### Vercel Dashboard Metrics

Monitor these in Vercel Analytics:

1. **Function Duration**: Should be < 1s for 95th percentile
2. **Function Errors**: Should be < 0.1%
3. **Cold Starts**: Should be < 500ms
4. **Bandwidth Usage**: Track for cost optimization

### Database Monitoring

In Neon Dashboard:

1. **Connection Count**: Should not exceed pool limit
2. **Query Performance**: Identify slow queries
3. **Storage Usage**: Monitor database growth

---

## 🔐 Security Checklist

- ✅ All environment variables are set
- ✅ reCAPTCHA is enabled on forms
- ✅ Security headers configured (X-Frame-Options, CSP, etc.)
- ✅ HTTPS enforced (automatic with Vercel)
- ✅ Database uses SSL connection (automatic with Neon)
- ✅ Webhook secrets configured for Resend

---

## 💰 Cost Estimation

**Neon Database (Free Tier)**:
- Compute: 300 hours/month
- Storage: 0.5 GB
- Suitable for: Development + light production

**Vercel (Hobby Plan - Free)**:
- 100 GB bandwidth
- 100 GB-hours function execution
- Custom domains included
- Suitable for: Small traffic (~10k visitors/month)

**Vercel (Pro Plan - $20/month)**:
- Unlimited bandwidth
- 1000 GB-hours function execution
- Priority support
- Suitable for: Production traffic

**Resend (Free Tier)**:
- 100 emails/day
- 1 custom domain
- Upgrade to $20/month for 50k emails

---

## 📞 Support Contacts

**Vercel Account**:
- Email: Vickypericoli@gmail.com
- Password: Fatiga2026&

**Email Service**:
- Business: contact@fly-fleet.com (Password: Fatiga2025$)

**GoDaddy**:
- Customer #: 667920057

**Need Help?**
- Vercel Support: https://vercel.com/help
- Neon Support: https://neon.tech/docs
- Resend Support: https://resend.com/docs

---

## 🎯 Phase 2: Distributed Services (NEXT)

After successful Vercel deployment, implement Redis for distributed caching:

1. **Setup Upstash Redis** (~30 min)
   - Create account at upstash.com
   - Create Redis database
   - Get REST URL and token

2. **Install Dependencies** (~5 min)
   ```bash
   npm install @upstash/redis @upstash/ratelimit
   ```

3. **Implement Distributed Rate Limiting** (~2 hours)
   - Replace in-memory Map with Redis
   - Update quote and contact routes
   - Update reCAPTCHA cache

See full plan at: `/Users/finicafferata/.claude/plans/radiant-leaping-puzzle.md`

---

**Status**: Phase 1 Complete ✅ | Ready for Vercel Deployment 🚀
