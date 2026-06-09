import { getAllBlogPosts } from '@/lib/blog';
import { absoluteUrl } from '@/lib/seo';

export async function GET() {
  const posts = getAllBlogPosts();
  const lines = [
    '# RankUp AEO',
    '',
    '> RankUp helps businesses with websites improve Google visibility and AI answer visibility through audits, deep reports, and 90-day implementation retainers.',
    '',
    '## Canonical Pages',
    `- Home: ${absoluteUrl('/')}`,
    `- Audit Flow: ${absoluteUrl('/audit-flow')}`,
    `- About: ${absoluteUrl('/about')}`,
    `- Methodology: ${absoluteUrl('/methodology')}`,
    `- Contact: ${absoluteUrl('/contact')}`,
    `- Research Blog: ${absoluteUrl('/blog')}`,
    '',
    '## Key Topics',
    '- SEO',
    '- AEO',
    '- Google visibility',
    '- AI search',
    '- ChatGPT search',
    '- Google AI Overviews',
    '',
    '## Research Articles',
    ...posts.map((post) => `- ${post.title}: ${absoluteUrl(`/blog/${post.slug}`)}`),
    '',
    `## Full Context`,
    `- ${absoluteUrl('/llms-full.txt')}`,
  ].join('\n');

  return new Response(lines, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
