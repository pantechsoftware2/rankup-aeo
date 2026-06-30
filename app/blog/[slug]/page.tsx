import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getAllBlogPosts, getBlogPost } from '@/lib/blog';
import { getLandingPages } from '@/lib/landing-pages';
import { absoluteUrl, getArticleJsonLd, getBreadcrumbJsonLd, getDefaultOgImage } from '@/lib/seo';

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getBlogPost(params.slug);

  if (!post) {
    return {};
  }

  const url = absoluteUrl(`/blog/${post.slug}`);
  const ogImage = getDefaultOgImage();

  return {
    title: {
      absolute: post.title,
    },
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url,
      siteName: 'RankUp AEO',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage.url],
    },
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const relatedServices = getLandingPages('service').slice(0, 3);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Research', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ]);
  const articleJsonLd = getArticleJsonLd({
    headline: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: getDefaultOgImage().url,
    citations: post.sources.map((source) => source.url),
    keywords: post.keywords,
  });

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-24 text-white">
      <article className="mx-auto max-w-4xl">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to research
        </Link>

        <header className="mb-12 border-b border-white/10 pb-10">
          <p className="mb-5 text-xs font-mono uppercase tracking-[0.28em] text-green-400">
            Research Note
          </p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl font-space">
            {post.title}
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-gray-400">{post.description}</p>
          <div className="mt-8 flex flex-wrap gap-4 text-sm text-zinc-500">
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US')}</span>
            <span>{post.readingTime}</span>
          </div>
        </header>

        <section className="mb-12 rounded-3xl border border-green-500/20 bg-green-500/[0.06] p-8">
          <h2 className="mb-5 text-2xl font-bold text-white">What matters here</h2>
          <ul className="space-y-4 text-sm leading-relaxed text-gray-200">
            {post.takeaways.map((takeaway) => (
              <li key={takeaway} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-12">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-5 text-3xl font-bold font-space">{section.heading}</h2>
              <div className="space-y-5 text-lg leading-relaxed text-gray-300">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets ? (
                <ul className="mt-6 space-y-3 text-base text-gray-200">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="mb-5 text-2xl font-bold">Sources</h2>
          <ul className="space-y-4">
            {post.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-base font-semibold text-white transition hover:text-green-300"
                >
                  {source.title}
                </a>
                <p className="mt-1 text-sm text-gray-500">
                  {source.publisher} · {source.publishedAt}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="mb-5 text-2xl font-bold">Service pages related to this article</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {relatedServices.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20 hover:bg-white/[0.05]"
              >
                <h3 className="text-base font-bold text-white">{service.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{service.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-green-300">
                  View service
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-10">
          <h2 className="mb-4 text-3xl font-bold font-space">Now look at your own site.</h2>
          <p className="max-w-2xl text-gray-400">
            Market research is helpful. Diagnosis is better. Run the audit if you want to see where
            your own business is leaking discoverability right now.
          </p>
          <Link
            href="/audit-flow"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-105"
          >
            Run the audit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </main>
  );
}
