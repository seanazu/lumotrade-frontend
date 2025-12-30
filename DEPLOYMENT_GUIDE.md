# 🚀 LumoTrade Frontend Deployment Guide

## Pre-Deployment Checklist

### 1. Verify All Environment Variables
Make sure you have all required API keys in your `.env.local`:

```bash
# Check your current env vars
cd /Users/seanazulay/Desktop/StockBots/LumoTrade/lumotrade-frontend
cat .env.local
```

**Required Variables:**
```bash
# InstantDB
NEXT_PUBLIC_INSTANT_APP_ID=your_app_id
INSTANT_ADMIN_TOKEN=your_admin_token

# Market Data APIs
POLYGON_API_KEY=your_polygon_key
MARKETAUX_API_KEY=your_marketaux_key
FMP_API_KEY=your_fmp_key
FINNHUB_API_KEY=your_finnhub_key
ORATS_API_KEY=your_orats_key (optional but recommended)

# AI APIs
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Cron Security
CRON_SECRET=your_random_secret_string
```

### 2. Test Build Locally
```bash
cd /Users/seanazulay/Desktop/StockBots/LumoTrade/lumotrade-frontend

# Install dependencies (if needed)
nvm use 22
npm install

# Run build to check for errors
npm run build

# Test the production build locally
npm run start
```

### 3. Commit All Changes
```bash
# Check status
git status

# Add all files
git add .

# Commit with descriptive message
git commit -m "feat: Enhanced stock opportunity finder with multi-bagger analysis

- Integrated 6 data sources (FMP, Polygon, Finnhub, Marketaux, ORATS, OpenAI)
- Added options flow intelligence for institutional signals
- Enhanced AI prompting for structural catalyst identification
- Improved scoring system with 5-dimensional analysis
- Fixed all bugs and TypeScript errors
- Optimized rate limiting and caching"

# Push to main branch
git push origin main
```

---

## Deployment Options

### Option A: Vercel (Recommended) ⚡

#### Step 1: Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Link Project (First Time Only)
```bash
cd /Users/seanazulay/Desktop/StockBots/LumoTrade/lumotrade-frontend
vercel link
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (if first time) or **Y** (if already exists)
- Project name? `lumotrade-frontend` (or your preferred name)

#### Step 4: Add Environment Variables to Vercel

**Option 4A: Via CLI**
```bash
# Add each environment variable
vercel env add NEXT_PUBLIC_INSTANT_APP_ID
vercel env add INSTANT_ADMIN_TOKEN
vercel env add POLYGON_API_KEY
vercel env add MARKETAUX_API_KEY
vercel env add FMP_API_KEY
vercel env add FINNHUB_API_KEY
vercel env add ORATS_API_KEY
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add CRON_SECRET

# For each, select:
# - Environment: Production, Preview, Development (select all 3)
# - Enter value: paste the actual key
```

**Option 4B: Via Vercel Dashboard** (Easier)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from your `.env.local`

#### Step 5: Deploy to Production
```bash
# Deploy to production
vercel --prod

# Or just run vercel for preview deployment first
vercel
```

#### Step 6: Verify Deployment
```bash
# Get the deployment URL from the output
# Example: https://lumotrade-frontend.vercel.app

# Test the opportunities endpoint
curl https://your-deployment-url.vercel.app/api/trading/opportunities | jq
```

---

### Option B: Manual Vercel Dashboard Deployment

#### Step 1: Push to GitHub
```bash
git push origin main
```

#### Step 2: Import Project in Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repo
4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./lumotrade-frontend`
   - Node Version: **22.x**

#### Step 3: Add Environment Variables
In the "Environment Variables" section, add all your variables from `.env.local`

#### Step 4: Deploy
Click "Deploy" and wait for build to complete

---

## Post-Deployment Setup

### 1. Configure Cron Job for Pre-Market Generation

Vercel will automatically pick up the `vercel.json` configuration:

