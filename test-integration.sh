#!/bin/bash

# Test Integration Script for AEO Tool
# This script verifies the frontend-to-backend integration

echo "🧪 AEO Tool - Integration Test"
echo "================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
echo "1️⃣  Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓${NC} .env.local found"
    
    # Check for required API keys
    if grep -q "GEMINI_API_KEY=" .env.local && \
       grep -q "ZENROWS_API_KEY=" .env.local; then
        echo -e "${GREEN}✓${NC} Required API keys configured"
    else
        echo -e "${RED}✗${NC} Missing required API keys in .env.local"
        echo "   Required: GEMINI_API_KEY, ZENROWS_API_KEY"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} .env.local not found"
    exit 1
fi

echo ""

# Check if dependencies are installed
echo "2️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules found"
    
    # Check for critical packages
    if [ -d "node_modules/zod" ] && \
       [ -d "node_modules/@google/generative-ai" ]; then
        echo -e "${GREEN}✓${NC} Critical packages installed (zod, @google/generative-ai)"
    else
        echo -e "${YELLOW}!${NC} Some packages may be missing. Run: npm install"
    fi
else
    echo -e "${RED}✗${NC} node_modules not found"
    echo "   Run: npm install"
    exit 1
fi

echo ""

# Check if key files exist
echo "3️⃣  Checking service files..."
FILES=(
    "lib/zenrows.ts"
    "lib/gemini.ts"
    "lib/aeo-analysis.ts"
    "app/api/analyze/route.ts"
    "types/aeo-report.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file missing"
        exit 1
    fi
done

echo ""

# Check TypeScript configuration
echo "4️⃣  Checking TypeScript configuration..."
if grep -q '"target": "ES2020"' tsconfig.json; then
    echo -e "${GREEN}✓${NC} TypeScript target set to ES2020"
else
    echo -e "${YELLOW}!${NC} TypeScript target may need updating to ES2020"
fi

echo ""

# Check if server is running
echo "5️⃣  Checking if development server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓${NC} Server is running on http://localhost:3000"
    
    echo ""
    echo "6️⃣  Testing API endpoint..."
    
    # Test API endpoint
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/analyze \
      -H "Content-Type: application/json" \
      -d '{"url": "example.com", "brandName": "Example"}' \
      -w "\n%{http_code}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✓${NC} API endpoint responding (HTTP $HTTP_CODE)"
        echo "   Response preview: $(echo $BODY | cut -c1-100)..."
    else
        echo -e "${YELLOW}!${NC} API returned HTTP $HTTP_CODE"
        echo "   This may be expected if API keys are not valid"
        echo "   Response: $BODY"
    fi
else
    echo -e "${YELLOW}!${NC} Server not running"
    echo "   Start with: npm run dev"
    echo "   Then run this test again"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Integration check complete!${NC}"
echo ""
echo "To start the server:"
echo "  npm run dev"
echo ""
echo "To test manually:"
echo "  1. Visit http://localhost:3000"
echo "  2. Enter a domain (e.g., 'stayiq.ai')"
echo "  3. Click 'RUN FREE AUDIT'"
echo "  4. Watch the progress stepper"
echo ""
