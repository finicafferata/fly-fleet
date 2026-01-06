# reCAPTCHA v3 Setup Guide for Production

## The Problem

You're currently using **Google's test keys** which only work on `localhost`. This is why you're seeing `invalid-input-response` errors in production.

## Step-by-Step Solution

### 1. Register Your Site with Google reCAPTCHA

1. Go to: https://www.google.com/recaptcha/admin/create
2. Log in with your Google account
3. Fill in the form:
   - **Label**: `Fly-Fleet Production` (or any name you want)
   - **reCAPTCHA type**: Select **"reCAPTCHA v3"**
   - **Domains**: Add your production domains:
     - `fly-fleet.com` (or your actual domain)
     - `www.fly-fleet.com`
     - `*.railway.app` (if deploying to Railway)
     - `*.vercel.app` (if deploying to Vercel)
     - `localhost` (for local testing)
4. Accept the terms and click **Submit**

### 2. Get Your Keys

After registration, Google will provide:
- **Site Key** (starts with `6L...`) - This is public, goes in the frontend
- **Secret Key** (starts with `6L...`) - This is private, goes in the backend

### 3. Configure Environment Variables

#### Local Development (`.env.local`):
```bash
# reCAPTCHA v3 Configuration (PRODUCTION KEYS)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your_actual_site_key_here"
RECAPTCHA_SECRET_KEY="your_actual_secret_key_here"
```

#### Production (Railway/Vercel/etc):

**On Railway:**
1. Go to your project settings
2. Navigate to "Variables" tab
3. Add these environment variables:
   - `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` = `your_actual_site_key_here`
   - `RECAPTCHA_SECRET_KEY` = `your_actual_secret_key_here`
4. Redeploy your application

**On Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the same variables as above
4. Redeploy

### 4. Test the Configuration

1. Deploy your application with the new keys
2. Open the browser console and check for these messages:
   - ✅ `reCAPTCHA script loaded`
   - ✅ `reCAPTCHA ready`
   - ✅ `reCAPTCHA token generated for action: quote_request`

3. Submit a quote form and verify:
   - No `invalid-input-response` errors
   - Token should look like: `03AFcWeA...` (long token, NOT `mock-token-...`)

### 5. Verify Backend

Check your server logs for:
```
✅ reCAPTCHA ready
✅ reCAPTCHA token generated for action: quote_request
```

NOT:
```
🚨 Suspicious reCAPTCHA attempt
```

## Security Best Practices

1. **Never commit real keys to git**: Use `.env.local` (already in `.gitignore`)
2. **Use different keys for different environments**:
   - Development: Test keys (current ones are fine)
   - Production: Real keys from Google Console

3. **Score threshold**: Currently set to `0.5` (in `RecaptchaService.ts`)
   - Adjust if you get too many false positives/negatives
   - Lower = more lenient, Higher = more strict

## Troubleshooting

### If you still see "invalid-input-response":

1. **Check domain configuration**: Make sure your production domain is registered in Google reCAPTCHA console
2. **Check environment variables**: Verify keys are correctly set in production
3. **Clear cache**: Sometimes old keys are cached
4. **Check browser console**: Look for reCAPTCHA loading errors

### If grecaptcha is not loading:

1. Check Content Security Policy (CSP) headers
2. Verify no ad blockers are interfering
3. Check that `ReCaptchaLoader` is mounted in root layout (already done ✅)

## Current Status

- ❌ Using test keys (only work on localhost)
- ✅ Code is correct and ready for production
- ⏳ **Next step**: Register real keys and configure them

## Resources

- [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Site Verification](https://developers.google.com/recaptcha/docs/verify)
