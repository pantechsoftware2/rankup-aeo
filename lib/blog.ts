export interface BlogSource {
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
}

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: string;
  keywords: string[];
  takeaways: string[];
  sections: BlogSection[];
  sources: BlogSource[];
}

const posts: BlogPost[] = [
  {
    slug: 'how-to-make-content-citeable-in-ai-search',
    title: 'How to Make Content Citeable in AI Search',
    description:
      'A practical guide to citeable AI search content: direct answers, proof, structure, links, and details that help answer engines trust your site.',
    excerpt:
      'Citeable content answers the query fast, names the entity clearly, supports claims with proof, and gives answer engines a clean page they can trust.',
    publishedAt: '2026-06-30T09:00:00.000Z',
    updatedAt: '2026-06-30T09:00:00.000Z',
    readingTime: '7 min read',
    keywords: [
      'citeable content for AI search',
      'AI search citations',
      'answer engine optimization',
      'AEO content',
      'AI visibility',
      'Google AI Overviews optimization',
    ],
    takeaways: [
      'Citeable content gives a direct answer in the first few sentences instead of making the reader hunt for the point.',
      'Answer engines need clear entities, supported claims, visible proof, and page structure that matches the query.',
      'Internal links help connect the article, service pages, industry pages, and audit flow into one understandable visibility system.',
      'The goal is not to write for machines. The goal is to make useful human content easier for machines to verify and summarize.',
    ],
    sections: [
      {
        heading: 'Start with the answer',
        paragraphs: [
          'Citeable content for AI search is content that an answer engine can safely use as a source because it answers the query directly, explains the topic clearly, and supports important claims with visible evidence. If the page opens with vague positioning or a long warmup, it is harder for both people and machines to understand why the page deserves to be cited.',
          'The first 100 words should say what the page is about, who it is for, and what the reader should do next. That does not mean writing robotic copy. It means respecting the query enough to answer it before adding nuance.',
        ],
      },
      {
        heading: 'Make the entity unmistakable',
        paragraphs: [
          'AI search systems need to understand what the business, product, service, location, and category are. If your page swaps between vague labels, clever taglines, and inconsistent service names, the system has to guess.',
          'Use the same core language across titles, headings, body copy, schema, navigation, and internal links. A page about Google AI Overviews optimization should say that plainly, then explain the related terms naturally instead of hiding behind buzzwords.',
        ],
        bullets: [
          'Name the service or topic in the title and H1.',
          'Use a concise definition near the top of the page.',
          'Connect the topic to relevant services, industries, and proof pages.',
          'Avoid clever phrasing when clear category language is needed.',
        ],
      },
      {
        heading: 'Support claims with proof',
        paragraphs: [
          'Answer engines are more likely to trust content that includes concrete details. That proof can be original research, process detail, named deliverables, client examples, expert review, citations, dates, or clearly stated limitations.',
          'Generic claims like "we help you grow" do almost nothing. A citeable page explains what changes, what gets delivered, and what cannot be guaranteed. The restraint matters because overclaimed pages feel less safe to cite.',
        ],
      },
      {
        heading: 'Write sections that map to real questions',
        paragraphs: [
          'Good AEO content is not a pile of keywords. It is a clean answer path. Break the page into sections that match how a buyer or researcher thinks: what it is, who it is for, how it works, what proof matters, what the tradeoffs are, and what to do next.',
          'This structure helps readers scan the page and helps answer engines extract the right part of the page for a specific query. It also reduces the risk that a model summarizes you from a weaker third-party source because your own page was too thin.',
        ],
        bullets: [
          'Definition or direct answer',
          'Use cases and audience',
          'Process or methodology',
          'FAQs and comparison questions',
          'Related service and industry links',
        ],
      },
      {
        heading: 'Use internal links as evidence trails',
        paragraphs: [
          'Internal links are not just navigation. They tell crawlers and answer engines how the site thinks about a topic. A blog post about AI search citations should link to the related service page, the audit flow, and supporting research. Service pages should link back to the guide when the guide explains the work in more depth.',
          'Use anchor text that describes the destination. "Learn how to make content citeable in AI search" is more helpful than "click here" because the link itself carries context.',
        ],
      },
      {
        heading: 'Keep the page useful after the first answer',
        paragraphs: [
          'A direct answer earns attention. Depth earns trust. After the opening answer, add examples, limitations, next steps, and related pages that help a real buyer make a decision.',
          'The strongest pages do both jobs: they give AI systems a clean summary and give humans enough substance to believe the business knows what it is doing.',
        ],
      },
    ],
    sources: [
      {
        title: 'AI Overviews expand to over 200 countries and territories, more than 40 languages',
        publisher: 'Google',
        url: 'https://blog.google/products/search/ai-overview-expansion-may-2025-update/',
        publishedAt: '2025-05-20',
      },
      {
        title: 'Introducing ChatGPT search',
        publisher: 'OpenAI',
        url: 'https://openai.com/index/introducing-chatgpt-search/',
        publishedAt: '2024-10-31',
      },
      {
        title: 'Build and Submit a Sitemap',
        publisher: 'Google Search Central',
        url: 'https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap',
        publishedAt: '2025-12-10',
      },
    ],
  },
  {
    slug: 'ai-search-is-already-the-front-door',
    title: 'AI Search Is Not Coming. It Is Already the Front Door.',
    description:
      'Why businesses need to stop treating Google and answer engines like separate channels, and what the latest research says about AI discovery right now.',
    excerpt:
      'The buyer journey already shifted. Google is shipping AI Overviews globally, ChatGPT search is mainstream, and AI-originated traffic is climbing fast.',
    publishedAt: '2026-03-24T09:00:00.000Z',
    updatedAt: '2026-03-24T09:00:00.000Z',
    readingTime: '6 min read',
    keywords: [
      'AEO',
      'AI search',
      'Google AI Overviews',
      'ChatGPT search',
      'SEO strategy',
      'answer engine optimization',
    ],
    takeaways: [
      'Google AI Overviews now reach more than 200 countries and 40 languages.',
      'Google says query types that show AI Overviews are seeing more than 10% usage growth in major markets like the U.S. and India.',
      'ChatGPT search became broadly available in February 2025, which means more buyers can discover brands without starting in classic Google blue links.',
      'Adobe found AI-driven traffic rising sharply across retail, travel, and banking, which signals that AI is already influencing the research phase of buying decisions.',
    ],
    sections: [
      {
        heading: 'The old mental model is dead',
        paragraphs: [
          'A lot of businesses still think this is a niche future channel. They hear AI, nod politely, and go back to treating SEO like a separate department and ChatGPT like a toy. That is the wrong read.',
          'The front door is already changing. People still use Google. They also ask Google for AI Overviews, ask ChatGPT for a shortlist, and ask Perplexity or Gemini to compress the research phase. The point is not whether one tool fully replaces the other. The point is that discovery is already getting routed through answer layers before the click.',
        ],
      },
      {
        heading: 'Google itself is telling you the shift is real',
        paragraphs: [
          'In May 2025, Google said AI Overviews had expanded to more than 200 countries and territories and more than 40 languages. That is not a lab test. That is distribution.',
          'Google also said that in markets like the United States and India, AI Overviews are driving more than a 10% increase in usage for the kinds of queries that trigger them. My inference from that: the surface area is getting bigger, not smaller, and users are learning new behavior fast.',
        ],
      },
      {
        heading: 'OpenAI turned search into a mainstream habit too',
        paragraphs: [
          'OpenAI rolled out ChatGPT search widely enough that by February 5, 2025 it was available to everyone in regions where ChatGPT is available. That matters because it means people no longer need to be power users or early adopters to research through a chat interface.',
          'Once search becomes a normal thing inside the product millions already use, every business with a website now has a second visibility problem to solve: not just ranking, but being citeable.',
        ],
      },
      {
        heading: 'The traffic is still small. The growth is not.',
        paragraphs: [
          'Adobe reported in March 2025 that traffic from generative AI sources to U.S. retail sites was up 1,200% compared with July 2024, and doubling every two months since September 2024. Travel and banking showed similar jumps.',
          'That does not mean AI traffic has already replaced search. It means the slope is steep, and the companies that learn how to win the research layer early will have a cleaner runway than the ones waiting for perfect certainty.',
        ],
      },
      {
        heading: 'What businesses should do with this information',
        paragraphs: [
          'Do not split the work into separate religion wars like SEO versus AEO. Fix the business visibility system as one stack. Clarify what you do. Tighten the pages. Add proof. Add structure. Give Google and answer engines something solid to trust.',
          'If your site is vague, thin, generic, or authority-light, you do not just lose rankings. You also disappear from the moments when buyers ask machines to help them choose.',
        ],
      },
    ],
    sources: [
      {
        title: 'AI Overviews expand to over 200 countries and territories, more than 40 languages',
        publisher: 'Google',
        url: 'https://blog.google/products/search/ai-overview-expansion-may-2025-update/',
        publishedAt: '2025-05-20',
      },
      {
        title: 'Introducing ChatGPT search',
        publisher: 'OpenAI',
        url: 'https://openai.com/index/introducing-chatgpt-search/',
        publishedAt: '2024-10-31',
      },
      {
        title: 'Traffic to U.S. Retail Websites from Generative AI Sources Jumps 1,200 Percent',
        publisher: 'Adobe',
        url: 'https://blog.adobe.com/en/publish/2025/03/17/adobe-analytics-traffic-to-us-retail-websites-from-generative-ai-sources-jumps-1200-percent',
        publishedAt: '2025-03-17',
      },
    ],
  },
  {
    slug: 'why-seo-and-aeo-are-now-the-same-fight',
    title: 'Why SEO and AEO Are Now the Same Fight',
    description:
      'A practical argument for treating ranking, citations, authority, and trust as one visibility system instead of separate tactics.',
    excerpt:
      'If your SEO is weak, your AEO is weak too. The latest platform behavior makes that overlap hard to ignore.',
    publishedAt: '2026-03-24T11:00:00.000Z',
    updatedAt: '2026-03-24T11:00:00.000Z',
    readingTime: '7 min read',
    keywords: [
      'SEO and AEO',
      'answer engine optimization',
      'ChatGPT citations',
      'Google AI Overviews',
      'SEO strategy',
    ],
    takeaways: [
      'Answer engines still rely on the web, which means crawlability, clarity, trust, and topical focus still matter.',
      'Google says AI Overviews feature prominent web links, and OpenAI says ChatGPT search includes source links.',
      'You do not win AEO by skipping SEO. You win by tightening the same foundations and then making them more citeable.',
      'Most sites do not need a brand new discipline. They need a better visibility stack.',
    ],
    sections: [
      {
        heading: 'The fake split',
        paragraphs: [
          'A lot of marketing language treats SEO and AEO like two separate empires. One team handles rankings. Another team handles AI. That framing sounds sophisticated and wastes a lot of time.',
          'The reality is less glamorous. Both systems still depend on understanding what your business does, whether your pages are clear, whether your claims are supported, and whether your site looks trustworthy enough to lean on.',
        ],
      },
      {
        heading: 'The web still powers the answer layer',
        paragraphs: [
          'Google says AI Overviews include prominent links to relevant sites, and OpenAI says ChatGPT search responses include links to sources. That means the answer layer still points back to websites, not away from them.',
          'So the question is not whether websites matter. The question is whether your website is strong enough to be selected when the system compresses the research phase.',
        ],
      },
      {
        heading: 'What carries over from classic SEO',
        paragraphs: [
          'Search intent alignment still matters. If your page does not clearly answer the category or problem, you are harder to rank and harder to cite.',
          'Technical cleanliness still matters. If the site is messy, thin, confusing, or missing structure, you are less likely to be understood correctly.',
        ],
        bullets: [
          'Clear service pages',
          'Consistent entity naming',
          'Schema and crawlable structure',
          'Proof, comparisons, FAQs, and buyer-language content',
        ],
      },
      {
        heading: 'What the answer layer adds',
        paragraphs: [
          'AEO raises the bar on explicitness. It is not enough to sort of imply what you do. The page needs to say it cleanly. It helps if the site answers comparison questions, explains tradeoffs, and backs up claims with something firmer than generic copy.',
          'This is why the work feels like an extension of SEO, not a replacement. You are still earning understanding and trust. You are just doing it in a world where the machine may summarize you before the human ever arrives.',
        ],
      },
      {
        heading: 'The practical way to work',
        paragraphs: [
          'Treat SEO as the foundation and AEO as the pressure test. Build pages that can rank. Then build them well enough that an answer engine can safely cite them without squinting.',
          'That is the work we care about: not vanity traffic, but discoverability that survives the way people actually research now.',
        ],
      },
    ],
    sources: [
      {
        title: 'AI Overviews expand to over 200 countries and territories, more than 40 languages',
        publisher: 'Google',
        url: 'https://blog.google/products/search/ai-overview-expansion-may-2025-update/',
        publishedAt: '2025-05-20',
      },
      {
        title: 'Introducing ChatGPT search',
        publisher: 'OpenAI',
        url: 'https://openai.com/index/introducing-chatgpt-search/',
        publishedAt: '2024-10-31',
      },
      {
        title: 'Build and Submit a Sitemap',
        publisher: 'Google Search Central',
        url: 'https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap',
        publishedAt: '2025-12-10',
      },
    ],
  },
  {
    slug: 'mentions-are-not-the-win-citations-are',
    title: 'Mentions Are Not the Win. Citations Are.',
    description:
      'What AI visibility research says about the gap between being talked about and being trusted, and why most brands optimize only half the problem.',
    excerpt:
      'If the model mentions you in comparisons but never trusts your site as a source, you are still leaving money on the table.',
    publishedAt: '2026-03-24T13:00:00.000Z',
    updatedAt: '2026-03-24T13:00:00.000Z',
    readingTime: '6 min read',
    keywords: [
      'AI visibility',
      'citations',
      'brand mentions',
      'Semrush AI visibility study',
      'AEO strategy',
    ],
    takeaways: [
      'Semrush found that only 6% to 27% of the most-mentioned brands also appear as top cited sources, depending on industry and platform.',
      'That means mention visibility and source authority are related but not identical jobs.',
      'Brands need content that wins comparisons and content that earns trust as a factual source.',
      'The easiest way to lose is to sound famous without looking useful.',
    ],
    sections: [
      {
        heading: 'A lot of brands optimize for applause',
        paragraphs: [
          'People want to be talked about. That instinct is understandable. Brand mentions feel like momentum. But answer engines do not only need a name to mention. They also need somewhere reliable to anchor the answer.',
          'If the system brings you up in a comparison and then cites someone else for the facts, you have only won half the battle.',
        ],
      },
      {
        heading: 'The research gap is real',
        paragraphs: [
          'Semrush reported that only 6% to 27% of the most-mentioned brands also show up as top cited sources, depending on the platform and category. That is a brutal number because it shows how many brands are visible but not trusted.',
          'Their study also framed the opportunity in two separate tracks: becoming the brand the model talks about in comparisons, and becoming the source the model trusts when it needs evidence.',
        ],
      },
      {
        heading: 'What creates mentions',
        paragraphs: [
          'Mentions often come from category familiarity, reviews, Reddit conversations, lists, and comparison language. This is where market conversation lives. It is messy, social, and often outside your site.',
          'If nobody talks about your business anywhere, you have a demand and distribution problem. But that is not the only layer.',
        ],
      },
      {
        heading: 'What creates citations',
        paragraphs: [
          'Citations come from cleaner structure, stronger entity clarity, original information, and pages that answer the thing directly. This is where your owned site still matters a lot.',
          'When the model needs pricing context, product details, process clarity, or a factual answer, it needs a page that feels safe to cite. Generic homepage fluff does not cut it.',
        ],
        bullets: [
          'Clear service and feature pages',
          'Comparison pages that name the category and alternatives',
          'FAQs that answer decision-stage questions',
          'Case studies, proof blocks, and original details',
        ],
      },
      {
        heading: 'What to do now',
        paragraphs: [
          'Do not chase surface-level buzz and call it a strategy. Build both sides. Make the brand easier to talk about, then make the website easier to trust.',
          'That is the work that compounds. It helps rankings. It helps answer engines. And it makes a sales conversation easier because the business finally sounds like the obvious choice instead of a vague maybe.',
        ],
      },
    ],
    sources: [
      {
        title: 'How AI Search Really Works: Findings from Our AI Visibility Study',
        publisher: 'Semrush',
        url: 'https://www.semrush.com/blog/ai-search-visibility-study-findings/',
        publishedAt: '2025-09-18',
      },
      {
        title: 'Introducing ChatGPT search',
        publisher: 'OpenAI',
        url: 'https://openai.com/index/introducing-chatgpt-search/',
        publishedAt: '2024-10-31',
      },
      {
        title: 'AI Overviews expand to over 200 countries and territories, more than 40 languages',
        publisher: 'Google',
        url: 'https://blog.google/products/search/ai-overview-expansion-may-2025-update/',
        publishedAt: '2025-05-20',
      },
    ],
  },
];

export function getAllBlogPosts(): BlogPost[] {
  return [...posts].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return posts.find((post) => post.slug === slug);
}
