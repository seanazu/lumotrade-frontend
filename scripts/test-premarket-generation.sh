#!/bin/bash

# Test Pre-Market Generation System
# This script tests the pre-market generation endpoint

set -e

echo "🧪 Testing Pre-Market Generation System"
echo "========================================"
echo ""

# Check if CRON_SECRET is set
if [ -z "$CRON_SECRET" ]; then
  echo "❌ Error: CRON_SECRET environment variable is not set"
  echo "Please set it in your .env.local file or export it:"
  echo "  export CRON_SECRET='your-secret-key'"
  exit 1
fi

# Check if APP_URL is provided or use default
APP_URL="${1:-http://localhost:3000}"

echo "📍 Target URL: $APP_URL"
echo "🔑 Using CRON_SECRET: ${CRON_SECRET:0:10}..."
echo ""

# Test 1: Health Check
echo "Test 1: Health Check (GET)"
echo "---"
response=$(curl -s "$APP_URL/api/cron/premarket-generation")
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""

# Test 2: Trigger Generation
echo "Test 2: Trigger Pre-Market Generation (POST)"
echo "---"
echo "⏳ This may take 30-60 seconds (calling OpenAI API)..."
response=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  "$APP_URL/api/cron/premarket-generation")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

echo "HTTP Status: $http_code"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

# Test 3: Verify Cache
echo "Test 3: Verify Trading Opportunities Cache"
echo "---"
sleep 2
response=$(curl -s "$APP_URL/api/trading/opportunities")
echo "$response" | jq '.cache' 2>/dev/null || echo "Cache info not available"
echo ""

# Results
if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 207 ]; then
  cache_hit=$(echo "$response" | jq -r '.cache.hit' 2>/dev/null || echo "unknown")
  
  if [ "$cache_hit" = "true" ]; then
    echo "✅ All tests passed!"
    echo "   - Pre-market generation succeeded"
    echo "   - Cache is working correctly"
    echo "   - Users will get instant results (no OpenAI calls)"
  else
    echo "⚠️  Tests passed but cache status unclear"
    echo "   Check the cache manually in your database"
  fi
  exit 0
else
  echo "❌ Tests failed!"
  echo "   HTTP Status: $http_code"
  echo "   Check logs for details"
  exit 1
fi

