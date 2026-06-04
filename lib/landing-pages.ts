export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingPage {
  slug: string;
  category: 'service' | 'industry';
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
