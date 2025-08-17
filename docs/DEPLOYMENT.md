# Deployment Guide

This document provides comprehensive deployment instructions for CropSchool across different environments and platforms.

## 🚀 Deployment Overview

CropSchool supports multiple deployment strategies:

- **Development**: Local development environment
- **Staging**: Testing and QA environment
- **Production**: Live environment for end users

## 📋 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[Local Environment]
        B[MongoDB Local]
        C[Next.js Dev Server]
    end

    subgraph "Staging"
        D[Vercel Preview]
        E[MongoDB Atlas Staging]
        F[Test Data]
    end

    subgraph "Production"
        G[Vercel Production]
        H[MongoDB Atlas Production]
        I[CDN Assets]
        J[Monitoring]
    end

    A --> D
    D --> G
    B --> E
    E --> H
    C --> F
    F --> I
    G --> J
```

## 🛠️ Prerequisites

### Required Tools

```bash
# Install required tools
npm install -g vercel
npm install -g @expo/cli
```

### Environment Variables

```bash
# .env.production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cropschool
JWT_SECRET=production-secret-key-very-long-and-secure
JWT_EXPIRES_IN=24h
NEXTAUTH_URL=https://cropschool.vercel.app
NEXTAUTH_SECRET=nextauth-production-secret
NODE_ENV=production
VERCEL_URL=cropschool.vercel.app
```

## 🌐 Web Application Deployment

### Vercel Deployment (Recommended)

#### 1. Setup Vercel Project

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Initialize project
cd packages/web
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name: cropschool-web
# - Directory: ./
# - Override settings? No
```

#### 2. Configure Environment Variables

```bash
# Set production environment variables
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add NEXTAUTH_SECRET production

# Set preview environment variables
vercel env add MONGODB_URI preview
vercel env add JWT_SECRET preview
vercel env add NEXTAUTH_SECRET preview
```

#### 3. Deploy to Production

```bash
# Deploy current branch to production
vercel --prod

# Deploy specific branch
vercel --prod --scope your-team
```

#### 4. Custom Domain Setup

```bash
# Add custom domain
vercel domains add cropschool.com

# Configure DNS records
# Add CNAME record: www.cropschool.com -> cname.vercel-dns.com
# Add A record: cropschool.com -> 76.76.19.61
```

### Manual Deployment

#### 1. Build Application

```bash
cd packages/web
npm run build
npm run export
```

#### 2. Deploy to Server

```bash
# Using rsync
rsync -avz out/ user@server:/var/www/cropschool/

# Using SCP
scp -r out/ user@server:/var/www/cropschool/

# Using FTP
ftp server.example.com
put -r out/ /public_html/
```

### Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# packages/web/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../../package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

#### 2. Build and Run Container

```bash
# Build Docker image
docker build -t cropschool-web .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  cropschool-web
```

#### 3. Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  web:
    build: ./packages/web
    ports:
      - '3000:3000'
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - mongodb

  mongodb:
    image: mongo:7
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}

volumes:
  mongodb_data:
```

## 📱 Mobile Application Deployment

### Expo Managed Workflow

#### 1. Setup Expo Account

```bash
# Install Expo CLI
npm install -g @expo/cli

# Login to Expo
expo login

# Initialize project (if not already done)
cd packages/mobile
expo init
```

#### 2. Configure App Settings

```json
// packages/mobile/app.json
{
  "expo": {
    "name": "CropSchool",
    "slug": "cropschool",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.cropschool.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.cropschool.app"
    }
  }
}
```

#### 3. Build for App Stores

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Build for both platforms
expo build:ios & expo build:android
```

#### 4. Submit to App Stores

```bash
# Submit to Apple App Store
expo upload:ios

# Submit to Google Play Store
expo upload:android
```

### React Native CLI (Bare Workflow)

#### 1. iOS Deployment

```bash
cd packages/mobile

# Install iOS dependencies
cd ios && pod install && cd ..

# Build for release
npx react-native run-ios --configuration Release

# Archive for App Store
xcodebuild -workspace ios/CropSchool.xcworkspace \
  -scheme CropSchool \
  -configuration Release \
  -archivePath build/CropSchool.xcarchive \
  archive
```

#### 2. Android Deployment

```bash
cd packages/mobile

# Generate signed APK
cd android
./gradlew assembleRelease

# Generate AAB for Play Store
./gradlew bundleRelease
```

## 🗄️ Database Deployment

### MongoDB Atlas Setup

#### 1. Create Cluster

```bash
# Using MongoDB Atlas CLI
atlas clusters create cropschool-production \
  --region US_EAST_1 \
  --tier M10 \
  --diskSizeGB 10 \
  --backup
```

#### 2. Configure Security

```bash
# Create database user
atlas dbusers create \
  --username cropschool \
  --password secure-password \
  --role readWrite \
  --database cropschool

# Configure IP whitelist
atlas accessLists create --ip 0.0.0.0/0  # For development only
atlas accessLists create --ip YOUR_SERVER_IP/32  # For production
```

#### 3. Connection String

```bash
# Production connection string
mongodb+srv://cropschool:password@cluster.mongodb.net/cropschool?retryWrites=true&w=majority
```

### Self-Hosted MongoDB

#### 1. Install MongoDB

```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# CentOS/RHEL
sudo yum install -y mongodb-org
```

#### 2. Configure MongoDB

