# Vercel Postgres Setup (Recommended)

**Easiest option**: Use Vercel's built-in PostgreSQL database powered by Neon.

## Why Vercel Postgres?

- ✅ One-click setup in Vercel dashboard
- ✅ Automatically configures environment variables
- ✅ Same Neon technology (serverless, auto-scaling)
- ✅ Built-in connection pooling with pgBouncer
- ✅ No separate account needed
- ✅ Seamless integration

## Step-by-Step Setup (5 minutes)

### 1. Create Database in Vercel

1. Go to https://vercel.com/dashboard
2. Select your **fly-fleet** project
3. Click **Storage** tab in the top menu
4. Click **Create Database**
5. Select **Postgres**
6. Enter database name: `fly-fleet-db`
7. Select region: **US East (iad1)** - same as your deployment
8. Click **Create**

Wait 10-20 seconds for provisioning.

### 2. Connect to Your Project

1. After creation, you'll see "Connect Project"
2. Select your **fly-fleet** project
3. Click **Connect**

Vercel automatically adds these environment variables to your project:
```
POSTGRES_URL                  # Non-pooled connection
POSTGRES_URL_NON_POOLING      # Same as above
POSTGRES_PRISMA_URL           # Pooled connection (for Prisma)
POSTGRES_USER                 # Database username
POSTGRES_HOST                 # Database host
POSTGRES_PASSWORD             # Database password
POSTGRES_DATABASE             # Database name
```

### 3. Update Prisma Schema

The current schema uses `DATABASE_URL` and `DIRECT_DATABASE_URL`.

**Option A - Use Vercel's variable names (recommended):**

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")      // Pooled for queries
  directUrl = env("POSTGRES_URL_NON_POOLING") // Direct for migrations
}
```

Then update environment variables in Vercel:
```
# Remove these (if you added them):
DATABASE_URL
DIRECT_DATABASE_URL

# Vercel Postgres automatically provides:
POSTGRES_PRISMA_URL (already added)
POSTGRES_URL_NON_POOLING (already added)
```

**Option B - Map to existing variable names:**

Keep your schema as-is and add aliases in Vercel:
```
DATABASE_URL = Copy value from POSTGRES_PRISMA_URL
DIRECT_DATABASE_URL = Copy value from POSTGRES_URL_NON_POOLING
```

**Recommendation: Use Option A** - Cleaner and uses Vercel's standard naming.

### 4. Update Local Environment

For local development, get connection strings from Vercel:

1. In Vercel dashboard → Storage → fly-fleet-db
2. Click **Settings** tab
3. Copy connection strings

Create/update `.env.local`:
```bash
# Copy from Vercel dashboard
POSTGRES_PRISMA_URL="postgres://default:xxx@ep-xxx-xxx.us-east-2.aws.neon.tech:5432/verceldb?sslmode=require&pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://default:xxx@ep-xxx-xxx.us-east-2.aws.neon.tech:5432/verceldb?sslmode=require&connect_timeout=15"

# Other environment variables
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
# ... rest of your variables
```

### 5. Push Database Schema

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Vercel Postgres
npx prisma db push

# Verify with Prisma Studio
npx prisma studio
```

You should see all your tables created in the database.

### 6. Deploy and Test

```bash
# Deploy to Vercel
vercel --prod

# Test health endpoint
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-06T...",
  "services": {
    "database": "connected",
    "application": "running"
  }
}
```

## Vercel Postgres Dashboard Features

### Query Editor
- Click **Query** tab
- Run SQL queries directly in browser
- Example: `SELECT COUNT(*) FROM "QuoteRequest";`

### Data Browser
- Click **Data** tab
- View tables and records
- Similar to Prisma Studio

### Metrics
- Click **Insights** tab
- View connection count
- Query performance
- Storage usage

### Settings
- Connection pooling configuration
- Database size limits
- Backup settings (paid plans)

## Migrating Existing Data from Railway

If you have existing data in Railway:

### 1. Export from Railway

```bash
# Get Railway database URL from dashboard
export RAILWAY_DATABASE_URL="postgresql://..."

# Export data
pg_dump $RAILWAY_DATABASE_URL > fly-fleet-backup.sql
```

### 2. Import to Vercel Postgres

```bash
# Get DIRECT connection from Vercel (non-pooled)
# Vercel Dashboard → Storage → fly-fleet-db → Settings
export VERCEL_POSTGRES_URL="postgres://default:xxx@ep-xxx.us-east-2.aws.neon.tech:5432/verceldb?sslmode=require"

# Import data (use non-pooled connection)
psql $VERCEL_POSTGRES_URL < fly-fleet-backup.sql
```

### 3. Verify Migration

```bash
# Connect to Vercel Postgres
psql $VERCEL_POSTGRES_URL

# Check tables
\dt

# Check record counts
SELECT COUNT(*) FROM "QuoteRequest";
SELECT COUNT(*) FROM "ContactForm";

# Exit
\q
```

## Comparison: Vercel Postgres vs Neon Direct

| Feature | Vercel Postgres | Neon Direct |
|---------|----------------|-------------|
| Setup Time | 5 minutes | 15 minutes |
| Integration | Automatic | Manual |
| Environment Variables | Auto-added | Manual setup |
| Account Needed | No (Vercel only) | Yes (Neon + Vercel) |
| Dashboard | Vercel + Neon | Neon only |
| Database Branching | Yes (Neon console) | Yes |
| Monitoring | Vercel + Neon | Neon only |
| Pricing | Same | Same |
| Technology | Neon | Neon |

**Bottom line:** Vercel Postgres is Neon with better Vercel integration.

## Pricing

**Free Tier (Hobby):**
- 0.5 GB storage
- Unlimited queries
- 60 compute hours/month
- **Perfect for small apps and development**

**Pro Tier ($20/month):**
- 10 GB storage included
- Unlimited compute hours
- Better performance
- Point-in-time recovery
- **Recommended for production**

Same pricing as Neon direct, but with Vercel integration included.

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"

**Solution:**
```bash
npx prisma generate
npm run build
```

### Error: "Connection timeout"

**Solution:**
- Vercel Postgres auto-suspends after inactivity
- First request after suspension takes 5-10 seconds
- Upgrade to Pro for always-on database

### Error: "SSL required"

**Solution:** Connection strings automatically include `sslmode=require`. Verify it's present.

### Can't see data in dashboard

**Solution:**
1. Make sure schema is pushed: `npx prisma db push`
2. Check you're connected to correct database
3. Refresh the page

## Next Steps After Database Setup

1. ✅ Database created and connected
2. ✅ Schema pushed to database
3. ✅ Local environment configured

**Continue with:**
- [ ] Set up Upstash Redis
- [ ] Configure Resend email
- [ ] Add other environment variables
- [ ] Deploy to production

See `QUICK_SETUP_CHECKLIST.md` for complete deployment guide.

## Support

- **Vercel Postgres Docs:** https://vercel.com/docs/storage/vercel-postgres
- **Prisma with Vercel:** https://vercel.com/guides/prisma
- **Neon (underlying tech):** https://neon.tech/docs

---

**Recommendation:** Use Vercel Postgres for the easiest setup! It's Neon underneath with better integration. 🚀
