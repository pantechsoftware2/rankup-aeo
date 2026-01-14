import { AEOReportData } from '@/types/aeo-report';

/**
 * AEO Report Generation Service
 * 
 * This service orchestrates the "Search & Analyze" loop for generating
 * comprehensive AI Engine Optimization reports.
 */

// ============================================================================
// MOCK SEARCH DATA GENERATOR
// ============================================================================

interface MockSearchResult {
  query: string;
  ai_answer: string;
  sources: Array<{
    title: string;
    url: string;
    domain: string;
    snippet: string;
    mentioned_brands: string[];
  }>;
  mentioned_brands_in_answer: string[];
}

/**
 * Simulates search engine queries and AI-generated answers
 * In production, this would call actual AI search engines (Perplexity, ChatGPT, etc.)
 */
function generateMockSearchResults(brandName: string, url: string): MockSearchResult[] {
  const domain = new URL(url).hostname;
  
  return [
    {
      query: `What are the best telemedicine platforms for healthcare?`,
      ai_answer: `The top telemedicine platforms include Teladoc Health, MDLive, and Amwell, which offer comprehensive virtual healthcare services. These platforms provide 24/7 access to licensed physicians and specialists. ${brandName} is an emerging player in this space, offering accessible telemedicine services with a focus on user-friendly interfaces. However, there are concerns about ${brandName}'s regulatory compliance and US licensing status that potential users should be aware of.`,
      sources: [
        {
          title: 'Top 10 Telemedicine Platforms 2026',
          url: 'https://healthtech.com/telemedicine-platforms-2026',
          domain: 'healthtech.com',
          snippet: 'Comprehensive review of leading telemedicine solutions including Teladoc and MDLive.',
          mentioned_brands: ['Teladoc', 'MDLive', 'Amwell'],
        },
        {
          title: `${brandName} Review - Reddit Discussion`,
          url: `https://reddit.com/r/telemedicine/${brandName.toLowerCase()}-review`,
          domain: 'reddit.com',
          snippet: `Users discuss ${brandName}'s interface and ease of use, but raise questions about licensing.`,
          mentioned_brands: [brandName],
        },
        {
          title: 'FDA Telemedicine Compliance Guide',
          url: 'https://fda.gov/telemedicine-compliance',
          domain: 'fda.gov',
          snippet: 'Official guidelines for telemedicine platform compliance in the United States.',
          mentioned_brands: [],
        },
      ],
      mentioned_brands_in_answer: ['Teladoc', 'MDLive', 'Amwell', brandName],
    },
    {
      query: `Is ${brandName} safe and legitimate?`,
      ai_answer: `${brandName} offers telemedicine services with an accessible interface, however there are significant concerns regarding its regulatory status. The platform does not appear to be properly licensed for medical practice in the United States, which is a major red flag for healthcare services. Users should verify licensing and compliance before using any telemedicine platform. Established alternatives like Teladoc and Amwell have clear US licensing and FDA compliance.`,
      sources: [
        {
          title: `${brandName} Official Website`,
          url: url,
          domain: domain,
          snippet: `${brandName} provides virtual healthcare consultations.`,
          mentioned_brands: [brandName],
        },
        {
          title: 'State Medical Board Directory',
          url: 'https://fsmb.org/state-medical-boards',
          domain: 'fsmb.org',
          snippet: 'Directory of licensed medical practitioners and facilities.',
          mentioned_brands: [],
        },
        {
          title: `${brandName} vs Competitors - TrustPilot`,
          url: `https://trustpilot.com/${brandName.toLowerCase()}`,
          domain: 'trustpilot.com',
          snippet: `Mixed reviews for ${brandName}, with concerns about transparency.`,
          mentioned_brands: [brandName, 'Teladoc', 'Amwell'],
        },
      ],
      mentioned_brands_in_answer: [brandName, 'Teladoc', 'Amwell'],
    },
    {
      query: `${brandName} vs Teladoc comparison`,
      ai_answer: `When comparing ${brandName} to Teladoc, Teladoc is a well-established, fully licensed telemedicine provider with comprehensive insurance coverage and regulatory compliance. ${brandName} offers a simpler interface but lacks clear documentation of US medical licensing, which is essential for healthcare services. For users prioritizing safety and legitimacy, Teladoc remains the more reliable choice.`,
      sources: [
        {
          title: 'Teladoc Official Website',
          url: 'https://teladoc.com',
          domain: 'teladoc.com',
          snippet: 'Leading telemedicine provider with full US licensing and accreditation.',
          mentioned_brands: ['Teladoc'],
        },
        {
          title: `${brandName} Platform Overview`,
          url: url,
          domain: domain,
          snippet: `${brandName}'s interface and service offerings.`,
          mentioned_brands: [brandName],
        },
        {
          title: 'Healthcare Compliance Standards - Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Healthcare_compliance',
          domain: 'wikipedia.org',
          snippet: 'Overview of medical licensing and compliance requirements.',
          mentioned_brands: [],
        },
      ],
      mentioned_brands_in_answer: [brandName, 'Teladoc'],
    },
  ];
}

