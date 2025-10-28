# Fly-Fleet Development Guide

## 🚀 Cross-Platform Development Setup

This project is designed to work seamlessly on **macOS**, **Windows**, and **Linux**.

### 📋 Prerequisites

- **Node.js**: 20.x LTS or higher
- **npm**: 10.x or higher
- **Docker**: For containerized development (optional but recommended)

### 🛠️ Development Options

#### **Option 1: Local Development (Recommended for macOS/Linux)**

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Access at http://localhost:3000
```

#### **Option 2: Docker Development (Recommended for Windows)**

```bash
# Start with Docker (includes PostgreSQL)
npm run dev:docker:build

# Or just start existing containers
npm run dev:docker

# Access at http://localhost:3000
```

#### **Option 3: Railway Deployment (Production-like)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up

# Get your live URL!
```

### 🔧 Available Scripts

| Script | Description | Platform |
|--------|-------------|----------|
| `npm run dev` | Local development (standard) | All |
| `npm run dev:turbo` | Local development (with Turbopack) | macOS/Linux |
| `npm run dev:docker` | Docker development | All |
| `npm run dev:docker:build` | Docker development (rebuild) | All |
| `npm run build` | Production build (standard) | All |
| `npm run build:turbo` | Production build (with Turbopack) | macOS/Linux |

### 🐳 Docker Development

The Docker setup includes:
- **PostgreSQL Database**: Automatically configured
- **Hot Reload**: File changes trigger rebuilds
- **Environment Variables**: Pre-configured for development
- **Volume Mounting**: Source code is mounted for live editing

### 🌐 Database Setup

#### **Local Development**
```bash
# Create .env.local file
echo "DATABASE_URL=file:./dev.db" > .env.local

# For PostgreSQL (if you have it installed)
echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/flyfleet" > .env.local
```

#### **Docker Development**
```bash
# Database is automatically configured
# No additional setup required
```

#### **Railway Deployment**
```bash
# Database is automatically provided
# No additional setup required
```

### 🔍 Troubleshooting

#### **Windows Issues**
- **SWC Compiler Errors**: Use `npm run dev` (without Turbopack)
- **Native Module Issues**: Use Docker development (`npm run dev:docker`)
- **Permission Issues**: Run PowerShell as Administrator

#### **macOS/Linux Issues**
- **Permission Issues**: Use `sudo` if needed
- **Port Conflicts**: Change port with `PORT=3001 npm run dev`

#### **Docker Issues**
- **Docker Not Running**: Start Docker Desktop
- **Port Conflicts**: Stop other services on port 3000
- **Build Errors**: Use `npm run dev:docker:build` to rebuild

### 📱 Platform-Specific Notes

#### **Windows**
- Use Docker development for best compatibility
- Avoid Turbopack (use `npm run dev`)
- PowerShell recommended over Command Prompt

#### **macOS**
- Local development works perfectly
- Turbopack available (`npm run dev:turbo`)
- No special configuration needed

#### **Linux**
- Local development works perfectly
- Turbopack available (`npm run dev:turbo`)
- May need to install additional dependencies

### 🚀 Deployment

#### **Railway (Recommended)**
```bash
railway up
# Get live URL: https://your-app.up.railway.app
```

#### **Vercel**
```bash
vercel
# Get live URL: https://your-app.vercel.app
```

#### **Docker Production**
```bash
docker build -t fly-fleet .
docker run -p 3000:3000 fly-fleet
```

### 📚 Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **Prisma**: https://www.prisma.io/docs
- **Railway**: https://railway.app/docs

### 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test on your platform**
5. **Submit a pull request**

### 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: This file and README.md

