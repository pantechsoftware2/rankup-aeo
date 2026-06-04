import { getAllBlogPosts } from '@/lib/blog';
import { absoluteUrl } from '@/lib/seo';

export async function GET() {
  const posts = getAllBlogPosts();
  const siteUrl = absoluteUrl('/');
  const items = posts
    .map(
      (post) => `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${absoluteUrl(`/blog/${post.slug}`)}</link>
          <guid>${absoluteUrl(`/blog/${post.slug}`)}</guid>
          <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
          <description><![CDATA[${post.description}]]></description>
        </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>RankUp Research Notes</title>
        <link>${siteUrl}</link>
        <description>Research notes on SEO, AEO, Google visibility, and AI search.</description>
        ${items}
      </channel>
    </rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
