export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingPage {
  slug: string;
  category: 'service' | 'industry';
  updatedAt?: string;
  title: string;
  description: string;
  excerpt: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  outcomeTitle: string;
  outcomeBody: string;
  bullets: string[];
  problems: string[];
  approach: string[];
  faqs: LandingFaq[];
  keywords: string[];
}

export interface LandingPageDepth {
  directAnswer: string;
  whatThisIs: string[];
  whoFor: string[];
  problemsSolved: string[];
  process: string[];
  deliverables: string[];
  roadmap?: Array<{ phase: string; details: string }>;
  searchBehavior?: string[];
  trustSignals?: string[];
  aiVisibilityConcerns?: string[];
  decisionFaqs: LandingFaq[];
  comparisonQuestions: LandingFaq[];
  primaryServiceSlug?: string;
}

const pages: LandingPage[] = [
  {
    slug: 'seo-aeo-agency',
    category: 'service',
    title: 'SEO and AEO Agency for Businesses That Need More Qualified Discovery',
    description:
      'RankUp is an SEO and AEO agency that helps businesses improve Google visibility, answer engine citations, and revenue-driving discoverability.',
    excerpt:
      'For businesses that need more than random traffic. We tighten the site, the authority layer, and the answer-engine readiness together.',
    eyebrow: 'Service Page',
    heroTitle: 'An SEO and AEO agency for businesses that are tired of being overlooked.',
    heroBody:
      'If the business has a website but still feels strangely hard to find, the issue is usually not some mystical algorithm curse. It is a visibility system problem. We fix rankings, trust, structure, and citability together so the business becomes easier to find and easier to choose.',
    outcomeTitle: 'What this service is built to change',
    outcomeBody:
      'This is for companies that need a sharper presence in Google and a stronger footprint in the answer layer. The goal is not vanity. The goal is more qualified discovery from people already looking for what you do.',
    bullets: [
      'Clearer service and category pages',
      'Technical cleanup and schema support',
      'Stronger trust signals and proof blocks',
      'Pages shaped to be more citeable in answer engines',
    ],
    problems: [
      'You have a website, but the business still feels invisible in category searches.',
      'The copy sounds generic, so Google and AI systems struggle to anchor what you actually do.',
      'The site lacks proof, structure, and comparison coverage at the decision stage.',
    ],
    approach: [
      'Audit the highest-leverage pages and search surfaces first.',
      'Tighten structure, entity clarity, and trust cues across the site.',
      'Rework the content that should be winning rankings, comparisons, and citations.',
    ],
    faqs: [
      {
        question: 'Who is this for?',
        answer:
          'Any business with a website that wants stronger discoverability in Google and answer engines. The model works best when the business already has a real offer and real demand.',
      },
      {
        question: 'Why combine SEO and AEO?',
        answer:
          'Because they depend on the same foundation. Better structure, clearer pages, stronger proof, and better authority signals improve both rankings and citations.',
      },
    ],
    keywords: ['seo and aeo agency', 'answer engine optimization agency', 'seo retainer agency'],
  },
  {
    slug: 'google-ai-overviews-optimization',
    category: 'service',
    title: 'Google AI Overviews Optimization for Businesses That Need to Be Chosen',
    description:
      'Improve how your business appears in Google AI Overviews by strengthening page structure, trust, and citeable content.',
    excerpt:
      'This is for businesses that want to show up in the part of Google people are increasingly reading before they ever click.',
    eyebrow: 'Service Page',
    heroTitle: 'Google AI Overviews optimization starts with making the site safer to trust.',
    heroBody:
      'A lot of teams think AI Overviews are some separate hack. They are not. If the site is vague, thin, or unsupported, Google has less reason to surface it in its answer layer. We fix the part that makes you easy to cite instead of easy to ignore.',
    outcomeTitle: 'What we improve',
    outcomeBody:
      'We focus on the pages, questions, and proof blocks most likely to influence Google’s understanding of the business and your ability to show up in answer-led search experiences.',
    bullets: [
      'Sharper intent and question coverage',
      'Cleaner schema and supporting structure',
      'Better comparison and FAQ content',
      'More explicit proof and trust language',
    ],
    problems: [
      'Your pages do not directly answer the buyer questions people are asking.',
      'The site lacks original detail, comparisons, or clear proof.',
      'Google can crawl the site but still does not have a clean summary of why the business matters.',
    ],
    approach: [
      'Identify which queries and pages matter most for AI Overview visibility.',
      'Rewrite and restructure those pages around clarity, evidence, and relevance.',
      'Support the pages with cleaner context so Google has more confidence in citing them.',
    ],
    faqs: [
      {
        question: 'Can you guarantee AI Overview placement?',
        answer:
          'No honest team should guarantee that. What we can do is materially improve the conditions that make your business more likely to be surfaced and trusted.',
      },
      {
        question: 'Is this different from normal SEO?',
        answer:
          'It is an extension of the same work. Rankings still matter. This just raises the bar on clarity, directness, and evidence.',
      },
    ],
    keywords: ['google ai overviews optimization', 'google ai overview seo', 'ai overviews agency'],
  },
  {
    slug: 'chatgpt-visibility-audit',
    category: 'service',
    title: 'ChatGPT Visibility Audit for Brands That Want to Be Mentioned and Cited',
    description:
      'Run a ChatGPT visibility audit to see how your business is positioned for discovery, comparison, and citations inside answer engines.',
    excerpt:
      'If buyers are asking ChatGPT for the shortlist, you need to know whether your business shows up as an option or disappears.',
    eyebrow: 'Service Page',
    heroTitle: 'A ChatGPT visibility audit shows whether your business is even in the conversation.',
    heroBody:
      'This is not about tricking a chatbot. It is about understanding whether your website, authority layer, and brand footprint make it easy for answer engines to mention you, trust you, and point buyers toward you.',
    outcomeTitle: 'What the audit looks for',
    outcomeBody:
      'We look at brand clarity, category fit, supporting proof, comparison coverage, and whether the site gives the model enough clean material to work with.',
    bullets: [
      'Brand and entity clarity',
      'Comparison and alternative coverage',
      'Trust and evidence gaps',
      'Surface-level fixes that improve citeability',
    ],
    problems: [
      'You do not know if your brand shows up in AI-assisted research at all.',
      'The site says what you do, but not in a way that is easy to summarize or compare.',
      'Your authority signals are too weak to support mention and citation behavior.',
    ],
    approach: [
      'Assess how clearly the business is positioned across the site and the wider web.',
      'Find the missing page types and missing proof blocks that suppress discoverability.',
      'Turn the diagnosis into a cleaner roadmap for the next 90 days.',
    ],
    faqs: [
      {
        question: 'Does ChatGPT use websites as sources?',
        answer:
          'Yes. ChatGPT search includes source links, which is exactly why your website still matters.',
      },
      {
        question: 'Is this useful if I already rank in Google?',
        answer:
          'Yes. Strong rankings help, but answer engines still reward pages that are easier to summarize, compare, and trust.',
      },
    ],
    keywords: ['chatgpt visibility audit', 'chatgpt seo audit', 'answer engine audit'],
  },
  {
    slug: 'seo-retainer-for-businesses',
    category: 'service',
    title: '90-Day SEO Retainer for Businesses That Need Measurable Movement',
    description:
      'A focused SEO and AEO retainer for businesses that need concentrated execution instead of generic monthly reporting.',
    excerpt:
      'Three months is long enough to diagnose the gaps, tighten the pages, rebuild trust signals, and create real movement.',
    eyebrow: 'Service Page',
    heroTitle: 'A 90-day SEO retainer for businesses that want execution, not theater.',
    heroBody:
      'A lot of retainers are really just meetings with nicer decks. This one is built around concentrated implementation. We use the first 90 days to diagnose the highest-leverage gaps, fix what matters, and give the visibility system a sharper shape.',
    outcomeTitle: 'What the retainer is meant to do',
    outcomeBody:
      'This is best for teams that do not need endless theory. They need the highest-impact pages, signals, and content fixes handled in the right order.',
    bullets: [
      'Fast diagnosis of the visibility stack',
      'Priority-page rewrites and structural cleanup',
      'Authority and citation support work',
      'A clearer path from audit to execution',
    ],
    problems: [
      'You have already heard enough abstract SEO advice.',
      'The business needs implementation momentum, not another list of ideas.',
      'Your current website has several obvious gaps, but nobody is fixing them in sequence.',
    ],
    approach: [
      'Month 1: diagnose and prioritize.',
      'Month 2: rebuild the pages and trust layer.',
      'Month 3: push the visibility gains so they start compounding.',
    ],
    faqs: [
      {
        question: 'Why 90 days?',
        answer:
          'Because it is enough time to move from diagnosis into real execution without dragging the work out into vague forever-retainer territory.',
      },
      {
        question: 'What happens after 90 days?',
        answer:
          'Some clients keep going. Some take the system in-house. The point is that the first 90 days create a real before-and-after baseline.',
      },
    ],
    keywords: ['seo retainer for businesses', '90 day seo retainer', 'seo implementation retainer'],
  },
  {
    slug: 'saas-seo-aeo',
    category: 'industry',
    title: 'SEO and AEO for SaaS Companies That Need Better Category Discovery',
    description:
      'SEO and AEO for SaaS companies that need stronger Google rankings, better comparison visibility, and more trustworthy positioning in AI search.',
    excerpt:
      'SaaS buyers compare fast. If your site is vague or generic, you lose before the demo request.',
    eyebrow: 'Industry Page',
    heroTitle: 'SEO and AEO for SaaS companies that need to sound like the obvious choice.',
    heroBody:
      'SaaS websites often look polished and still underperform. They talk in abstractions, bury category language, and forget that buyers compare tools long before the signup. We tighten the site so it ranks cleaner, compares better, and gets understood faster.',
    outcomeTitle: 'Where SaaS sites usually leak',
    outcomeBody:
      'The problem is usually not that the product is weak. It is that the category positioning, alternatives coverage, and trust cues are too soft to win research-stage attention.',
    bullets: [
      'Sharper category and use-case positioning',
      'Better comparison and alternative pages',
      'Cleaner product-to-problem mapping',
      'Stronger trust and proof content',
    ],
    problems: [
      'The homepage says a lot without saying the core category cleanly.',
      'Comparison pages are thin or missing entirely.',
      'The site feels polished but not citeable.',
    ],
    approach: [
      'Clarify what the product is, who it is for, and what category it belongs to.',
      'Build or improve decision-stage pages like alternatives, comparisons, and use-case pages.',
      'Strengthen proof so both buyers and answer engines trust the positioning more quickly.',
    ],
    faqs: [
      {
        question: 'Is this relevant if we already invest in content?',
        answer:
          'Yes. A lot of SaaS content libraries are broad but weak at the exact pages buyers use to shortlist tools.',
      },
      {
        question: 'Do comparison pages really matter?',
        answer:
          'Very much. Buyers ask comparison questions constantly, and answer engines summarize them even faster.',
      },
    ],
    keywords: ['saas seo agency', 'saas aeo', 'seo for saas companies'],
  },
  {
    slug: 'law-firm-seo-aeo',
    category: 'industry',
    title: 'SEO and AEO for Law Firms That Need Trust, Clarity, and Local Visibility',
    description:
      'SEO and AEO for law firms that want stronger local discovery, clearer practice area pages, and better trust signals in Google and AI search.',
    excerpt:
      'Legal buyers search with urgency. If the practice area pages are weak, the firm leaks trust before the first call.',
    eyebrow: 'Industry Page',
    heroTitle: 'SEO and AEO for law firms that need to look credible before the consultation.',
    heroBody:
      'Law firm marketing often gets trapped in generic boilerplate. The result is a site that sounds respectable but says very little. We tighten practice-area clarity, local discoverability, and proof so the firm is easier to trust when intent is high.',
    outcomeTitle: 'What matters most for law firms',
    outcomeBody:
      'High-intent legal searches depend on trust, precision, and local relevance. The website needs to signal competence fast and remove ambiguity.',
    bullets: [
      'Stronger practice area pages',
      'Better local relevance and service-area clarity',
      'Sharper trust and credibility cues',
      'Cleaner FAQ and decision-stage content',
    ],
    problems: [
      'Practice area pages sound too broad or too interchangeable.',
      'The site does not clearly connect expertise, location, and client concern.',
      'Answer engines have very little concrete detail to work with.',
    ],
    approach: [
      'Clarify practice areas and service geography.',
      'Improve the pages that should answer high-intent legal questions directly.',
      'Strengthen the proof and structure that make the firm look dependable before the first contact.',
    ],
    faqs: [
      {
        question: 'Does this replace local SEO?',
        answer:
          'No. It improves local SEO and extends it into answer-led discovery by making the site clearer and more trustworthy.',
      },
      {
        question: 'Is this only for large firms?',
        answer:
          'No. Small and mid-sized firms often gain the most because the visibility gaps are easier to spot and fix.',
      },
    ],
    keywords: ['law firm seo', 'law firm aeo', 'seo for attorneys'],
  },
  {
    slug: 'home-services-seo-aeo',
    category: 'industry',
    title: 'SEO and AEO for Home Service Businesses That Need More High-Intent Leads',
    description:
      'SEO and AEO for HVAC, plumbing, roofing, landscaping, and other home service businesses that need stronger local discovery and clearer trust signals.',
    excerpt:
      'When a homeowner needs help, they search with intent. The business that looks clearest and safest to trust usually wins first.',
    eyebrow: 'Industry Page',
    heroTitle: 'SEO and AEO for home service businesses that need to get chosen faster.',
    heroBody:
      'Home service websites often lose because they are vague, thin, or look identical to five competitors nearby. We fix the pages, service-area clarity, and trust cues so the business becomes easier to find and easier to call.',
    outcomeTitle: 'Where home service sites usually lose',
    outcomeBody:
      'The biggest leaks are usually weak service pages, poor local specificity, and missing proof. That hurts both rankings and conversion at the exact moment intent is highest.',
    bullets: [
      'Clearer service and city pages',
      'Better local trust and proof content',
      'More direct answers to buyer questions',
      'Improved category and service-area structure',
    ],
    problems: [
      'The site uses generic service copy that could belong to anyone.',
      'Service areas are unclear or underdeveloped.',
      'There is not enough proof to make the business feel like the safe choice.',
    ],
    approach: [
      'Tighten the core service and location pages first.',
      'Make the site more concrete, local, and trustworthy.',
      'Add the answers and proof blocks that help both buyers and answer engines choose you.',
    ],
    faqs: [
      {
        question: 'Does this help local map visibility too?',
        answer:
          'It can help the broader local visibility system, though map performance also depends on things beyond the website itself.',
      },
      {
        question: 'Is this only for big metro businesses?',
        answer:
          'No. Smaller local businesses often benefit quickly because the service-area and proof gaps are usually obvious.',
      },
    ],
    keywords: ['home services seo', 'local seo for contractors', 'hvac plumbing roofing seo'],
  },
  {
    slug: 'b2b-services-seo-aeo',
    category: 'industry',
    title: 'SEO and AEO for B2B Service Companies That Need Better Qualified Demand',
    description:
      'SEO and AEO for agencies, consultancies, and B2B service companies that want clearer positioning and stronger search-driven discovery.',
    excerpt:
      'B2B service firms often sound smart and still say too little. That kills discoverability and weakens trust.',
    eyebrow: 'Industry Page',
    heroTitle: 'SEO and AEO for B2B service companies that need to stop sounding interchangeable.',
    heroBody:
      'A lot of B2B service sites use polished language that never quite says what the company does, who it helps, or why it is different. We fix that. The work is about category clarity, proof, and discoverability for people already looking for a solution.',
    outcomeTitle: 'What changes for B2B service firms',
    outcomeBody:
      'The site becomes easier to understand, easier to rank, and easier to trust in the exact moments when buyers are building a shortlist.',
    bullets: [
      'Clearer service positioning',
      'Stronger proof and credibility cues',
      'Better use-case and problem-stage pages',
      'Cleaner answers for evaluation-stage queries',
    ],
    problems: [
      'The website sounds polished but generic.',
      'The services are not mapped cleanly to buyer problems or search intent.',
      'The company has expertise but not enough proof on the page.',
    ],
    approach: [
      'Clarify the categories, offers, and buyer problems the site should own.',
      'Improve service pages, proof blocks, and use-case content.',
      'Build a stronger decision-stage layer so the site helps buyers choose faster.',
    ],
    faqs: [
      {
        question: 'Is this just for agencies?',
        answer:
          'No. It works for agencies, consultancies, fractional services, and other B2B firms that sell expertise through their website.',
      },
      {
        question: 'Do you focus on traffic or conversion?',
        answer:
          'Both, but qualified discovery comes first. The right visitors matter more than raw vanity traffic.',
      },
    ],
    keywords: ['b2b services seo', 'consulting seo agency', 'seo for service businesses'],
  },
];

