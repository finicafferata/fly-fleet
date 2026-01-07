# =============================================================================
# FLY-FLEET VERCEL ENVIRONMENT VARIABLES
# Complete list for production deployment
# =============================================================================

# -----------------------------------------------------------------------------
# DATABASE (Neon PostgreSQL)
# -----------------------------------------------------------------------------
# Pooled connection for runtime queries (uses pgBouncer)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"

# Direct connection for migrations (bypasses pgBouncer)
DIRECT_DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# -----------------------------------------------------------------------------
# REDIS (Upstash) - Distributed Rate Limiting & Caching
# -----------------------------------------------------------------------------
UPSTASH_REDIS_REST_URL="https://xxx-xxx-xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXXXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# -----------------------------------------------------------------------------
# EMAIL SERVICE (Resend)
# -----------------------------------------------------------------------------
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
RESEND_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
BUSINESS_EMAIL="contact@fly-fleet.com"
NOREPLY_EMAIL="noreply@fly-fleet.com"

# -----------------------------------------------------------------------------
# SECURITY (reCAPTCHA v3)
# -----------------------------------------------------------------------------
RECAPTCHA_SECRET_KEY="6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
RECAPTCHA_SCORE_THRESHOLD="0.5"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# -----------------------------------------------------------------------------
# APPLICATION URLS
# -----------------------------------------------------------------------------
NEXT_PUBLIC_BASE_URL="https://fly-fleet.vercel.app"
FRONTEND_URL="https://fly-fleet.vercel.app"

# Optional: Custom domain after DNS setup
# NEXT_PUBLIC_BASE_URL="https://fly-fleet.com"
# FRONTEND_URL="https://fly-fleet.com"

# -----------------------------------------------------------------------------
# WHATSAPP BUSINESS
# -----------------------------------------------------------------------------
WHATSAPP_BUSINESS_NUMBER="+1234567890"

# -----------------------------------------------------------------------------
# ADMIN AUTHENTICATION (NextAuth)
# -----------------------------------------------------------------------------
# Generate a secure random string for NEXTAUTH_SECRET:
# Run: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-32-character-string-here"

# Admin credentials for /admin/login
ADMIN_EMAIL="admin@fly-fleet.com"
ADMIN_PASSWORD="your-secure-admin-password-here"

# -----------------------------------------------------------------------------
# VERCEL (Automatically set by platform)
# -----------------------------------------------------------------------------
# These are provided automatically by Vercel:
# VERCEL="1"
# VERCEL_ENV="production"
# VERCEL_URL="fly-fleet-xxx.vercel.app"
# VERCEL_REGION="iad1"

# -----------------------------------------------------------------------------
# NODE ENVIRONMENT
# -----------------------------------------------------------------------------
NODE_ENV="production"

# -----------------------------------------------------------------------------
# OPTIONAL: External Observability (Honeycomb, Datadog, etc.)
# -----------------------------------------------------------------------------
# Uncomment if using external APM provider:
# OTEL_EXPORTER_OTLP_ENDPOINT="https://api.honeycomb.io"
# HONEYCOMB_API_KEY="your_honeycomb_api_key"

# -----------------------------------------------------------------------------
# OPTIONAL: Video CDN (Future enhancement)
# -----------------------------------------------------------------------------
# After migrating videos to Vercel Blob Storage:
# NEXT_PUBLIC_HERO_VIDEO_URL="https://xxx.vercel-storage.com/hero.mp4"
# NEXT_PUBLIC_LIGHT_VIDEO_URL="https://xxx.vercel-storage.com/light.mp4"
# NEXT_PUBLIC_MEDIUM_VIDEO_URL="https://xxx.vercel-storage.com/medium.mp4"
# NEXT_PUBLIC_HEAVY_VIDEO_URL="https://xxx.vercel-storage.com/heavy.mp4"
# NEXT_PUBLIC_PISTON_VIDEO_URL="https://xxx.vercel-storage.com/piston.mp4"