```yaml
# /etc/mongod.conf
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1,YOUR_SERVER_IP

security:
  authorization: enabled

replication:
  replSetName: rs0
```

#### 3. Start MongoDB Service

```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Initialize replica set
mongo --eval "rs.initiate()"

# Create admin user
mongo admin --eval '
  db.createUser({
    user: "admin",
    pwd: "secure-password",
    roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
  })
'
```

## 🔧 CI/CD Pipeline

### GitHub Actions Workflow

#### 1. Create Workflow File

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Run type check
        run: npm run type-check

      - name: Run linting
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build web application
        run: npm run build --workspace=@cropschool/web

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: packages/web/.next

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: packages/web
```

#### 2. Configure Secrets

```bash
# GitHub repository secrets
VERCEL_TOKEN=your-vercel-token
ORG_ID=your-vercel-org-id
PROJECT_ID=your-vercel-project-id
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
```

### GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: '18'

test:
  stage: test
  image: node:$NODE_VERSION
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run test
    - npm run lint
    - npm run type-check

build:
  stage: build
  image: node:$NODE_VERSION
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run build --workspace=@cropschool/web
  artifacts:
    paths:
      - packages/web/.next
    expire_in: 1 hour

deploy:
  stage: deploy
  image: node:$NODE_VERSION
  script:
    - npm install -g vercel
    - vercel --token $VERCEL_TOKEN --prod
  only:
    - main
```

## 🔍 Monitoring and Health Checks

### Health Check Endpoint

```typescript
// packages/web/src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';

export async function GET() {
  try {
    // Check database connection
    await connectDB();

    // Check external services
    const servicesStatus = {
      database: 'connected',
      authentication: 'operational',
      gameEngine: 'loaded',
    };

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: servicesStatus,
      uptime: process.uptime(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

### Uptime Monitoring

```bash
# Using curl for basic health checks
curl -f https://cropschool.vercel.app/api/health || exit 1

# Using wget
wget --no-check-certificate -q --spider https://cropschool.vercel.app/api/health
```

### Log Monitoring

```typescript
// packages/web/src/lib/monitoring/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cropschool-web' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
```

## 🚨 Rollback Procedures

### Vercel Rollback

```bash
# List recent deployments
vercel list

# Rollback to previous deployment
vercel rollback [deployment-url]

# Promote specific deployment to production
vercel promote [deployment-url]
```

### Database Rollback

```bash
# MongoDB backup before deployment
mongodump --uri="mongodb+srv://..." --out backup-$(date +%Y%m%d)

# Restore from backup if needed
mongorestore --uri="mongodb+srv://..." backup-20250817
```

### Mobile App Rollback

```bash
# Expo: Publish previous version
expo publish --release-channel production-rollback

# React Native: Re-submit previous version to app stores
```

## 📊 Performance Optimization

### Web Application

```typescript
// Next.js optimization configuration
// packages/web/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['example.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Enable compression
  compress: true,

  // Optimize bundle
  experimental: {
    optimizeCss: true,
    legacyBrowsers: false,
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }],
      },
    ];
  },
};

module.exports = nextConfig;
```

### Database Optimization

```javascript
// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.progress.createIndex({ userId: 1, gameId: 1 });
db.achievements.createIndex({ userId: 1, achievementId: 1 });

// Enable compression
db.runCommand({ setParameter: 1, internalQueryExecYieldIterations: 128 });
```

## 🔐 Security Considerations

### Environment Variables

```bash
# Use secure secrets management
export MONGODB_URI=$(vault kv get -field=uri secret/cropschool/db)
export JWT_SECRET=$(vault kv get -field=secret secret/cropschool/jwt)
```

### SSL/TLS Configuration

```nginx
# nginx configuration
server {
    listen 443 ssl http2;
    server_name cropschool.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Rate Limiting

```typescript
// packages/web/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip || '127.0.0.1';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    const rateLimitInfo = rateLimit.get(ip);

    if (now > rateLimitInfo.resetTime) {
      rateLimitInfo.count = 1;
      rateLimitInfo.resetTime = now + windowMs;
    } else {
      rateLimitInfo.count++;

      if (rateLimitInfo.count > maxRequests) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
    }
  }

  return NextResponse.next();
}
```

## 📝 Deployment Checklist

### Pre-deployment

- [ ] All tests pass
- [ ] Code review completed
- [ ] Security scan passed
- [ ] Performance tests completed
- [ ] Documentation updated
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup strategy in place

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Check health endpoints
- [ ] Verify database connections
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Deploy to production
- [ ] Verify production deployment

### Post-deployment

- [ ] Monitor application metrics
- [ ] Check error logs
- [ ] Verify user authentication
- [ ] Test game functionality
- [ ] Monitor database performance
- [ ] Update status page
- [ ] Notify stakeholders

## 🆘 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues

```bash
# Check connection string
mongosh "mongodb+srv://username:password@cluster.mongodb.net/cropschool"

# Test with curl
curl -X GET https://your-app.vercel.app/api/health
```

#### Environment Variable Issues

```bash
# Check Vercel environment variables
vercel env ls

# Update environment variable
vercel env rm MONGODB_URI production
vercel env add MONGODB_URI production
```

#### Performance Issues

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check lighthouse scores
lighthouse https://your-app.vercel.app --output html
```

---

**Last Updated**: August 17, 2025  
**Deployment Version**: 1.0.0