// ============================================================================
// AI ANALYST SYSTEM PROMPT BUILDER
// ============================================================================

/**
 * Constructs a comprehensive system prompt for the AI Analyst
 * This prompt guides GPT-4/Claude to perform deep AEO analysis
 */
function buildAIAnalystSystemPrompt(
  brandName: string,
  url: string,
  searchResults: MockSearchResult[]
): string {
  const domain = new URL(url).hostname;
  
  return `# AI ENGINE OPTIMIZATION (AEO) ANALYST - SYSTEM INSTRUCTIONS

You are an elite AI Engine Optimization analyst specializing in analyzing how brands appear in AI-generated search answers (ChatGPT, Perplexity, Claude, Gemini, etc.). Your task is to perform a comprehensive analysis across 4 critical pillars.

## BRAND CONTEXT
- **Brand Name**: ${brandName}
- **Website**: ${url}
- **Domain**: ${domain}

## SEARCH DATA PROVIDED
You will analyze ${searchResults.length} AI search queries and their generated answers to assess ${brandName}'s performance.

---

## PILLAR 1: VISIBILITY ANALYSIS

### Your Role
Act as a search engine ranking algorithm expert. You are evaluating **Share of Voice** in AI-generated answers.

### Analysis Instructions
1. **Calculate Visibility Score (0-10 scale)**:
   - Count how many times ${brandName} is mentioned across all AI answers
   - Compare this to competitor mentions (Teladoc, MDLive, Amwell, etc.)
   - Formula: (Brand Mentions / Total Brand Mentions in Category) × 10
   - Consider: prominence of mention (early vs late), context (positive vs negative)

2. **Determine Competitive Rank**:
   - Rank ${brandName} against all mentioned competitors
   - Rank 1 = most visible, higher numbers = less visible
   - Base ranking on: frequency of mentions, answer positioning, authority of context

3. **Competitor Benchmarking**:
   - Identify the top 5-8 competitors mentioned in AI answers
   - Calculate a visibility score for each competitor
   - Mark ${brandName} with is_user: true in the output

### Expected Output Structure
\`\`\`json
{
  "score": 7.2,
  "rank": 3,
  "competitors": [
    { "name": "Teladoc", "score": 9.5, "is_user": false },
    { "name": "MDLive", "score": 8.3, "is_user": false },
    { "name": "${brandName}", "score": 7.2, "is_user": true },
    ...
  ]
}
\`\`\`

---

## PILLAR 2: SENTIMENT & REGULATORY CHECK ⚠️ CRITICAL

### Your Role
Act as a trust and safety analyst for healthcare/regulated industries. You are specifically hunting for **RED FLAGS** around:
- Trust signals
- Licensing and credentials
- Regulatory compliance
- Professional certifications
- Legal compliance warnings

### Analysis Instructions

#### A. Calculate Sentiment Distribution
1. Read the tone of every mention of ${brandName} in AI answers
2. Classify each mention as Positive, Neutral, or Negative
3. Calculate percentages:
   - positive_percent: % of mentions that are favorable
   - negative_percent: % of mentions that are unfavorable or cautious

#### B. Extract Strengths (GREEN FLAGS) ✅
Identify positive attributes mentioned about ${brandName}:
- User experience highlights
- Technology advantages
- Accessibility features
- Positive user testimonials
- Competitive advantages

Format as short phrases (max 8 words each):
- Example: "Accessible telemedicine interface"
- Example: "24/7 customer support availability"

#### C. Extract Weaknesses (YELLOW FLAGS) ⚠️
Identify areas of concern or criticism:
- Competitive disadvantages
- User complaints
- Missing features
- Unclear information

Format as short phrases (max 8 words each):
- Example: "Limited insurance coverage options"
- Example: "Unclear pricing structure"

#### D. CRITICAL: Regulatory Warnings (RED FLAGS) 🚨
**This is the most important section.** Healthcare, finance, and legal industries face severe trust penalties.

Scan for phrases like:
- "does not appear to be licensed"
- "lacks FDA approval"
- "regulatory compliance unclear"
- "not accredited by..."
- "no evidence of certification"
- "potential legal concerns"
- "violates regulations"

Extract these as direct, serious warnings:
- Example: "Does not appear to be licensed in the US"
- Example: "No visible FDA compliance documentation"
- Example: "Lacks state medical board accreditation"

**IMPORTANT**: If you find ANY licensing or compliance concerns, include them. These are deal-breakers for users.

### Expected Output Structure
\`\`\`json
{
  "positive_percent": 35,
  "negative_percent": 65,
  "strengths": [
    "Accessible telemedicine interface",
    "Fast appointment scheduling"
  ],
  "weaknesses": [
    "Limited insurance coverage",
    "Unclear pricing structure"
  ],
  "regulatory_warnings": [
    "Does not appear to be licensed in the US",
    "No visible compliance with state medical boards"
  ]
}
\`\`\`

---

## PILLAR 3: CITATION MAPPING

### Your Role
Act as a data analyst tracking citation patterns in AI-generated content.

### Analysis Instructions

#### A. Top Domain Analysis
1. Extract all source domains cited in AI answers
2. Calculate "Citation Share" for each domain:
   - Formula: (Citations from Domain / Total Citations) × 100
3. Rank domains by citation frequency
4. Focus on authoritative sources (Wikipedia, .gov, .edu, major publications)

#### B. Frequent Pages Analysis
1. Identify the most-cited specific URLs
2. For each frequent page, extract:
   - **title**: Page headline
   - **url**: Full URL
   - **source**: Domain name only
   - **relevance_score**: 0-100 based on how relevant to ${brandName} (0=generic, 100=brand-specific)

3. Prioritize pages that:
   - Mention ${brandName} directly
   - Cover the brand's category/industry
   - Come from high-authority domains

### Expected Output Structure
\`\`\`json
{
  "top_domains": [
    { "domain": "healthtech.com", "percentage": 28 },
    { "domain": "wikipedia.org", "percentage": 22 },
    { "domain": "reddit.com", "percentage": 18 },
    ...
  ],
  "frequent_pages": [
    {
      "title": "Top 10 Telemedicine Platforms 2026",
      "url": "https://healthtech.com/telemedicine-platforms-2026",
      "source": "healthtech.com",
      "relevance_score": 85
    },
    ...
  ]
}
\`\`\`

---

## PILLAR 4: STRATEGIC CONTENT GAPS

### Your Role
Act as a content strategist and SEO expert specializing in AI Engine Optimization.

### Analysis Instructions

Based on your visibility analysis, identify **exactly 3 content opportunities** that ${brandName} should create to improve AI answer rankings.

#### Content Format Requirements

**Format 1: Listicle** 📋
- Create a numbered list article title
- Should target a high-value search query
- Example: "7 Proven Ways [Brand] Ensures HIPAA Compliance"
- **Reasoning**: Explain why this format/topic will improve visibility

**Format 2: Comparison** ⚖️
- Create a head-to-head comparison title
- Must compare ${brandName} to a top competitor
- Example: "${brandName} vs Teladoc: Which Telemedicine Platform is Right for You?"
- **Reasoning**: Explain the competitive advantage this addresses

**Format 3: Problem Solution** 💡
- Create a problem-solving guide title
- Should address a user pain point or concern
- Example: "How ${brandName} Solves the Telemedicine Licensing Gap"
- **Reasoning**: Explain what gap this fills

### Strategic Guidelines
1. **Address Weaknesses**: If regulatory warnings exist, recommend content that builds trust
2. **Compete Directly**: Target queries where competitors dominate
3. **Leverage Strengths**: Amplify existing positive attributes
4. **Fill Citation Gaps**: Create content that authoritative sites will link to

### Expected Output Structure
\`\`\`json
{
  "opportunities": [
    {
      "type": "Listicle",
      "title": "7 Ways ${brandName} Ensures Patient Safety and Compliance",
      "reasoning": "Directly addresses the #1 concern (licensing) and builds trust through transparent documentation."
    },
    {
      "type": "Comparison",
      "title": "${brandName} vs Teladoc: A Complete 2026 Comparison",
      "reasoning": "Teladoc appears 3x more in AI answers. This comparison content can capture those searches."
    },
    {
      "type": "Problem Solution",
      "title": "How to Choose a Licensed Telemedicine Provider: A Patient's Guide",
      "reasoning": "Positions ${brandName} as an authority on the licensing issue while educating users."
    }
  ]
}
\`\`\`

---

## OUTPUT FORMAT

Return your complete analysis as a valid JSON object matching this structure:

\`\`\`json
{
  "visibility": {
    "score": number,
    "rank": number,
    "competitors": [{ "name": string, "score": number, "is_user": boolean }]
  },
  "sentiment": {
    "positive_percent": number,
    "negative_percent": number,
    "strengths": string[],
    "weaknesses": string[],
    "regulatory_warnings": string[]
  },
  "citations": {
    "top_domains": [{ "domain": string, "percentage": number }],
    "frequent_pages": [{ "title": string, "url": string, "source": string, "relevance_score": number }]
  },
  "content_strategy": {
    "opportunities": [{ "type": "Listicle" | "Comparison" | "Problem Solution", "title": string, "reasoning": string }]
  }
}
\`\`\`

## SEARCH RESULTS DATA

${JSON.stringify(searchResults, null, 2)}

---

## FINAL INSTRUCTIONS

1. **Be Thorough**: Analyze every mention, every citation, every sentiment signal
2. **Be Honest**: If ${brandName} has regulatory issues, report them clearly
3. **Be Strategic**: Your content recommendations should directly address weaknesses
4. **Be Precise**: Use exact numbers, percentages, and scores
5. **Return ONLY valid JSON**: No markdown code blocks, no explanations outside JSON

Begin your analysis now.`;
}

