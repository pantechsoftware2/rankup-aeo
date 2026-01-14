# AEO Tool - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────┐         ┌──────────────┐                    │
│  │  Hero.tsx     │────────▶│  page.tsx    │                    │
│  │               │         │              │                    │
│  │  User enters  │         │ handleAnalyze│                    │
│  │  domain URL   │         │              │                    │
│  └───────────────┘         └──────┬───────┘                    │
│                                    │                             │
│                                    │ POST Request                │
│                                    │ {url, brandName}           │
│                                    ▼                             │
└────────────────────────────────────┼──────────────────────────┘
                                     │
                                     │
┌────────────────────────────────────┼──────────────────────────┐
│                             API LAYER                            │
├────────────────────────────────────┼──────────────────────────┤
│                                    │                             │
│                    ┌───────────────▼────────────────┐          │
│                    │  /api/analyze/route.ts          │          │
│                    │                                 │          │
│                    │  1. Validate input              │          │
│                    │  2. Call SearchService          │          │
│                    │  3. Call AnalysisService        │          │
│                    │  4. Return AEO Report           │          │
│                    └───────┬───────────┬─────────────┘          │
│                            │           │                         │
└────────────────────────────┼───────────┼─────────────────────┘
                             │           │
                             │           │
┌────────────────────────────┼───────────┼─────────────────────┐
│                      BACKEND SERVICES                            │
├────────────────────────────┼───────────┼─────────────────────┤
│                            ▼           ▼                         │
│     ┌──────────────────────────────────────────────┐           │
│     │         lib/zenrows.ts - SearchService        │           │
│     │                                               │           │
│     │  performBrandSearch(brandName, category?)    │           │
│     │                                               │           │
│     │  • Query A: "brand reviews and complaints"   │           │
│     │  • Query B: "brand competitors"              │           │
│     │  • Query C: "top [category] companies"       │           │
│     │                                               │           │
│     │  Returns: Consolidated search results        │           │
│     └────────────────┬──────────────────────────────┘           │
│                      │                                           │
│                      │ searchData (formatted text)              │
│                      ▼                                           │
│     ┌──────────────────────────────────────────────┐           │
│     │         lib/gemini.ts - AnalysisService       │           │
│     │                                               │           │
│     │  generateValidatedInsight(searchData, brand) │           │
│     │                                               │           │
│     │  • System Instruction (Rigorous Rules)       │           │
│     │  • Sentiment Analysis                        │           │
│     │  • Visibility Scoring                        │           │
│     │  • Citation Extraction                       │           │
│     │  • Strategy Generation                       │           │
│     │                                               │           │
│     │  Returns: AEOReportData (validated JSON)     │           │
│     └────────────────┬──────────────────────────────┘           │
│                      │                                           │
└──────────────────────┼───────────────────────────────────────┘
                       │
                       │
┌──────────────────────┼───────────────────────────────────────┐
│                 EXTERNAL APIS                                   │
├──────────────────────┼───────────────────────────────────────┤
│                      │                                          │
│  ┌──────────────┐   │   ┌─────────────────┐                  │
│  │  ZenRows API │◀──┘   │  Google Gemini  │◀─────────────────┤
│  │              │        │  1.5 Pro API    │                  │
│  │  Scrapes     │        │                 │                  │
│  │  Google      │        │  Generates      │                  │
│  │  Search      │        │  Insights       │                  │
│  └──────────────┘        └─────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Input Flow
```
User enters "stayiq.ai"
    ↓
Hero Component validates domain
    ↓
page.tsx extracts brand name → "StayIQ"
    ↓
POST /api/analyze {url: "stayiq.ai", brandName: "StayIQ"}
```

### 2. Search Phase (15-20 seconds)
```
API Route calls SearchService.performBrandSearch("StayIQ")
    ↓
ZenRows API makes 3 parallel Google searches:
    ├─ "StayIQ reviews and complaints"
    ├─ "StayIQ competitors"
    └─ "top [category] companies"
    ↓
Returns 30 search results (10 per query)
    ↓
Formatted as consolidated text for LLM
```

### 3. Analysis Phase (10-15 seconds)
```
API Route calls AnalysisService.generateValidatedInsight(searchData, "StayIQ")
    ↓
Gemini API processes with rigorous system instruction
    ↓
Generates structured JSON:
    ├─ Visibility (score, rank, competitors)
    ├─ Sentiment (positive/negative %, strengths, weaknesses, warnings)
    ├─ Citations (top domains, frequent pages)
    └─ Content Strategy (3 opportunities)
    ↓
Validates against Zod schema
    ↓
Returns AEOReportData
```

### 4. Response Flow
```
API Route returns complete report:
{
  success: true,
  brandName: "StayIQ",
  url: "stayiq.ai",
  report: { visibility, sentiment, citations, content_strategy },
  timestamp: "2026-01-13T..."
}
    ↓
page.tsx receives response
    ↓
ResultDashboard displays results
```

## Loading States

### Progress Stepper Timeline
```
0s    → "Scanning Google Search Results..."
3s    → "Analyzing Competitor Keywords..."
6s    → "Detecting Regulatory Flags..."
9s    → "Compiling AEO Score..."
12s   → "Cross-Referencing Citation Sources..."
15s   → "Generating Content Opportunities..."
18-30s → Complete
```

## Error Handling Architecture

