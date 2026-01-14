# Quick Start Guide - AEO Tool

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 20.x or later
- npm or yarn
- ZenRows API key
- Google Gemini API key

### Step 1: Verify Environment Variables

Check your `.env.local` file:

```bash
cat .env.local
```

Should contain:
```bash
GEMINI_API_KEY=your_gemini_key_here
ZENROWS_API_KEY=your_zenrows_key_here
BREVO_API_KEY=your_brevo_key_here
```

✅ If missing, create `.env.local` and add your keys.

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- `@google/generative-ai` - Gemini API client
- `zod` - Schema validation
- `next` - Framework
- And more...

### Step 3: Run Integration Test

```bash
./test-integration.sh
```

Expected output:
```
✓ .env.local found
✓ Required API keys configured
✓ node_modules found
✓ Critical packages installed
✓ All service files present
✓ TypeScript configuration correct
```

### Step 4: Start Development Server

```bash
npm run dev
```

Server will start at: `http://localhost:3000`

### Step 5: Test the Application

1. Open browser to `http://localhost:3000`
2. Enter a domain in the input box (e.g., `stayiq.ai`)
3. Click **"RUN FREE AUDIT"**
4. Watch the progress stepper:
   - "Scanning Google Search Results..."
   - "Analyzing Competitor Keywords..."
   - "Detecting Regulatory Flags..."
   - "Compiling AEO Score..."
   - "Cross-Referencing Citation Sources..."
   - "Generating Content Opportunities..."
5. View your AEO report!

## 🧪 Testing the API Directly

### Using curl:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "stayiq.ai",
    "brandName": "StayIQ"
  }'
```

### Expected Response:

```json
{
  "success": true,
  "brandName": "StayIQ",
  "url": "stayiq.ai",
  "report": {
    "visibility": {
      "score": 75,
      "rank": 3,
      "competitors": [
        {"name": "StayIQ", "score": 75, "is_user": true},
        {"name": "Competitor A", "score": 85, "is_user": false}
      ]
    },
    "sentiment": {
      "positive_percent": 65,
      "negative_percent": 35,
      "strengths": ["Great UI", "Fast service"],
      "weaknesses": ["Limited features", "Pricing concerns"],
      "regulatory_warnings": []
    },
    "citations": {
      "top_domains": [
        {"domain": "reddit.com", "percentage": 25},
        {"domain": "trustpilot.com", "percentage": 20}
      ],
      "frequent_pages": [...]
    },
    "content_strategy": {
      "opportunities": [
        {
          "type": "Problem Solution",
          "title": "How StayIQ Solves Pricing Concerns",
          "reasoning": "Address main weakness found in sentiment"
        },
        {
          "type": "Comparison",
          "title": "StayIQ vs Top Competitors",
          "reasoning": "Capitalize on competitive positioning"
        },
        {
          "type": "Listicle",
          "title": "Top 10 Features of StayIQ",
          "reasoning": "Highlight strengths and build authority"
        }
      ]
    }
  },
  "timestamp": "2026-01-13T12:34:56.789Z"
}
```

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY is not configured"

**Solution:**
```bash
# Verify .env.local exists and has the key
grep GEMINI_API_KEY .env.local

# If missing, add it:
echo "GEMINI_API_KEY=your_key_here" >> .env.local
```

### Issue: "ZENROWS_API_KEY is not configured"

**Solution:**
```bash
# Verify .env.local has the key
grep ZENROWS_API_KEY .env.local

# If missing, add it:
echo "ZENROWS_API_KEY=your_key_here" >> .env.local
```

### Issue: TypeScript errors about regex flags

**Solution:**
```bash
# Verify TypeScript target is ES2020
grep '"target"' tsconfig.json

# Should show: "target": "ES2020"
# If not, update manually or reinstall
```

### Issue: "Cannot find module '@/lib/zenrows'"

**Solution:**
```bash
# Verify all files exist
ls -la lib/zenrows.ts lib/gemini.ts lib/aeo-analysis.ts

# If missing, files were not created properly
# Check file paths and recreate if needed
```

### Issue: Request times out

**Solution:**
- ZenRows may be slow (Google rate limiting)
- Gemini may be processing large data
- Check API quotas and status
- Increase `maxDuration` in `app/api/analyze/route.ts`

### Issue: Loading spinner never completes

**Solution:**
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify API response in Network tab
4. Check server logs for errors

## 📚 Documentation

- **API Integration**: `API_INTEGRATION.md`
- **Architecture**: `ARCHITECTURE.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **This Guide**: `QUICK_START.md`

## 🎯 Next Steps

After successful testing:

1. **Customize Results Display**
   - Update `ResultDashboard.tsx` to show new report format
   - Add visualizations and charts
   - Improve UI/UX

2. **Add Features**
   - Export to PDF
   - Email reports
   - Save to database
   - Comparison view

3. **Optimize Performance**
   - Add caching (Redis)
   - Implement rate limiting
   - Batch processing
   - Real-time progress updates

4. **Deploy to Production**
   - Build: `npm run build`
   - Test: `npm start`
   - Deploy to Vercel
   - Set production environment variables

## 💡 Tips

- **Development**: Always run `npm run dev` for hot-reload
- **Testing**: Use the test script before commits
- **Debugging**: Check both browser console and server logs
- **API Keys**: Never commit `.env.local` to git
- **Performance**: First analysis may be slower (cold start)
- **Rate Limits**: Be mindful of API quotas

## 📞 Support

If you encounter issues:

1. Check documentation files
2. Review error messages in console
3. Verify API keys are valid
4. Check API service status
5. Review server logs

## ✅ Success Checklist

- [ ] `.env.local` configured
- [ ] Dependencies installed
- [ ] Test script passes
- [ ] Server starts successfully
- [ ] Can access http://localhost:3000
- [ ] Can enter domain and submit
- [ ] Loading stepper appears
- [ ] Analysis completes
- [ ] Results display
- [ ] No console errors

---

**Ready to go?** Run `npm run dev` and visit `http://localhost:3000`!
