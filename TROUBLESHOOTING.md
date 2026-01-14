# Troubleshooting Guide

## Issue: Analysis Gets Stuck on "Identifying competitors..."

### What's Happening

Based on the screenshot, the loading screen is showing but the analysis is not completing. This can happen for several reasons:

### Diagnostic Steps

1. **Check Browser Console**
   - Open Chrome/Firefox DevTools (F12 or Right-click > Inspect)
   - Go to the Console tab
   - Look for any errors in red
   - Take note of what you see

2. **Check Network Tab**
   - In DevTools, go to Network tab
   - Look for the `/api/analyze` request
   - Check its status:
     - **Pending** = Still running (may take up to 60 seconds)
     - **200 OK** = Succeeded (frontend may have issue)
     - **500 Error** = Backend failed (click to see error message)
     - **Failed** = Network timeout

3. **Check Server Logs**
   - Look at your terminal where `npm run dev` is running
   - You should see:
     ```
     🚀 Starting AEO Analysis for: [BrandName]
     📊 Step 1: Gathering search data via ZenRows...
     ✓ Collected X search results
     🤖 Step 2: Analyzing with Gemini AI...
     ✓ AEO report generated successfully
     ```
   - If you see errors, that's the issue

### Common Issues and Solutions

#### 1. Request Timeout (Most Common)

**Symptoms:**
- Loading screen shows for 2+ minutes
- No error message appears
- Network tab shows request as "pending" or "failed"

**Solution:**
- The analysis can take 30-90 seconds
- Wait patiently - the loading screen should show progress
- If it exceeds 2 minutes, refresh and try again

**Why it happens:**
- ZenRows makes 3 sequential Google searches (10-30s each)
- Each search has retry logic with exponential backoff
- Network conditions can slow things down

#### 2. ZenRows API Error

**Symptoms:**
- Error appears quickly (< 5 seconds)
- Message mentions "Search failed" or "rate limits"

**Solution:**
```bash
# Test ZenRows API
node test-api-quick.js
```

If it fails:
- Check your ZenRows API key in `.env.local`
- Verify you have credits remaining in ZenRows dashboard
- Wait 5 minutes if rate limited

#### 3. Gemini API Error

**Symptoms:**
- Loading completes search phase
- Error appears after ~30 seconds
- Message mentions "Analysis failed" or "API key"

**Solution:**
```bash
# Test Gemini API
node test-api-quick.js
```

If it fails:
- Check your Gemini API key in `.env.local`
- Verify the key is active in Google AI Studio
- Check API quotas

#### 4. Frontend Timeout

**Symptoms:**
- Server logs show success
- Frontend still shows loading screen
- No error appears

**Solution:**
- Clear browser cache and refresh
- Check browser console for JavaScript errors
- Try a different browser

### Testing Your Setup

Run the quick API test:

```bash
cd /Users/namanpandey/aeo-tool
node test-api-quick.js
```

You should see:
```
✅ All APIs are working! Your app should work fine.
```

### Manual Test

Test the API directly using curl:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"example.com","brandName":"Example"}'
```

This will show you exactly what's happening without the frontend.

### Expected Timing

| Phase | Duration | What's Happening |
|-------|----------|------------------|
| Input validation | < 1s | Checking brand name |
| Search Phase | 30-60s | 3 Google searches with retries |
| Analysis Phase | 10-20s | Gemini AI processing |
| Response | < 1s | Sending results |
| **Total** | **40-80s** | Complete analysis |

### Still Stuck?

1. **Check the actual error:**
   - Look in browser console (F12)
   - Look in terminal where `npm run dev` is running
   - Look in Network tab for the `/api/analyze` request response

2. **Try a simple test:**
   ```bash
   # Kill the dev server
   pkill -f "next-server" || true
   
   # Restart it
   npm run dev
   
   # In another terminal, test directly
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -d '{"url":"test.com","brandName":"Test"}' \
     --max-time 120
   ```

3. **Check logs in real-time:**
   - Keep terminal visible while testing
   - Watch for errors as they appear
   - Note which step fails

### Quick Fixes

**Restart everything:**
```bash
# Stop dev server
pkill -f "next-server" || true

# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Start fresh
npm run dev
```

**Environment variable check:**
```bash
# Make sure these are set
grep GEMINI_API_KEY .env.local
grep ZENROWS_API_KEY .env.local
```

### Getting Help

If you're still stuck, provide:

1. **Browser console errors** (screenshot or copy-paste)
2. **Server logs** from terminal (copy-paste the last 50 lines)
3. **Network tab** screenshot showing the `/api/analyze` request
4. **Output of** `node test-api-quick.js`

This information will help diagnose the exact issue.