```json
{
  "crons": [
    {
      "path": "/api/cron/premarket-generation",
      "schedule": "0 8 * * 1-5"
    }
  ]
}
```

**Verify Cron Setup:**
1. Go to Vercel Dashboard → Your Project → Settings → Cron Jobs
2. You should see: `/api/cron/premarket-generation` scheduled for 8:00 AM ET weekdays

### 2. Test the Cron Endpoint Manually
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-deployment-url.vercel.app/api/cron/premarket-generation
```

### 3. Verify All API Routes Work
```bash
# Test opportunities endpoint
curl https://your-deployment-url.vercel.app/api/trading/opportunities | jq

# Test market data
curl https://your-deployment-url.vercel.app/api/market/overview | jq

# Test stock analysis
curl https://your-deployment-url.vercel.app/api/stock/quote/AAPL | jq
```

---

## Common Issues & Solutions

### Issue 1: Build Fails
```bash
# Check the build logs in Vercel dashboard
# Common fixes:

# 1. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Update Next.js if needed
npm update next

# 3. Check for TypeScript errors locally
npm run build
```

### Issue 2: Environment Variables Not Working
```bash
# Ensure variables are set for Production environment
# Redeploy after adding variables:
vercel --prod
```

### Issue 3: API Routes Timeout
```bash
# Vercel has 10s timeout for Hobby plan, 60s for Pro
# If you need longer, upgrade to Pro or optimize the endpoints
```

### Issue 4: Rate Limits in Production
```bash
# Ensure your rate limit configs match your API plan tiers
# Check: src/lib/api/utils/rate-limiter.ts
```

---

## Monitoring & Maintenance

### 1. Check Logs
```bash
# Via CLI
vercel logs [deployment-url]

# Or via Dashboard
# Go to Vercel Dashboard → Project → Deployments → Select deployment → Logs
```

### 2. Monitor API Usage
- Polygon: https://polygon.io/dashboard
- FMP: https://financialmodelingprep.com/developer/docs
- Finnhub: https://finnhub.io/dashboard
- ORATS: https://www.orats.com/
- OpenAI: https://platform.openai.com/usage

### 3. Set Up Alerts
1. Vercel Dashboard → Project → Settings → Notifications
2. Enable alerts for:
   - Deployment failures
   - Error rate spikes
   - Performance issues

---

## Quick Deployment Commands

```bash
# Complete deployment flow
cd /Users/seanazulay/Desktop/StockBots/LumoTrade/lumotrade-frontend

# 1. Test build
npm run build

# 2. Commit changes
git add .
git commit -m "Deploy: Enhanced opportunity finder"
git push origin main

# 3. Deploy to Vercel
vercel --prod

# 4. Test production
curl https://your-url.vercel.app/api/trading/opportunities | jq
```

---

## Performance Optimization Tips

### 1. Enable Edge Runtime for API Routes (Optional)
In your API route files, add:
```typescript
export const runtime = 'edge';
```

### 2. Configure Caching Headers
Already implemented in your routes! ✅

### 3. Enable Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to _app.tsx
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

---

## 🎯 Final Checklist

Before deploying:
- ✅ All environment variables configured
- ✅ Build passes locally (`npm run build`)
- ✅ No TypeScript errors
- ✅ All tests pass
- ✅ Git committed and pushed
- ✅ Vercel project linked
- ✅ Cron job configured in `vercel.json`

After deploying:
- ✅ Test all API endpoints
- ✅ Verify opportunities endpoint works
- ✅ Check cron job is scheduled
- ✅ Monitor logs for errors
- ✅ Test pre-market generation manually

---

## 🚀 You're Ready to Deploy!

Run these commands now:
```bash
cd /Users/seanazulay/Desktop/StockBots/LumoTrade/lumotrade-frontend
npm run build && vercel --prod
```

Need help? Let me know which deployment option you prefer and I can guide you through it step by step!

