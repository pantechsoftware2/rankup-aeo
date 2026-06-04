import { getAllBlogPosts } from '@/lib/blog';
import { absoluteUrl } from '@/lib/seo';

export async function GET() {
  const posts = getAllBlogPosts();
  const lines = [
    '# RankUp AEO Full Context',
    '',
    'RankUp helps businesses that already have websites improve discoverability across Google and AI answer engines.',
    'The company positions SEO and AEO as one visibility system rather than two separate channels.',
    '',
    '## Primary Offer',
    '- Free teaser audit to identify visibility gaps',
    '- Deeper consultant-style report by request',
    '- 90-day retainer focused on technical cleanup, authority, messaging, and citeable content',
    '',
    '## Audience',
    '- Businesses with websites',
    '- Companies that want more Google visibility',
    '- Companies that need clearer visibility inside ChatGPT, Gemini, Perplexity, and Google AI Overviews',
    '',
    '## Important URLs',
    `- Home: ${absoluteUrl('/')}`,
    `- Audit Flow: ${absoluteUrl('/audit-flow')}`,
    `- Blog: ${absoluteUrl('/blog')}`,
    `- RSS Feed: ${absoluteUrl('/feed.xml')}`,
    `- Sitemap: ${absoluteUrl('/sitemap.xml')}`,
    '',
    '## Published Research',
    ...posts.flatMap((post) => [
      `### ${post.title}`,
      `URL: ${absoluteUrl(`/blog/${post.slug}`)}`,
      `Summary: ${post.description}`,
      'Key takeaways:',
      ...post.takeaways.map((takeaway) => `- ${takeaway}`),
      '',
    ]),
  ].join('\n');

  return new Response(lines, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
