# Pre-Market Content Generation

## Overview
This document explains how LumoTrade pre-generates expensive AI content (like Lumo's Picks) during pre-market hours to avoid repeated OpenAI API calls when users load the page.

## Architecture

### 1. Daily Caching System
- All AI-generated content is stored in the `api_cache_entries` PostgreSQL table
- Cache entries are scoped by trading date (e.g., `daily:2024-12-30`)
- Old entries are automatically purged when new ones are created

### 2. Pre-Market Generation Endpoint
**Endpoint:** `POST /api/cron/premarket-generation`

**Security:** Requires `Authorization: Bearer <CRON_SECRET>` header

**What it generates:**
- **Lumo's Picks (Trading Opportunities):** Uses OpenAI to analyze market conditions and select best trades

### 3. Cron Schedule
The pre-market generation should run at **8:00 AM ET** (before market open at 9:30 AM ET) every weekday.

## Setup Instructions

### 1. Set Environment Variables

Add to your `.env` or `.env.local`:

```bash
# Generate a secret key
CRON_SECRET=$(openssl rand -base64 32)

# Or set manually
CRON_SECRET=your-secret-key-here
```

### 2. Option A: Using Vercel Cron Jobs (Recommended for Production)

Create `vercel.json` in your project root:

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

Vercel automatically handles authentication via the `CRON_SECRET` environment variable.

### 3. Option B: Using External Cron Service

Use services like:
- **EasyCron** (https://www.easycron.com/)
- **cron-job.org** (https://cron-job.org/)
- **GitHub Actions**

Configure to call:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/premarket-generation
```

**Schedule:** `0 8 * * 1-5` (8:00 AM ET, Monday-Friday)

### 4. Option C: Using Shell Script (Self-Hosted)

Make the script executable:
```bash
chmod +x scripts/trigger-premarket-generation.sh
```

Add to crontab:
```bash
crontab -e

# Add this line (adjust time zone as needed):
0 8 * * 1-5 cd /path/to/lumotrade-frontend && ./scripts/trigger-premarket-generation.sh >> /var/log/premarket-generation.log 2>&1
```

## How It Works

### Morning (8:00 AM ET)
1. Cron job triggers `/api/cron/premarket-generation`
2. Script checks if content already exists for today's date
3. If not, generates:
   - Market analysis
   - Stock screening (analyzes 100+ stocks)
   - AI opportunity selection (OpenAI call)
   - Catalyst enhancement
4. Stores result in PostgreSQL `api_cache_entries` table
5. Purges previous day's cache

### During Market Hours (9:30 AM - 4:00 PM ET)
1. User visits homepage
2. `useTradingOpportunities` hook fetches from `/api/trading/opportunities`
3. API checks cache: **HIT** ✅ (no OpenAI call needed!)
4. Returns pre-generated content instantly
5. Cache remains valid for entire trading day

## Monitoring

### Check if content was generated:
```bash
curl https://your-app.vercel.app/api/trading/opportunities
```

Look for `"cache": { "hit": true, "scope": "daily:2024-12-30" }`

### Manual trigger (for testing):
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/premarket-generation
```

### Health check:
```bash
curl https://your-app.vercel.app/api/cron/premarket-generation
```

## Cost Savings

### Before (On-Demand Generation)
- Every user page load → OpenAI API call
- 100 users/day × $0.02/call = **$2.00/day**
- **~$60/month**

### After (Pre-Market Generation)
- 1 generation/day × $0.02 = **$0.02/day**
- **~$0.60/month**

### Savings: **~$59.40/month (99% reduction)**

## Troubleshooting

### Generation not running?
1. Check `CRON_SECRET` is set correctly
2. Verify cron schedule is in ET timezone
3. Check Vercel logs: `vercel logs --prod`
4. Test manually with curl

### Cache not being used?
1. Check PostgreSQL connection
2. Verify `api_cache_entries` table exists
3. Check cache scope matches current ET date
4. Look for `cache.hit: true` in API response

### API still calling OpenAI?
1. Ensure `getOrComputeDailyCache` is being used
2. Check date format is `YYYY-MM-DD` in ET timezone
3. Verify no `?refresh=1` query parameter
4. Check if cache expired or was purged

## Future Enhancements

Consider pre-generating:
- AI Brief summaries (currently generated on-demand)
- AI Stock Thesis for popular tickers
- Market sentiment analysis
- Sector rotation insights

## Related Files

- `/app/api/cron/premarket-generation/route.ts` - Cron endpoint
- `/app/api/trading/opportunities/route.ts` - Trading opportunities API
- `/lib/server/api-cache.ts` - Caching utilities
- `/lib/server/time.ts` - ET timezone utilities
- `scripts/trigger-premarket-generation.sh` - Shell trigger script