// ============================================================================
// MAIN SERVICE FUNCTION
// ============================================================================

/**
 * Generates a comprehensive AEO Report for a brand
 * 
 * @param url - The brand's website URL
 * @param brandName - The brand name to analyze
 * @returns Promise<AEOReportData> - Complete AEO report data
 */
export async function generateAEOReport(
  url: string,
  brandName: string
): Promise<AEOReportData> {
  console.log(`🔍 Starting AEO Report Generation for: ${brandName}`);
  console.log(`🌐 URL: ${url}`);
  
  // STEP 1: SEARCH SIMULATION
  console.log('📊 Step 1: Generating mock search results...');
  const searchResults = generateMockSearchResults(brandName, url);
  console.log(`✅ Generated ${searchResults.length} search queries with AI answers`);
  
  // STEP 2: BUILD AI ANALYST PROMPT
  console.log('🤖 Step 2: Building AI Analyst system prompt...');
  const systemPrompt = buildAIAnalystSystemPrompt(brandName, url, searchResults);
  console.log(`✅ System prompt built (${systemPrompt.length} characters)`);
  
  // STEP 3: AI ANALYSIS (MOCKED FOR NOW)
  console.log('🧠 Step 3: AI Analysis (using mock data for now)...');
  console.log('📝 System Prompt Preview:');
  console.log(systemPrompt.substring(0, 500) + '...\n');
  
  // TODO: Replace this with actual OpenAI/Anthropic API call
  // Example:
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4-turbo-preview",
  //   messages: [
  //     { role: "system", content: systemPrompt },
  //     { role: "user", content: "Perform the AEO analysis now." }
  //   ],
  //   response_format: { type: "json_object" }
  // });
  // const reportData = JSON.parse(response.choices[0].message.content);
  
  // For now, return structured mock data that matches the schema
  const mockReportData: AEOReportData = {
    visibility: {
      score: 7.2,
      rank: 3,
      competitors: [
        { name: 'Teladoc', score: 9.5, is_user: false },
        { name: 'MDLive', score: 8.3, is_user: false },
        { name: brandName, score: 7.2, is_user: true },
        { name: 'Amwell', score: 6.8, is_user: false },
        { name: 'Doctor on Demand', score: 5.9, is_user: false },
      ],
    },
    sentiment: {
      positive_percent: 35,
      negative_percent: 65,
      strengths: [
        'Accessible telemedicine interface',
        'Fast appointment scheduling',
        'User-friendly mobile app',
      ],
      weaknesses: [
        'Limited insurance coverage options',
        'Unclear pricing structure',
        'Fewer specialists than competitors',
      ],
      regulatory_warnings: [
        'Does not appear to be licensed in the US',
        'No visible compliance with state medical boards',
        'Unclear HIPAA compliance documentation',
      ],
    },
    citations: {
      top_domains: [
        { domain: 'healthtech.com', percentage: 28 },
        { domain: 'wikipedia.org', percentage: 22 },
        { domain: 'reddit.com', percentage: 18 },
        { domain: 'fda.gov', percentage: 15 },
        { domain: 'trustpilot.com', percentage: 10 },
        { domain: new URL(url).hostname, percentage: 7 },
      ],
      frequent_pages: [
        {
          title: 'Top 10 Telemedicine Platforms 2026',
          url: 'https://healthtech.com/telemedicine-platforms-2026',
          source: 'healthtech.com',
          relevance_score: 85,
        },
        {
          title: 'Healthcare Compliance Standards - Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Healthcare_compliance',
          source: 'wikipedia.org',
          relevance_score: 72,
        },
        {
          title: `${brandName} Review - Reddit Discussion`,
          url: `https://reddit.com/r/telemedicine/${brandName.toLowerCase()}-review`,
          source: 'reddit.com',
          relevance_score: 95,
        },
        {
          title: 'FDA Telemedicine Compliance Guide',
          url: 'https://fda.gov/telemedicine-compliance',
          source: 'fda.gov',
          relevance_score: 68,
        },
      ],
    },
    content_strategy: {
      opportunities: [
        {
          type: 'Listicle',
          title: `7 Ways ${brandName} Ensures Patient Safety and Compliance`,
          reasoning:
            'Directly addresses the #1 concern (licensing) and builds trust through transparent documentation. This listicle format performs well in AI answers.',
        },
        {
          type: 'Comparison',
          title: `${brandName} vs Teladoc: A Complete 2026 Comparison`,
          reasoning:
            'Teladoc appears 3x more in AI answers. This comparison content can capture those searches and position the brand competitively.',
        },
        {
          type: 'Problem Solution',
          title: 'How to Choose a Licensed Telemedicine Provider: A Patient\'s Guide',
          reasoning:
            `Positions ${brandName} as an authority on the licensing issue while educating users. Addresses user concerns proactively.`,
        },
      ],
    },
  };
  
  console.log('✅ AEO Report generated successfully');
  return mockReportData;
}

/**
 * Exports the system prompt builder for external use
 * (e.g., for testing or direct API integration)
 */
export { buildAIAnalystSystemPrompt, generateMockSearchResults };