export function getLandingPages(category?: LandingPage['category']) {
  return category ? pages.filter((page) => page.category === category) : pages;
}

export function getLandingPage(category: LandingPage['category'], slug: string) {
  return pages.find((page) => page.category === category && page.slug === slug);
}

const depthBySlug: Record<string, LandingPageDepth> = {
  'seo-aeo-agency': {
    directAnswer:
      'RankUp AEO is an SEO and AEO agency for businesses that need clearer rankings, stronger entity trust, and pages that can be cited by Google AI Overviews, ChatGPT, Gemini, Perplexity, and Bing Copilot.',
    whatThisIs: [
      'This service combines technical SEO, page restructuring, schema support, buyer-intent content, and answer-engine readiness into one visibility program. The work starts with the pages that already matter commercially, then improves the surrounding context that helps search systems understand the business.',
      'The focus is not generic publishing volume. The focus is making the business easier to classify, compare, trust, and recommend when a buyer searches for a category, a problem, or a shortlist.',
    ],
    whoFor: [
      'Founder-led companies, local service businesses, SaaS teams, consultants, agencies, and B2B service firms with a real offer and a website that is not producing enough qualified discovery.',
      'Teams that know SEO matters but also need their site to be summarized accurately by answer engines and AI-assisted research tools.',
    ],
    problemsSolved: [
      'Important service pages are too vague to rank or cite confidently.',
      'The site lacks entity clarity, proof, FAQs, and comparison coverage.',
      'Technical issues, thin pages, or weak internal links make the site harder to crawl and evaluate.',
      'AI answer engines can describe the category but do not have enough confidence to mention or cite the business.',
    ],
    process: [
      'Audit the crawl, metadata, schema, page intent, content depth, internal links, and authority signals.',
      'Prioritize commercial pages before supporting content so the highest-value buying journeys improve first.',
      'Rewrite or expand pages with direct answers, proof, deliverables, FAQs, comparison language, and internal links.',
      'Measure movement with search visibility, index coverage, page quality, and answer-engine citation checks.',
    ],
    deliverables: [
      'Technical SEO and AEO gap audit.',
      'Priority-page rewrite and schema recommendations.',
      'Internal linking map for services, industries, blog, and audit flow.',
      '90-day implementation roadmap with sequencing by impact.',
    ],
    roadmap: [
      { phase: 'Days 1-30', details: 'Crawl the site, confirm indexable pages, map search intent, fix metadata/schema gaps, and identify the pages most likely to change qualified discovery.' },
      { phase: 'Days 31-60', details: 'Rebuild priority service and industry pages with deeper answers, decision FAQs, comparison coverage, trust cues, and contextual links.' },
      { phase: 'Days 61-90', details: 'Expand supporting content, tune internal links, review answer-engine summaries, and refine pages based on early visibility signals.' },
    ],
    decisionFaqs: [
      { question: 'Should we hire RankUp if we already have an SEO vendor?', answer: 'Yes, if the current work is not improving page clarity, trust signals, answer-engine visibility, or commercial-page quality. RankUp can audit the current system and focus on the missing layers.' },
      { question: 'Will this create fake authority?', answer: 'No. RankUp does not invent reviews, guarantees, clients, or statistics. The work strengthens real information that the business can stand behind.' },
    ],
    comparisonQuestions: [
      { question: 'SEO agency vs AEO agency: what is different?', answer: 'An SEO agency usually focuses on rankings and traffic. An AEO agency also improves how clearly the site can be summarized, cited, and compared by answer engines. RankUp treats those as one connected visibility system.' },
      { question: 'Audit-only vs retainer: which is better?', answer: 'An audit is best for diagnosis. A retainer is better when the business needs implementation across pages, schema, internal links, and content depth.' },
    ],
  },
  'google-ai-overviews-optimization': {
    directAnswer:
      'Google AI Overviews optimization means improving the pages, structure, and proof that help Google understand when your business is a reliable source for answer-led search results.',
    whatThisIs: [
      'This service audits the pages most likely to influence AI Overview eligibility and improves them with direct answers, clearer entity language, structured data, internal links, and decision-stage coverage.',
      'It does not promise placement in AI Overviews. It improves the conditions that make the business easier for Google to understand and safer to cite.',
    ],
    whoFor: [
      'Businesses with commercial pages that rank inconsistently or fail to answer the exact questions buyers ask before contacting them.',
      'Teams that need their site to explain services, industries, proof, and comparisons clearly enough for both classic search and AI-generated summaries.',
    ],
    problemsSolved: [
      'Pages answer broad topics but miss the concise answer Google can extract.',
      'Schema exists but is not supported by visible page content.',
      'FAQs are too generic for decision-stage buyers.',
      'Internal links do not connect service pages, industry pages, research, and audit CTAs.',
    ],
    process: [
      'Map target queries and pages that could trigger answer-led visibility.',
      'Compare visible content against metadata, schema, FAQs, and internal links.',
      'Add direct answer blocks, comparison questions, and proof-backed explanations.',
      'Review pages for summary quality across AI search tools and Google result behavior.',
    ],
    deliverables: [
      'AI Overview readiness audit.',
      'Priority page updates for direct answers and structured sections.',
      'FAQ and comparison question set.',
      'Internal linking recommendations from service pages to audit flow and related services.',
    ],
    roadmap: [
      { phase: 'Days 1-30', details: 'Identify AI Overview candidate topics, audit current pages, and fix schema/content mismatches.' },
      { phase: 'Days 31-60', details: 'Expand pages with concise answers, comparison coverage, evidence language, and stronger internal links.' },
      { phase: 'Days 61-90', details: 'Test AI summaries, improve weak sections, and add supporting blog or industry content where the answer layer needs more context.' },
    ],
    decisionFaqs: [
      { question: 'Can RankUp guarantee Google AI Overview inclusion?', answer: 'No. Google controls the result. RankUp improves crawlability, relevance, answer quality, and trust signals that can support eligibility.' },
      { question: 'Does this replace technical SEO?', answer: 'No. Technical SEO is part of the work because answer-led visibility still depends on crawlable, indexable, canonical pages.' },
    ],
    comparisonQuestions: [
      { question: 'AI Overview optimization vs featured snippet optimization?', answer: 'Both reward concise answers and trusted structure, but AI Overviews often synthesize multiple sources and need stronger entity clarity, comparison context, and topical support.' },
      { question: 'Content rewrite vs schema fix?', answer: 'Schema helps machines interpret the page, but it should reflect visible content. When the page is thin, the content needs improvement before schema can carry much weight.' },
    ],
  },
  'chatgpt-visibility-audit': {
    directAnswer:
      'A ChatGPT visibility audit checks whether a business is easy for answer engines to identify, summarize, compare, mention, and cite during AI-assisted research.',
    whatThisIs: [
      'The audit looks at the owned website first, then the wider entity footprint that may influence how answer engines understand the brand and category.',
      'It focuses on practical visibility gaps: unclear positioning, missing comparison content, weak proof, thin service pages, and source pages that do not answer buyer questions directly.',
    ],
    whoFor: [
      'Brands that suspect buyers are asking ChatGPT or Perplexity for recommendations, alternatives, or shortlists.',
      'Businesses that already have search traffic but are unsure whether AI systems can explain why they belong in the conversation.',
    ],
    problemsSolved: [
      'The brand is not clearly tied to a category or use case.',
      'The site lacks pages that answer comparison and evaluation questions.',
      'Important claims are unsupported or buried in vague marketing copy.',
      'Answer engines can mention competitors more easily because their pages are clearer.',
    ],
    process: [
      'Review category positioning, service clarity, and internal page hierarchy.',
      'Test how the business is summarized across answer-led research prompts.',
      'Identify owned pages that should become more citeable sources.',
      'Turn findings into a 90-day action plan for content, structure, schema, and trust.',
    ],
    deliverables: [
      'ChatGPT and answer-engine visibility diagnosis.',
      'Mention, citation, and comparison gap notes.',
      'Priority content and schema fixes.',
      'Recommended internal links and supporting page opportunities.',
    ],
    roadmap: [
      { phase: 'Days 1-30', details: 'Run entity, page, and prompt-based visibility checks and document where the brand is unclear or absent.' },
      { phase: 'Days 31-60', details: 'Improve the pages that should anchor mentions, citations, comparisons, and buyer questions.' },
      { phase: 'Days 61-90', details: 'Add supporting research, FAQs, and internal links, then retest summaries and citation behavior.' },
    ],
    decisionFaqs: [
      { question: 'Is this only for ChatGPT Search?', answer: 'No. ChatGPT is the named audit surface, but the same clarity and trust work helps Gemini, Perplexity, Bing Copilot, and Google AI Overviews.' },
      { question: 'What if the brand is too new to be mentioned?', answer: 'The audit can still identify what owned pages and entity signals need to exist before answer engines have enough reliable material to work with.' },
    ],
    comparisonQuestions: [
      { question: 'Mention visibility vs citation visibility?', answer: 'Mentions mean the brand appears in an answer or comparison. Citations mean the model treats the site as a source. A healthy AEO strategy works on both.' },
      { question: 'ChatGPT audit vs SEO audit?', answer: 'A ChatGPT audit checks summarization, comparison, and citation readiness. A SEO audit checks rankings, crawlability, and search demand. RankUp connects both because they influence each other.' },
    ],
  },
  'seo-retainer-for-businesses': {
    directAnswer:
      'The 90-day SEO retainer is a focused implementation program for businesses that need technical SEO, AEO content improvements, schema cleanup, and priority-page execution in a clear sequence.',
    whatThisIs: [
      'This retainer turns the audit into implementation. The first month establishes the baseline and priority map, the second month rebuilds the highest-impact pages, and the third month expands the system so the improvements can compound.',
      'It is built for execution, not report theater. Each action should connect to crawlability, page quality, trust, search intent, or answer-engine readiness.',
    ],
    whoFor: [
      'Businesses with a website, existing offers, and a clear need for more qualified discovery from Google and AI-assisted search.',
      'Teams that need a senior SEO/AEO implementation partner for a concentrated sprint rather than vague monthly consulting.',
    ],
    problemsSolved: [
      'The audit identifies issues but nobody fixes them.',
      'Service pages need rewriting, internal links, schema, and FAQ depth.',
      'Technical cleanup and content improvements are happening in the wrong order.',
      'The business needs measurable progress without a long-term lock-in.',
    ],
    process: [
      'Start with a visibility baseline and a prioritized backlog.',
      'Fix technical and metadata issues that suppress crawlability or clarity.',
      'Expand priority pages with useful content, direct answers, deliverables, and FAQs.',
      'Review performance signals and adjust the roadmap based on what is moving.',
    ],
    deliverables: [
      '90-day execution plan.',
      'Priority metadata, schema, and page structure updates.',
      'Expanded service, industry, FAQ, and internal linking recommendations.',
      'Monthly summary of completed work, observed movement, and next actions.',
    ],
    roadmap: [
      { phase: 'Days 1-30', details: 'Baseline crawl/index health, map commercial pages, fix obvious technical gaps, and approve the implementation queue.' },
      { phase: 'Days 31-60', details: 'Rewrite and expand the highest-impact pages with answer blocks, deliverables, roadmaps, FAQs, schema alignment, and links.' },
      { phase: 'Days 61-90', details: 'Strengthen supporting pages, tune internal links, review ranking and AI-summary behavior, and define the next sprint.' },
    ],
    decisionFaqs: [
      { question: 'Is there a long-term contract?', answer: 'The visible page states the 90-day retainer starts at $7,500/month with no long-term contract. Exact scope should be quoted after the audit.' },
      { question: 'What does success look like in 90 days?', answer: 'Success should look like a cleaner visibility system: stronger pages, better crawl signals, clearer schema, richer internal links, and early search or answer-engine movement. Rankings are not guaranteed.' },
    ],
    comparisonQuestions: [
      { question: 'Monthly SEO retainer vs 90-day sprint?', answer: 'A broad monthly retainer can drift. A 90-day sprint forces prioritization around the pages, technical fixes, and content improvements most likely to matter first.' },
      { question: 'Consulting vs implementation?', answer: 'Consulting explains what to do. Implementation changes the site. This retainer is designed around getting the important work shipped.' },
    ],
  },
  'saas-seo-aeo': {
    directAnswer:
      'SaaS SEO and AEO helps software companies clarify category positioning, comparison coverage, use-case pages, and trust signals so buyers and answer engines can understand the product faster.',
    whatThisIs: ['This industry program improves SaaS pages that influence demos, trials, comparisons, and category discovery. It connects homepage language, feature pages, use cases, alternatives, FAQs, and schema into a clearer search surface.'],
    whoFor: ['B2B SaaS teams, founder-led software companies, and product-led businesses whose sites look polished but do not rank or explain the category well enough.'],
    problemsSolved: ['Category language is buried under abstract positioning.', 'Alternative and comparison pages are missing or too thin.', 'Feature pages describe functionality without connecting it to buyer problems.', 'AI systems struggle to summarize who the product is for.'],
    process: ['Map product categories, use cases, alternatives, and decision-stage queries.', 'Prioritize pages that affect demos, trials, and comparisons.', 'Add concise answers, proof, FAQs, and internal links between services, research, and audit flow.'],
    deliverables: ['SaaS page architecture recommendations.', 'Use-case and comparison content plan.', 'AEO FAQ and answer block set.', 'Internal links to relevant SEO/AEO services.'],
    searchBehavior: ['SaaS buyers search by category, pain point, integration, alternative, pricing concern, and comparison.', 'Answer engines compress shortlists, which makes clear positioning and comparison pages more important.'],
    trustSignals: ['Clear product category, transparent use cases, real integrations or capabilities, security/compliance details when available, and specific buyer outcomes that are visible on the page.'],
    aiVisibilityConcerns: ['If the product page sounds generic, answer engines may summarize the category but omit the company.', 'Thin comparison pages make competitors easier to recommend.'],
    decisionFaqs: [{ question: 'Do SaaS companies need AEO if they already publish blog content?', answer: 'Yes. Blog volume does not fix weak category, use-case, feature, and comparison pages. AEO improves the pages answer engines use to summarize shortlists.' }],
    comparisonQuestions: [{ question: 'SaaS SEO vs SaaS AEO?', answer: 'SaaS SEO improves rankings and organic demand capture. SaaS AEO improves how the product is summarized, compared, and cited inside AI-assisted research.' }],
    primaryServiceSlug: 'seo-aeo-agency',
  },
  'home-services-seo-aeo': {
    directAnswer:
      'Home services SEO and AEO improves local service pages, service-area clarity, trust cues, and direct answers so homeowners can find and choose the business faster.',
    whatThisIs: ['This industry work focuses on high-intent local pages for HVAC, plumbing, roofing, landscaping, electrical, pest control, cleaning, and similar service categories.'],
    whoFor: ['Local and regional home service businesses that need clearer service pages, stronger local relevance, and a website that supports trust before the call.'],
    problemsSolved: ['Service pages sound interchangeable with competitors.', 'Locations and service areas are unclear.', 'FAQs do not answer urgency, cost, timing, or trust questions.', 'The site lacks proof that can be verified on the page.'],
    process: ['Audit service and location structure.', 'Improve pages around concrete services, service areas, emergency intent, and buyer questions.', 'Connect service pages to audit flow and supporting service categories.'],
    deliverables: ['Local service-page recommendations.', 'Trust and proof gap notes.', 'Decision-stage FAQ set.', 'Internal linking plan for service areas and core offers.'],
    searchBehavior: ['Homeowners search with urgency, location, price sensitivity, and trust concerns.', 'They often compare providers quickly and need visible proof before calling.'],
    trustSignals: ['Licensing, service areas, response expectations, before/after examples if real, warranties if already offered, and clear contact paths.'],
    aiVisibilityConcerns: ['AI summaries may favor clearer local competitors if the site does not explicitly connect service, city, and trust details.', 'Generic copy gives answer engines little to cite.'],
    decisionFaqs: [{ question: 'Can this improve map rankings?', answer: 'Website improvements can support the broader local visibility system, but map rankings also depend on Google Business Profile quality, proximity, reviews, and local signals outside the site.' }],
    comparisonQuestions: [{ question: 'Local SEO vs home services AEO?', answer: 'Local SEO improves visibility in local search. AEO makes the service, location, proof, and answers easier for AI systems to summarize and recommend.' }],
    primaryServiceSlug: 'google-ai-overviews-optimization',
  },
  'law-firm-seo-aeo': {
    directAnswer:
      'Law firm SEO and AEO strengthens practice-area clarity, local relevance, trust language, and answer-ready content so potential clients can evaluate the firm more confidently.',
    whatThisIs: ['This industry page is for firms that need clearer practice-area pages, stronger local intent alignment, and content that answers cautious legal buyers without making improper promises.'],
    whoFor: ['Small and mid-sized law firms, boutique practices, and local firms whose websites need stronger discoverability and trust before the first consultation.'],
    problemsSolved: ['Practice area pages are generic.', 'Local relevance is weak or inconsistent.', 'Trust content is thin, vague, or disconnected from visible credentials.', 'AI systems cannot confidently describe the firm by practice area and location.'],
    process: ['Audit practice-area and location pages.', 'Improve plain-English answers, service boundaries, internal links, and structured data alignment.', 'Add decision-stage FAQs without guaranteeing legal outcomes.'],
    deliverables: ['Practice-area SEO/AEO audit.', 'Local relevance and internal-link recommendations.', 'Trust and credential content checklist.', 'FAQ and comparison question set.'],
    searchBehavior: ['Legal buyers search with urgency, risk, location, and practice-area specificity.', 'They often need plain answers before they are ready to contact a firm.'],
    trustSignals: ['Visible practice areas, attorney credentials if available, jurisdictions served, clear consultation paths, and careful language that avoids guarantees.'],
    aiVisibilityConcerns: ['Legal pages need extra clarity because vague or unsupported claims are risky for users and harder for answer engines to trust.', 'Thin boilerplate makes firms look interchangeable.'],
    decisionFaqs: [{ question: 'Will RankUp write legal advice?', answer: 'No. Page content should explain services and process in plain language, but legal advice and jurisdiction-specific claims must be reviewed by the firm.' }],
    comparisonQuestions: [{ question: 'Law firm SEO vs legal content marketing?', answer: 'SEO improves discoverability and technical/page quality. Content marketing may support awareness. For law firms, the priority is often high-intent practice pages first.' }],
    primaryServiceSlug: 'chatgpt-visibility-audit',
  },
  'b2b-services-seo-aeo': {
    directAnswer:
      'B2B services SEO and AEO clarifies offers, buyer problems, proof, and decision-stage content so service firms stop sounding interchangeable in search and AI summaries.',
    whatThisIs: ['This industry program improves the pages that explain what the firm does, who it helps, how it works, and why a buyer should trust it.'],
    whoFor: ['Consultancies, agencies, fractional teams, professional services, and B2B firms that sell expertise through their website.'],
    problemsSolved: ['Service pages are polished but vague.', 'Offers are not mapped to buyer problems.', 'Proof is missing or too abstract.', 'AI answer engines summarize the category but not the firm.'],
    process: ['Clarify service taxonomy and buyer intent.', 'Rewrite pages with direct answers, deliverables, process, and internal links.', 'Add FAQs and comparison coverage for evaluation-stage buyers.'],
    deliverables: ['B2B service-page audit.', 'Offer and internal-link map.', 'Decision-stage FAQ set.', 'Service-to-industry content recommendations.'],
    searchBehavior: ['B2B buyers search by problem, service category, specialization, industry fit, and comparison.', 'They need enough specificity to shortlist the firm before a call.'],
    trustSignals: ['Clear services, concrete deliverables, team expertise when available, methodology, relevant industries, and transparent process language.'],
    aiVisibilityConcerns: ['Generic expertise language is hard to cite.', 'If the page does not state the offer directly, AI systems may classify the firm incorrectly.'],
    decisionFaqs: [{ question: 'Does this work without public case studies?', answer: 'Yes, but the site still needs real proof such as process clarity, deliverables, expertise, methodology, examples that can be shared, or other verifiable trust signals.' }],
    comparisonQuestions: [{ question: 'B2B SEO vs lead generation?', answer: 'SEO builds qualified discovery through search surfaces. Lead generation often starts outbound or paid. Strong SEO/AEO makes inbound evaluation easier and can support both.' }],
    primaryServiceSlug: 'seo-retainer-for-businesses',
  },
};

export function getLandingPageDepth(slug: string) {
  return depthBySlug[slug];
}
