# 🚀 Vercel Deployment - Final Checklist

## ⚠️ CRITICAL: INSTANT_APP_ID Must Be Public!

**Change it back in Vercel to:**
```
NEXT_PUBLIC_INSTANT_APP_ID=your_instant_app_id
```

**Why?** InstantDB runs in the browser and needs `NEXT_PUBLIC_` prefix to be accessible on the client-side. Without it, authentication will break!

---

## 🔐 Your Generated CRON_SECRET

Add this to Vercel:
```
CRON_SECRET=a9946a793cfa8463d0dd66ab8d6387490576ce738240f5f4536aadfc5ed9ca73
```

**What it does:** Protects your `/api/cron/premarket-generation` endpoint from unauthorized access.

---

## 📋 Complete Vercel Environment Variables List

### ✅ PUBLIC (Browser-accessible - NEEDS NEXT_PUBLIC_)
```bash
NEXT_PUBLIC_INSTANT_APP_ID=your_instant_app_id
```

### 🔐 PRIVATE (Server-only - NO PREFIX)
```bash
# InstantDB Admin (server-side)
INSTANT_ADMIN_TOKEN=your_instant_admin_token

# Market Data APIs
POLYGON_API_KEY=your_polygon_key
MARKETAUX_API_KEY=your_marketaux_key
FMP_API_KEY=your_fmp_key
FINNHUB_API_KEY=your_finnhub_key
ORATS_API_KEY=your_orats_key

# AI API (only OpenAI, no Anthropic needed)
OPENAI_API_KEY=your_openai_key

# ML Backend
ML_BACKEND_URL=https://lumotrade-api-995037988776.us-central1.run.app
ML_API_KEY=your_ml_api_key

# Cron Security
CRON_SECRET=a9946a793cfa8463d0dd66ab8d6387490576ce738240f5f4536aadfc5ed9ca73
```

---

## ❌ Variables You DON'T Need

These are optional and can be skipped:
- ❌ `ANTHROPIC_API_KEY` - You're only using OpenAI
- ❌ Any `DATABASE_URL`, `PGHOST`, etc. - You're using InstantDB, not Postgres

---

## 🎯 Final Steps

1. **In Vercel Dashboard:**
   - ✅ Add `CRON_SECRET` with the value above
   - ✅ Change `INSTANT_APP_ID` → `NEXT_PUBLIC_INSTANT_APP_ID`
   - ✅ Verify all other variables match the list above

2. **Ready to deploy!** 🚀

Tell me when you're done and I'll trigger the deployment!

---

## 🔍 Quick Verification

Total variables you should have in Vercel: **12**

**Public (1):**
1. NEXT_PUBLIC_INSTANT_APP_ID

**Private (11):**
1. INSTANT_ADMIN_TOKEN
2. POLYGON_API_KEY
3. MARKETAUX_API_KEY
4. FMP_API_KEY
5. FINNHUB_API_KEY
6. ORATS_API_KEY
7. OPENAI_API_KEY
8. ML_BACKEND_URL
9. ML_API_KEY
10. CRON_SECRET

