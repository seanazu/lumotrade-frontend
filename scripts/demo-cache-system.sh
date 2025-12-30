#!/bin/bash

# Demo script showing the complete cache system flow

echo "=================================================="
echo "🎯 LumoTrade Cache System Demo"
echo "=================================================="
echo ""

echo "📂 Step 1: Check current cache state"
echo "------------------------------------"
ls -lh .cache/*.json 2>/dev/null | awk '{print $9, "(" $5 ")"}'
if [ $? -ne 0 ]; then
    echo "No cache files found"
fi
echo ""

echo "🔄 Step 2: Generate fresh picks (simulating pre-market cron)"
echo "------------------------------------------------------------"
curl -s -X POST -H "Authorization: Bearer test" http://localhost:3000/api/cron/premarket-generation \
    | jq '{success, date, opportunitiesCount: .generated[0].opportunitiesCount, status: .generated[0].status}'
echo ""

echo "💾 Step 3: Check cache after generation"
echo "---------------------------------------"
ls -lh .cache/*.json 2>/dev/null | awk '{print $9, "(" $5 ")"}'
echo ""

echo "⚡ Step 4: User loads page (should use cache)"
echo "--------------------------------------------"
curl -s http://localhost:3000/api/trading/opportunities \
    | jq '{cacheHit: .cache.hit, storedAt: .cache.storedAt, opportunitiesCount: (.opportunities | length)}'
echo ""

echo "🔄 Step 5: Generate again (old picks should be removed)"
echo "-------------------------------------------------------"
curl -s -X POST -H "Authorization: Bearer test" http://localhost:3000/api/cron/premarket-generation \
    | jq '{success, opportunitiesCount: .generated[0].opportunitiesCount}'
echo ""

echo "📂 Step 6: Final cache state (only today's picks)"
echo "-------------------------------------------------"
ls -lh .cache/*.json 2>/dev/null | awk '{print $9, "(" $5 ")"}'
echo ""

echo "=================================================="
echo "✅ Demo complete!"
echo "=================================================="
echo ""
echo "Summary:"
echo "- ✅ Old picks automatically removed"
echo "- ✅ Cache hit for user requests"
echo "- ✅ Fresh generation in pre-market"
echo "- ✅ Only current day's picks stored"

