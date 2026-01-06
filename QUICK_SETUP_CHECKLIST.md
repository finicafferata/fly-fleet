# Quick Setup Checklist - Vercel Deployment

Complete checklist for deploying Fly-Fleet to Vercel with all services.

## Prerequisites

- [ ] GitHub account with fly-fleet repository access
- [ ] Vercel account (vickypericoli@gmail.com / Fatiga2026&)
- [ ] GoDaddy account for DNS (customer #667920057)

---

## 1. Neon Database Setup (15 minutes)

- [ ] **Create Neon account**: https://neon.tech
- [ ] **Create project**: "fly-fleet-production", Region: US East (Ohio)
- [ ] **Copy connection strings**:
  ```bash
  # Pooled (for runtime)
  DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"

  # Direct (for migrations)
  DIRECT_DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
  ```

- [ ] **Choose migration path**:

  **Option A - Fresh Start:**
  ```bash
  # Update .env.local with Neon URLs
  npx prisma db push
  npx prisma studio  # Verify schema
  ```

  **Option B - Migrate from Railway:**
  ```bash
  # Export from Railway
  pg_dump $RAILWAY_DATABASE_URL > backup.sql

  # Import to Neon (use DIRECT URL)
  psql $NEON_DIRECT_URL < backup.sql

  # Verify data
  psql $NEON_DIRECT_URL -c "SELECT COUNT(*) FROM \"QuoteRequest\""
  ```

---

## 2. Upstash Redis Setup (10 minutes)

- [ ] **Create Upstash account**: https://upstash.com
- [ ] **Create Redis database**:
  - Name: "fly-fleet-cache"
  - Type: Regional
  - Region: US-East-1 (Virginia)
  - Eviction: No eviction (recommended for rate limiting)

- [ ] **Copy credentials**:
  ```bash
  UPSTASH_REDIS_REST_URL="https://xxx-xxx-xxx.upstash.io"
  UPSTASH_REDIS_REST_TOKEN="AXXXxxxxxxxxxxxxxxxxxxxxx"
  ```

---

## 3. Vercel Project Setup (10 minutes)

- [ ] **Login to Vercel**: https://vercel.com/login
  - Email: vickypericoli@gmail.com
  - Password: Fatiga2026&

- [ ] **Import project**:
  - Click **Add New** → **Project**
  - Import from GitHub: `finicafferata/fly-fleet`
  - Framework: Next.js (auto-detected)
  - Root Directory: `./`
  - Build Command: `npm run build` (default)

- [ ] **Configure build settings**:
  - Node version: 18.x or 20.x
  - Install Command: `npm install`

- [ ] **Deploy** (first deployment will fail - need env vars)

---

## 4. Add Environment Variables to Vercel (15 minutes)

Go to: **Project Settings** → **Environment Variables**

Add each variable below for **all environments** (Production, Preview, Development):

### Database (Neon)
```
DATABASE_URL
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true

DIRECT_DATABASE_URL
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### Redis (Upstash)
```
UPSTASH_REDIS_REST_URL
https://xxx-xxx-xxx.upstash.io

UPSTASH_REDIS_REST_TOKEN
AXXXxxxxxxxxxxxxxxxxxxxxx
```

### Email (Resend) - Get from Railway or Resend dashboard
```
RESEND_API_KEY
re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

RESEND_WEBHOOK_SECRET
whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

BUSINESS_EMAIL
contact@fly-fleet.com

NOREPLY_EMAIL
noreply@fly-fleet.com
```

### reCAPTCHA (Google) - Get from Google reCAPTCHA admin
```
RECAPTCHA_SECRET_KEY
6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

RECAPTCHA_SCORE_THRESHOLD
0.5

NEXT_PUBLIC_RECAPTCHA_SITE_KEY
6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Application URLs
```
NEXT_PUBLIC_BASE_URL
https://fly-fleet.vercel.app

FRONTEND_URL
https://fly-fleet.vercel.app
```

### WhatsApp
```
WHATSAPP_BUSINESS_NUMBER
+1234567890
```

### Node Environment
```
NODE_ENV
production
```

---

## 5. Redeploy with Environment Variables

- [ ] **Trigger new deployment**:
  - Go to **Deployments** tab
  - Click **Redeploy** on latest deployment
  - Or push a new commit to GitHub

- [ ] **Wait for deployment** (~2-3 minutes)

- [ ] **Check deployment logs** for errors

---

## 6. Test Deployment (10 minutes)

- [ ] **Health check**:
  ```bash
  curl https://fly-fleet.vercel.app/api/health
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

- [ ] **Test quote form**: https://fly-fleet.vercel.app/en
  - Fill out quote request
  - Submit form
  - Check email delivery

- [ ] **Test contact form**: https://fly-fleet.vercel.app/en
  - Fill out contact form
  - Submit
  - Verify email received

- [ ] **Check rate limiting**:
  ```bash
  # Submit 8 quotes rapidly
  for i in {1..8}; do
    curl -X POST https://fly-fleet.vercel.app/api/quote \
      -H "Content-Type: application/json" \
      -d '{...}'
  done
  # 8th request should return 429 (rate limited)
  ```

---

## 7. Domain Setup - GoDaddy to Vercel (20 minutes)

### A. Add Domain to Vercel

- [ ] Go to **Project Settings** → **Domains**
- [ ] Click **Add Domain**
- [ ] Enter: `fly-fleet.com`
- [ ] Vercel will show DNS records to add

### B. Configure DNS in GoDaddy

- [ ] Login to GoDaddy: https://dcc.godaddy.com
  - Customer #: 667920057

- [ ] Go to **DNS Management** for fly-fleet.com

- [ ] **Add A Record** (for apex domain):
  ```
  Type: A
  Name: @
  Value: 76.76.21.21
  TTL: 600 seconds
  ```

- [ ] **Add CNAME Record** (for www):
  ```
  Type: CNAME
  Name: www
  Value: cname.vercel-dns.com
  TTL: 600 seconds
  ```

- [ ] **Wait for propagation** (5-30 minutes)
  ```bash
  # Check DNS propagation
  dig fly-fleet.com
  dig www.fly-fleet.com
  ```

### C. Update Environment Variables

- [ ] Update in Vercel:
  ```
  NEXT_PUBLIC_BASE_URL → https://fly-fleet.com
  FRONTEND_URL → https://fly-fleet.com
  ```

- [ ] Redeploy

### D. Enable SSL

- [ ] Vercel automatically provisions SSL certificate
- [ ] Wait for "Ready" status in Domains tab (~5 minutes)
- [ ] Test: https://fly-fleet.com

---

## 8. Configure Webhooks (5 minutes)

### Resend Webhook

- [ ] Go to Resend dashboard → Webhooks
- [ ] Add webhook URL:
  ```
  https://fly-fleet.com/api/webhooks/resend
  ```
- [ ] Select events: `email.sent`, `email.delivered`, `email.bounced`, `email.complained`
- [ ] Copy webhook secret
- [ ] Update `RESEND_WEBHOOK_SECRET` in Vercel

---

## 9. Set Up Monitoring (10 minutes)

### Vercel Analytics

- [ ] Go to **Analytics** tab
- [ ] Enable Web Analytics (free)
- [ ] Enable Speed Insights (free)

### Vercel Logs

- [ ] Go to **Logs** tab
- [ ] View real-time logs
- [ ] Set up log filters for errors

### Upstash Redis Monitoring

- [ ] Login to Upstash dashboard
- [ ] Check **Metrics** tab
- [ ] Monitor connection count, memory usage

### Neon Database Monitoring

- [ ] Login to Neon dashboard
- [ ] Check **Metrics** tab
- [ ] Monitor connection pool, query performance

---

## 10. Final Verification Checklist

### Application
- [ ] Homepage loads: https://fly-fleet.com
- [ ] All languages work: /en, /es, /pt
- [ ] Quote form submits successfully
- [ ] Contact form submits successfully
- [ ] WhatsApp widget appears and works
- [ ] Email notifications received (business + customer)

### API Endpoints
- [ ] `/api/health` returns 200
- [ ] `/api/quote` accepts submissions
- [ ] `/api/contact` accepts submissions
- [ ] `/api/whatsapp/link` generates links
- [ ] `/api/faqs/en` returns FAQs

### Performance
- [ ] Page load time < 2 seconds
- [ ] API response time < 1 second
- [ ] No console errors in browser
- [ ] Lighthouse score > 90

### Observability
- [ ] Vercel logs show request traces
- [ ] Errors logged with stack traces
- [ ] Metrics visible in Vercel dashboard

---

## Troubleshooting Common Issues

### ❌ "Database connection failed"
**Solution:**
1. Check `DATABASE_URL` has `pgbouncer=true`
2. Verify Neon database is active (check dashboard)
3. Test connection locally: `npx prisma db execute --stdin <<< "SELECT 1"`

### ❌ "Rate limit not working"
**Solution:**
1. Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
2. Verify Redis is accessible: Test in Upstash dashboard → Data Browser
3. Check logs for Redis connection errors

### ❌ "Emails not sending"
**Solution:**
1. Verify `RESEND_API_KEY` is valid
2. Check Resend dashboard for failed sends
3. Verify sender email domain is verified in Resend

### ❌ "reCAPTCHA failed"
**Solution:**
1. Check `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` matches secret key
2. Verify domain is registered in Google reCAPTCHA admin
3. Add `fly-fleet.com` to allowed domains

### ❌ "Deployment failed"
**Solution:**
1. Check build logs in Vercel
2. Run `npm run build` locally to test
3. Ensure all environment variables are set
4. Check Node.js version compatibility

---

## Post-Deployment Tasks

### Week 1
- [ ] Monitor error logs daily
- [ ] Check database performance
- [ ] Verify email delivery rates
- [ ] Test from multiple devices/browsers

### Week 2-4
- [ ] Set up Vercel alerts for errors
- [ ] Configure Neon backups (automatic on paid plan)
- [ ] Review Upstash Redis analytics
- [ ] Optimize based on real traffic patterns

### Ongoing
- [ ] Weekly review of metrics
- [ ] Monthly security updates (`npm audit`)
- [ ] Quarterly dependency updates
- [ ] Monitor costs (Neon, Upstash, Vercel)

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Upstash Docs**: https://docs.upstash.com
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

## Estimated Total Time: 2-3 hours

**Quick path (existing services)**: ~1 hour
**Full setup (new services)**: ~3 hours

---

✅ **Checklist complete!** Your Fly-Fleet application is now running on Vercel with enterprise-grade infrastructure!