### Frontend Error Handling
```typescript
try {
  const response = await fetch('/api/analyze', {...});
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.details);
  }
  
  setResult(data); // Success
  
} catch (error) {
  setResult({ 
    error: true, 
    details: error.message 
  });
}
```

### Backend Error Handling
```typescript
try {
  // Step 1: Search
  try {
    searchResults = await performBrandSearch(brandName);
  } catch (error) {
    return { error: "Search failed", step: "search" };
  }
  
  // Step 2: Analysis
  try {
    report = await generateValidatedInsight(searchData, brandName);
  } catch (error) {
    return { error: "Analysis failed", step: "analysis" };
  }
  
  return { success: true, report };
  
} catch (error) {
  return { error: "Unexpected error", step: "unknown" };
}
```

## Type System

### Core Types
```typescript
// Input
interface AnalyzeRequest {
  url: string;
  brandName: string;
}

// Search Results
interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

interface ConsolidatedSearchResults {
  reviewsAndComplaints: SearchResult[];
  competitors: SearchResult[];
  topCompanies: SearchResult[];
  allText: string;
}

// AEO Report
interface AEOReportData {
  visibility: Visibility;
  sentiment: Sentiment;
  citations: Citations;
  content_strategy: ContentStrategy;
}

// Response
interface AnalyzeResponse {
  success: boolean;
  brandName: string;
  url: string;
  report: AEOReportData;
  timestamp: string;
}
```

## Environment Variables

```bash
# Required
GEMINI_API_KEY=         # Google Gemini API key
ZENROWS_API_KEY=        # ZenRows scraping API key

# Optional
BREVO_API_KEY=          # Email list management (future use)
```

## Performance Characteristics

### Timing Breakdown
| Phase | Duration | Details |
|-------|----------|---------|
| Input Validation | <100ms | Brand name extraction & validation |
| Search (ZenRows) | 15-20s | 3 parallel Google searches |
| Analysis (Gemini) | 10-15s | AI processing & validation |
| Response Formatting | <100ms | JSON serialization |
| **Total** | **25-35s** | End-to-end analysis |

### Resource Usage
- **API Calls per Analysis**: 4 total
  - 1 ZenRows call (with 3 internal queries)
  - 1 Gemini call
- **Data Transfer**: ~50-100KB per analysis
- **Memory**: Minimal server-side storage
- **Rate Limits**: Depends on API tier

## Security Considerations

1. **API Key Protection**
   - Stored in environment variables
   - Never exposed to client-side code
   - Accessed only by server-side API routes

2. **Input Validation**
   - Brand name required and sanitized
   - URL format validation on frontend
   - Type checking with TypeScript

3. **Error Handling**
   - No sensitive information in error messages
   - Generic errors returned to client
   - Detailed logs on server only

4. **Rate Limiting** (Recommended for Production)
   - IP-based throttling
   - Per-user request limits
   - API quota management

## Monitoring & Logging

### Server Logs
```
🚀 Starting AEO Analysis for: StayIQ
   URL: stayiq.ai

📊 Step 1: Gathering search data via ZenRows...
   ✓ Collected 30 search results

🤖 Step 2: Analyzing with Gemini AI...
   ✓ AEO report generated successfully
```

### Error Logs
```
ZenRows Error: [Error details]
Gemini Error: [Error details]
Unexpected Error: [Error details]
```

## Future Enhancements

1. **Real-time Progress** - WebSocket-based progress updates
2. **Caching** - Redis cache for duplicate analyses
3. **Database** - Store historical reports
4. **Analytics** - Track usage patterns
5. **Rate Limiting** - Protect API quotas
6. **Batch Processing** - Analyze multiple brands
7. **PDF Export** - Downloadable reports
8. **Comparison View** - Side-by-side brand comparisons

## File Structure

```
aeo-tool/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts          # Main API endpoint
│   └── page.tsx                  # Frontend integration
├── components/
│   ├── Hero.tsx                  # Input component
│   ├── LoadingHud.tsx            # Progress stepper
│   └── ResultDashboard.tsx       # Results display
├── lib/
│   ├── zenrows.ts                # SearchService
│   ├── gemini.ts                 # AnalysisService
│   └── aeo-analysis.ts           # Integration helper
├── types/
│   └── aeo-report.ts             # Type definitions
├── .env.local                    # Environment variables
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
├── API_INTEGRATION.md            # Integration guide
├── IMPLEMENTATION_SUMMARY.md     # Summary doc
├── ARCHITECTURE.md               # This file
└── test-integration.sh           # Test script
```

## Testing Checklist

- [ ] Environment variables configured
- [ ] Dependencies installed (`npm install`)
- [ ] TypeScript compilation successful
- [ ] Development server starts (`npm run dev`)
- [ ] Hero component accepts input
- [ ] API endpoint responds
- [ ] Loading stepper displays
- [ ] Search phase completes
- [ ] Analysis phase completes
- [ ] Results display correctly
- [ ] Error handling works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Production build works (`npm run build`)

## Deployment Notes

### Vercel Deployment
- Set `maxDuration = 60` in API route
- Configure environment variables in Vercel dashboard
- Use Pro plan for longer execution times if needed

### Environment Variables (Production)
```
GEMINI_API_KEY=<production_key>
ZENROWS_API_KEY=<production_key>
BREVO_API_KEY=<production_key>
NODE_ENV=production
```

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm run start
```

---

**Last Updated**: January 13, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
