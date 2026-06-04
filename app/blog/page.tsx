import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllBlogPosts } from '@/lib/blog';
import { buildPageMetadata, absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'AEO Research, SEO Strategy, and AI Search Notes',
  description:
    'Read RankUp research notes on Google visibility, answer engine optimization, AI search behavior, and the technical work businesses need to be found.',
  path: '/blog',
  keywords: [
    'AEO blog',
    'SEO research',
    'AI search blog',
    'Google visibility blog',
    'answer engine optimization articles',
  ],
});

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-3xl">
          <p className="mb-5 text-xs font-mono uppercase tracking-[0.28em] text-green-400">
            Research Notes
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl font-space">
            SEO and AEO research for businesses that need to get found.
          </h1>
          <p className="text-lg leading-relaxed text-gray-400">
            This is where we write down what is changing in Google, ChatGPT, AI search, and
            business visibility. No trend cosplay. No padded fluff. Just the shifts that actually
            matter if you want more qualified discovery.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8"
            >
              <p className="mb-4 text-xs font-mono uppercase tracking-[0.22em] text-zinc-500">
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                | {post.readingTime}
              </p>
              <h2 className="mb-4 text-2xl font-bold text-white">{post.title}</h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-400">{post.excerpt}</p>
              <ul className="mb-8 space-y-3 text-sm text-gray-300">
                {post.takeaways.slice(0, 2).map((takeaway) => (
                  <li key={takeaway} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-green-300"
              >
                Read article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-20 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-10">
          <h2 className="mb-4 text-3xl font-bold font-space">Want the custom version for your site?</h2>
          <p className="max-w-2xl text-gray-400">
            The public articles explain the market shift. The audit shows where your own website is
            leaking discoverability right now.
          </p>
          <Link
            href="/audit-flow"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105"
          >
            Run the audit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'RankUp Research Notes',
            description:
              'Research notes on Google visibility, answer engine optimization, AI search, and SEO strategy.',
            url: absoluteUrl('/blog'),
          }),
        }}
      />
    </main>
  );
}
