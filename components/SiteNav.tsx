'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/industries', label: 'Industries' },
  { href: '/blog', label: 'Blog' },
  { href: '/audit-flow', label: 'Audit Flow' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function SiteNav() {
  const pathname = usePathname();

  if (pathname === '/') {
    return null;
  }

  return (
    <header className="border-b border-white/10 bg-[#050505]/95 px-6 py-5 text-white backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight font-space">
          RankUp AEO
        </Link>
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wider text-zinc-400">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
          <Link
            href="/audit-flow"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-black transition hover:scale-105"
          >
            Get audit
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </nav>
    </header>
  );
}
