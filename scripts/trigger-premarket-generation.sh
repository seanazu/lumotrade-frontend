#!/bin/bash

# Pre-Market Generation Trigger Script
# 
# This script triggers the pre-market content generation
# Run this via cron at 8:00 AM ET (before market open at 9:30 AM)
#
# Example crontab entry (runs at 8:00 AM ET every weekday):
# 0 8 * * 1-5 /path/to/trigger-premarket-generation.sh
#
# Make executable with: chmod +x trigger-premarket-generation.sh

set -e

# Configuration
APP_URL="${APP_URL:-https://your-app-url.com}"
CRON_SECRET="${CRON_SECRET}"

if [ -z "$CRON_SECRET" ]; then
  echo "❌ Error: CRON_SECRET environment variable is not set"
  exit 1
fi

echo "🚀 Starting pre-market generation at $(date)"
echo "📍 Target: $APP_URL/api/cron/premarket-generation"

# Trigger the pre-market generation endpoint
response=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  "$APP_URL/api/cron/premarket-generation")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

echo ""
echo "📊 Response (HTTP $http_code):"
echo "$body" | jq '.' 2>/dev/null || echo "$body"

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 207 ]; then
  echo ""
  echo "✅ Pre-market generation completed successfully"
  exit 0
else
  echo ""
  echo "❌ Pre-market generation failed with HTTP $http_code"
  exit 1
fi

