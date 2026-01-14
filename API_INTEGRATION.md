# AEO Tool - API Integration Guide

## Overview
The frontend is now fully connected to the backend services (ZenRows + Gemini) through a unified API endpoint.

## Architecture

```
User Input (URL) 
    ↓
Hero Component
    ↓
page.tsx (handleAnalyze)
    ↓
POST /api/analyze
    ↓
┌─────────────────────────┐
│  SearchService (15-20s)  │ → ZenRows API → Google Search Results
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ AnalysisService (10-15s) │ → Gemini API → AEO Report JSON
└─────────────────────────┘
    ↓
Return Report to Frontend
    ↓
ResultDashboard displays results
```

## API Endpoint

### POST `/api/analyze`

**Request Body:**
```json
{
  "url": "stayiq.ai",
  "brandName": "StayIQ"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "brandName": "StayIQ",
  "url": "stayiq.ai",
  "report": {
    "visibility": {
      "score": 75,
      "rank": 3,
      "competitors": [...]
    },
    "sentiment": {
      "positive_percent": 65,
      "negative_percent": 35,
      "strengths": [...],
      "weaknesses": [...],
      "regulatory_warnings": [...]
    },
    "citations": {
      "top_domains": [...],
      "frequent_pages": [...]
    },
    "content_strategy": {
      "opportunities": [...]
    }
  },
  "timestamp": "2026-01-13T..."
}
```

**Error Response (500):**
```json
{
  "error": "Search failed",
  "details": "Unable to gather search data. Please check your ZenRows API key...",
  "step": "search"
}
```

Possible error steps: `"search"`, `"analysis"`, `"unknown"`

## Loading States

The `LoadingHud` component displays a progress stepper with 6 steps, updating every 3 seconds:

1. **Scanning Google Search Results...** (0-3s)
2. **Analyzing Competitor Keywords...** (3-6s)
3. **Detecting Regulatory Flags...** (6-9s)
4. **Compiling AEO Score...** (9-12s)
5. **Cross-Referencing Citation Sources...** (12-15s)
6. **Generating Content Opportunities...** (15-18s)

Total expected time: **15-30 seconds**

## Error Handling

### Frontend (page.tsx)
- Extracts brand name from URL automatically
- Displays error message if API fails
- Shows user-friendly error in ResultDashboard

### Backend (route.ts)
- **Step 1 Failure (ZenRows):** Returns error with "search" step indicator
- **Step 2 Failure (Gemini):** Returns error with "analysis" step indicator
- **Validation Errors:** Returns 400 status for missing brand name
- **Unexpected Errors:** Returns 500 with generic error message

## Environment Variables

Ensure these are set in `.env.local`:

```bash
GEMINI_API_KEY=your_gemini_key_here
ZENROWS_API_KEY=your_zenrows_key_here
BREVO_API_KEY=your_brevo_key_here
```

## Testing

### 1. Test the API directly:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "stayiq.ai", "brandName": "StayIQ"}'
```

### 2. Test through UI:
1. Run `npm run dev`
2. Visit `http://localhost:3000`
3. Enter a domain (e.g., "stayiq.ai")
4. Click "RUN FREE AUDIT"
5. Watch the loading stepper progress
6. View the generated report

### 3. Test error handling:
- Remove API keys from `.env.local` to test error messages
- Enter invalid domain to test validation
- Check console for detailed error logs

## Files Modified

### New Files:
- `/lib/zenrows.ts` - SearchService
- `/lib/gemini.ts` - AnalysisService  
- `/lib/aeo-analysis.ts` - Integration helper

### Updated Files:
- `/app/api/analyze/route.ts` - Complete rewrite to use new services
- `/app/page.tsx` - Updated to call new API endpoint
- `/components/LoadingHud.tsx` - Updated progress steps and timing
- `.env.local` - Renamed SCRAPER_API_KEY to ZENROWS_API_KEY

## Next Steps

1. **Update ResultDashboard** to display the new AEO report format
2. **Add caching** to avoid re-analyzing the same brand multiple times
3. **Implement rate limiting** to prevent API quota exhaustion
4. **Add progress streaming** for real-time updates instead of simulated progress
5. **Store reports** in a database for historical tracking

## Troubleshooting

### "Search failed" error
- Verify ZENROWS_API_KEY is correct
- Check ZenRows quota/usage
- Ensure ZenRows service is operational

### "Analysis failed" error  
- Verify GEMINI_API_KEY is correct
- Check Gemini API quota
- Review search data quality (may be empty/malformed)

### Long loading times (>30s)
- ZenRows may be slow due to Google rate limiting
- Gemini may take longer with complex data
- Check network connectivity

### Loading never completes
- Check browser console for errors
- Verify API endpoint returns response
- Check server logs for timeout issues
