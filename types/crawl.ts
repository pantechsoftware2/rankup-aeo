export interface CrawlPayload {
  url: string;
  fetchedAt: string;
  // Meta
  meta: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogSiteName: string;
    ogImage: string;
    applicationName: string;
    canonical: string;
    robots: string;
    viewport: string;
    charset: string;
  };
  // Headings
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h1Count: number;
    hasMultipleH1: boolean;
  };
  // Content signals
  content: {
    visibleTextLength: number;
    isClientSideRendered: boolean;
    bodyText: string;  // first 30000 chars of visible text
    wordCount: number;
  };
  // Technical SEO
  technical: {
    hasSchemaMarkup: boolean;
    schemaTypes: string[];  // e.g., ["LocalBusiness", "FAQ", "Organization"]
    hasOpenGraph: boolean;
    hasTwitterCards: boolean;
    hasFavicon: boolean;
    hasRobotsTxt: boolean | null;  // null if couldn't check
    hasSitemap: boolean | null;
    internalLinkCount: number;
    externalLinkCount: number;
    imageCount: number;
    imagesWithAlt: number;
    imagesWithoutAlt: number;
  };
  // Structure issues
  issues: {
    missingMetaDescription: boolean;
    missingH1: boolean;
    multipleH1s: boolean;
    missingViewport: boolean;
    missingCanonical: boolean;
    missingSchemaMarkup: boolean;
    lowContentLength: boolean;  // under 300 words
    noAltTextOnImages: boolean;  // more than 50% of images missing alt
  };
  // Raw for LLM consumption
  rawHtml: string;  // first 50000 chars for context
}
