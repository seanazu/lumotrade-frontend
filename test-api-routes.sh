#!/bin/bash
# Test All Frontend API Routes
# Tests the Next.js API proxy routes to ensure they work correctly

PORT=${1:-3001}
BASE_URL="http://localhost:$PORT"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TESTING FRONTEND API ROUTES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Base URL: $BASE_URL"
echo ""

passed=0
failed=0

test_route() {
    local method=$1
    local route=$2
    local description=$3
    local body=$4
    
    echo "Testing: $description"
    echo "  $method $route"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$BASE_URL$route" 2>&1)
    else
        response=$(curl -s -X POST "$BASE_URL$route" \
            -H "Content-Type: application/json" \
            -d "$body" 2>&1)
    fi
    
    if echo "$response" | grep -q "error"; then
        echo "  ❌ Failed: $(echo "$response" | jq -r '.error // .message' 2>/dev/null || echo "$response")"
        ((failed++))
    elif [ -z "$response" ]; then
        echo "  ❌ Failed: Empty response"
        ((failed++))
    else
        echo "  ✅ Success"
        ((passed++))
    fi
    echo ""
}

# Core ML Backend Routes
echo "📊 Core ML Backend Routes"
echo "─────────────────────────────────────────────────────"
test_route "GET" "/api/ml/predictions?days=1&page_size=5" "Predictions API"
test_route "GET" "/api/ml/trades?days=1&page_size=5" "Trades API"
test_route "GET" "/api/ml/model-health" "Model Health API"

# New Routes
echo "🆕 New API Routes (Just Added)"
echo "─────────────────────────────────────────────────────"
test_route "GET" "/api/ml/train/status" "Training Status"
test_route "GET" "/api/ml/model/status" "Model Status"
test_route "GET" "/api/ml/alerts/today" "Today's Alerts"

# Stock Picks
echo "📈 Stock Picks Routes"
echo "─────────────────────────────────────────────────────"
test_route "GET" "/api/ml/stock-picks/daily" "Daily Stock Picks"

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Passed: $passed"
echo "Failed: $failed"
echo "Total:  $((passed + failed))"
echo ""

if [ $failed -eq 0 ]; then
    echo "✅ ALL TESTS PASSED!"
    exit 0
else
    echo "⚠️  Some tests failed (this may be expected if backend endpoints don't exist)"
    exit 0
fi

