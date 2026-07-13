import Link from 'next/link';

const groups = [
  {
    title: 'Explore',
    links: [
      { href: '/services', label: 'Services', context: ' for SEO and AEO visibility' },
      { href: '/industries', label: 'Industries', context: ' helped by RankUp AEO' },
      { href: '/blog', label: 'Blog', context: ' with SEO and AEO research' },
      { href: '/audit-flow', label: 'Audit Flow', context: ' for the visibility report' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/about', label: 'About', context: ' RankUp AEO' },
      { href: '/methodology', label: 'Methodology', context: ' for SEO and AEO audits' },
      { href: '/contact', label: 'Contact', context: ' RankUp AEO' },
      { href: '/llms.txt', label: 'LLMs.txt', context: ' summary for AI crawlers' },
      { href: '/llms-full.txt', label: 'Full LLMs.txt', context: ' content file for AI crawlers' },
      { href: '/feed.xml', label: 'RSS Feed', context: ' for RankUp AEO updates' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] px-6 py-12 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="text-2xl font-bold font-space">RankUp AEO</div>
          <p className="mt-4 max-w-md text-sm leading-7 text-gray-400">
            SEO and AEO visibility audits, structured content, schema, and 90-day implementation
            support for businesses that need clearer qualified discovery.
          </p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <div className="text-xs font-mono uppercase tracking-[0.24em] text-zinc-500">
              {group.title}
            </div>
            <div className="mt-5 grid gap-3 text-sm text-gray-300">
              {group.links.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-white">
                  {link.label}
                  <span className="sr-only">{link.context}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
