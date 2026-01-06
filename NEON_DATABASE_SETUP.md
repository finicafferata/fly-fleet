# Neon Database Setup Guide

Complete guide for setting up Neon PostgreSQL database for Fly-Fleet on Vercel.

## Why Neon?

- **Serverless-native**: Built for serverless with connection pooling
- **Auto-scaling**: Automatically scales to zero when not in use
- **Branching**: Database branches for preview deployments
- **Built-in pgBouncer**: Connection pooling without extra setup
- **Free tier**: Generous free tier for development

## Step 1: Create Neon Account

1. Go to https://neon.tech
2. Click **Sign Up**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

## Step 2: Create New Project

1. Click **Create a project**
2. Fill in project details:
   ```
   Project name: fly-fleet-production
   Region: US East (Ohio) - us-east-2
   PostgreSQL version: 16 (latest)
   ```
3. Click **Create project**
4. Wait 10-20 seconds for provisioning

## Step 3: Get Connection Strings

After project creation, you'll see the connection strings:

### Connection String Format

Neon provides different connection strings:

1. **Pooled Connection** (for application runtime):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
   ```
   - Uses pgBouncer for connection pooling
   - Use this for `DATABASE_URL`
   - Best for serverless functions

2. **Direct Connection** (for migrations):
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   - Direct connection to database
   - Use this for `DIRECT_DATABASE_URL`
   - Required for Prisma migrations

### Find Your Connection Strings

1. Go to your Neon dashboard
2. Click on your project name
3. Click **Connection Details** in the sidebar
4. You'll see:
   - Host: `ep-xxx-xxx.us-east-2.aws.neon.tech`
   - Database: `neondb`
   - User: `username`
   - Password: `***` (click to reveal)

### Copy Both Connection Strings

**Pooled (with pgbouncer=true):**
```bash
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
```

**Direct (without pgbouncer):**
```bash
DIRECT_DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## Step 4: Set Up Database Schema

### Option A: Fresh Start (New Database)

If starting fresh without existing data:

1. **Update local .env:**
   ```bash
   cd /Users/finicafferata/Desktop/fly-fleet

   # Create .env.local file
   echo 'DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"' > .env.local
   echo 'DIRECT_DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"' >> .env.local
   ```

2. **Push schema to Neon:**
   ```bash
   npx prisma db push
   ```

   This will create all tables, indexes, and constraints in Neon.

3. **Verify schema:**
   ```bash
   npx prisma studio
   ```

   Opens Prisma Studio to view your database.

### Option B: Migrate from Railway (Existing Data)

If you have existing data in Railway:

1. **Export from Railway:**
   ```bash
   # Get Railway database URL from Railway dashboard
   export RAILWAY_DATABASE_URL="postgresql://..."

   # Export data
   pg_dump $RAILWAY_DATABASE_URL > fly-fleet-backup.sql
   ```

2. **Import to Neon:**
   ```bash
   # Get Neon DIRECT connection URL (without pgbouncer)
   export NEON_DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

   # Import data
   psql $NEON_DATABASE_URL < fly-fleet-backup.sql
   ```

3. **Verify data:**
   ```bash
   # Connect to Neon
   psql $NEON_DATABASE_URL

   # Check tables
   \dt

   # Check record counts
   SELECT COUNT(*) FROM "QuoteRequest";
   SELECT COUNT(*) FROM "ContactForm";

   # Exit
   \q
   ```

4. **Update local .env:**
   ```bash
   # Update .env.local to point to Neon
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
   DIRECT_DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

## Step 5: Add to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your fly-fleet project

2. **Add Environment Variables:**
   - Click **Settings** → **Environment Variables**
   - Add these variables:

   ```
   Name: DATABASE_URL
   Value: postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
   Environments: Production, Preview, Development
   ```

   ```
   Name: DIRECT_DATABASE_URL
   Value: postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   Environments: Production, Preview, Development
   ```

3. **Save and redeploy**

## Step 6: Test Connection

1. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Check health endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

   Should return:
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

## Neon Dashboard Features

### Connection Pooling Settings

1. Go to **Settings** → **Connection Pooling**
2. Recommended settings:
   - Pool Mode: **Transaction** (default, best for serverless)
   - Max Client Connections: **100** (adjust based on traffic)
   - Default Pool Size: **20** (adjust based on needs)

### Database Branching (Optional)

Create database branches for preview deployments:

1. Click **Branches** in sidebar
2. Click **Create Branch**
3. Branch name: `preview` or match Vercel preview branch
4. Use branch connection string in Vercel preview environment

### Monitoring

1. **Metrics Tab:**
   - Connection count
   - Query performance
   - Storage usage

2. **Logs Tab:**
   - Query logs
   - Connection logs
   - Slow query detection

## Troubleshooting

### Error: "too many connections"

**Solution:** Make sure you're using the **pooled connection** with `pgbouncer=true`:
```
postgresql://...?pgbouncer=true&sslmode=require
```

### Error: "Prisma migration failed"

**Solution:** Use **DIRECT_DATABASE_URL** for migrations (without pgbouncer):
```bash
# Set environment variable temporarily
export DATABASE_URL=$DIRECT_DATABASE_URL
npx prisma db push
```

### Connection timeout

**Solution:**
1. Check Neon dashboard → Status (is database active?)
2. Neon auto-suspends after inactivity → First request wakes it up (5-10 seconds)
3. Consider upgrading to paid plan for always-on database

### SSL/TLS errors

**Solution:** Always include `sslmode=require` in connection string:
```
postgresql://...?sslmode=require
```

## Cost & Limits

### Free Tier (Hobby)
- 0.5 GB storage
- 3 projects
- 10 branches per project
- Auto-suspend after 5 minutes inactivity
- **Perfect for development and small apps**

### Pro Tier ($19/month)
- 10 GB storage
- Unlimited projects
- Unlimited branches
- Configurable auto-suspend
- Better performance
- **Recommended for production**

## Security Best Practices

1. **Never commit .env files:**
   ```bash
   # Already in .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Rotate passwords periodically:**
   - Neon Dashboard → Settings → Reset Password
   - Update in Vercel environment variables

3. **Use separate databases for environments:**
   - Production: `fly-fleet-production`
   - Staging: `fly-fleet-staging`
   - Development: Local PostgreSQL or separate Neon project

4. **Enable IP allowlist (Paid plans):**
   - Neon Dashboard → Settings → IP Allow
   - Add Vercel's IP ranges if needed

## Quick Reference

### Connection String Components

```
postgresql://[user]:[password]@[host]/[database]?[parameters]

user:       Database username (from Neon)
password:   Database password (from Neon)
host:       ep-xxx-xxx.us-east-2.aws.neon.tech
database:   neondb (default) or custom name
parameters: sslmode=require&pgbouncer=true (for pooled)
```

### Useful Commands

```bash
# Connect to Neon database
psql "postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Export schema only
pg_dump --schema-only $DATABASE_URL > schema.sql

# Export data only
pg_dump --data-only $DATABASE_URL > data.sql

# Check Prisma connection
npx prisma db execute --stdin <<< "SELECT 1"

# Generate Prisma client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

## Next Steps

After database setup:

1. ✅ Test local connection with new DATABASE_URL
2. ✅ Deploy to Vercel with updated environment variables
3. ✅ Monitor first requests (Neon auto-wake from suspend)
4. ✅ Set up database branching for preview environments
5. ✅ Configure alerts in Neon dashboard

## Support

- **Neon Docs:** https://neon.tech/docs
- **Neon Discord:** https://discord.gg/neon
- **Prisma + Neon Guide:** https://www.prisma.io/docs/guides/database/neon
