#!/bin/bash

# Fly-Fleet Railway Deployment Script
# This script helps automate Railway deployment setup

set -e

echo "🚀 Fly-Fleet Railway Deployment Setup"
echo "======================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "Please log in to Railway:"
    railway login
fi

# Create new Railway project
echo "📦 Creating Railway project..."
railway_project_name="${1:-fly-fleet}"
echo "Project name: $railway_project_name"

# Initialize Railway project
if [ ! -f "railway.toml" ]; then
    echo "❌ railway.toml not found. Make sure you're in the project root directory."
    exit 1
fi

# Create PostgreSQL database service
echo "🗄️  Setting up PostgreSQL database..."
railway add --database postgresql

# Deploy the application
echo "🚢 Deploying application..."
railway up

echo "✅ Deployment initiated!"
echo ""
echo "Next steps:"
echo "1. Set up your environment variables in the Railway dashboard"
echo "2. Configure your custom domain (if needed)"
echo "3. Monitor deployment logs: railway logs"
echo ""
echo "Environment variables to configure:"
echo "- NEXTAUTH_SECRET"
echo "- NEXTAUTH_URL"
echo "- RESEND_API_KEY"
echo "- RESEND_WEBHOOK_SECRET"
echo "- NEXT_PUBLIC_RECAPTCHA_SITE_KEY"
echo "- RECAPTCHA_SECRET_KEY"
echo "- NEXT_PUBLIC_BASE_URL"
echo "- WHATSAPP_BUSINESS_NUMBER"