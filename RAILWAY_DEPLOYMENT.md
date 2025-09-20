# Fly-Fleet Railway Deployment Guide

This guide provides step-by-step instructions for deploying the Fly-Fleet Next.js application to Railway.

## Prerequisites

1. **Railway CLI**: Install the Railway CLI globally
   ```bash
   npm install -g @railway/cli
   ```

2. **Railway Account**: Sign up at [railway.app](https://railway.app)

3. **Environment Variables**: Prepare all required environment variables (see `.env.example`)

## Quick Deployment

### Option 1: Automated Script (Recommended)

Run the automated deployment script:

```bash
./scripts/railway-deploy.sh your-project-name
```

### Option 2: Manual Setup

1. **Login to Railway**
   ```bash
   railway login
   ```

2. **Create New Project**
   ```bash
   railway new
   # Follow the prompts to create your project
   ```

3. **Add PostgreSQL Database**
   ```bash
   railway add --database postgresql
   ```

4. **Deploy Application**
   ```bash
   railway up
   ```

## Environment Variables Configuration

After deployment, configure these environment variables in the Railway dashboard:

### Required Variables

```bash
# Database (automatically provided by Railway)
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
NEXTAUTH_SECRET=your-super-secret-jwt-secret-at-least-32-characters
NEXTAUTH_URL=https://your-app.railway.app

# Email Service (Resend)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
RECAPTCHA_SECRET_KEY=6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Application URLs
NEXT_PUBLIC_BASE_URL=https://your-app.railway.app

# WhatsApp Business
WHATSAPP_BUSINESS_NUMBER=+1234567890

# Performance Optimization
NEXT_TELEMETRY_DISABLED=1
```

### Setting Environment Variables

1. **Via Railway Dashboard**:
   - Go to your project dashboard
   - Click on "Variables" tab
   - Add each environment variable

2. **Via Railway CLI**:
   ```bash
   railway variables set NEXTAUTH_SECRET=your-secret-here
   railway variables set NEXTAUTH_URL=https://your-app.railway.app
   # ... continue for all variables
   ```

## Database Setup

### Automatic Migration

The deployment is configured to run migrations automatically on startup. The Dockerfile includes:

```bash
npx prisma migrate deploy && node server.js
```

### Manual Migration (if needed)

If you need to run migrations manually:

```bash
railway run npx prisma migrate deploy
```

### Database Seeding

To seed the database with initial data:

```bash
railway run npx prisma db seed
```

## Custom Domain Configuration

1. **Add Custom Domain** in Railway dashboard:
   - Go to "Settings" → "Domains"
   - Add your custom domain
   - Configure DNS as instructed

2. **Update Environment Variables**:
   ```bash
   NEXTAUTH_URL=https://your-custom-domain.com
   NEXT_PUBLIC_BASE_URL=https://your-custom-domain.com
   ```

## Monitoring and Debugging

### View Logs
```bash
railway logs
```

### Monitor Build Process
```bash
railway logs --deployment
```

### Check Service Status
```bash
railway status
```

### Health Check Endpoint

The application includes a health check endpoint at `/api/health` that verifies:
- Application status
- Database connectivity
- System health

Access it at: `https://your-app.railway.app/api/health`

## Performance Optimizations

The deployment is optimized for Railway with:

1. **Docker Multi-stage Build**: Minimizes image size
2. **Next.js Standalone Output**: Reduces deployment size by 80%
3. **Package Import Optimization**: Faster builds with selective imports
4. **Turbopack**: Ultra-fast bundling
5. **Health Checks**: Proper service monitoring

## Cost Optimization

### Resource Management

- **Memory**: Start with 512MB, scale as needed
- **CPU**: 0.5 vCPU is typically sufficient for most traffic
- **Database**: Use Railway's PostgreSQL for seamless integration

### Build Optimization

- Docker build cache is optimized for faster rebuilds
- Only necessary files are included in the final image
- Dependencies are cached separately from application code

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Verify Node.js version compatibility (using Node 22 Alpine)
   - Review build logs: `railway logs --deployment`

2. **Database Connection Issues**
   - Verify `DATABASE_URL` is set correctly
   - Check database service is running: `railway status`
   - Ensure migrations completed: `railway run npx prisma migrate status`

3. **Environment Variable Issues**
   - Check all required variables are set: `railway variables`
   - Verify Railway domain in `NEXTAUTH_URL` and `NEXT_PUBLIC_BASE_URL`

4. **Memory Issues**
   - Increase memory allocation in Railway dashboard
   - Monitor usage in Railway metrics

### Getting Help

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Check application logs: `railway logs`

## Next Steps After Deployment

1. **Configure Domain**: Set up your custom domain
2. **SSL Certificate**: Railway provides automatic HTTPS
3. **Monitoring**: Set up error tracking and monitoring
4. **Backup Strategy**: Configure database backups
5. **CI/CD**: Set up automatic deployments from GitHub

## Railway CLI Commands Reference

```bash
# Project Management
railway new                 # Create new project
railway link                # Link local directory to Railway project
railway status              # Check project status

# Deployment
railway up                  # Deploy current directory
railway logs                # View application logs
railway logs --deployment  # View build logs

# Environment Variables
railway variables           # List all variables
railway variables set KEY=value  # Set variable
railway variables delete KEY     # Delete variable

# Database
railway run npx prisma migrate deploy  # Run migrations
railway run npx prisma db seed        # Seed database
railway run npx prisma studio         # Open Prisma Studio

# Services
railway add --database postgresql     # Add PostgreSQL
railway services                      # List services
```

This deployment setup provides a production-ready Railway deployment with optimal performance, security, and maintainability for your Fly-Fleet application.