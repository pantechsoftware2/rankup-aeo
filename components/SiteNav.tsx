'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

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
  const [menuOpen, setMenuOpen] = useState(false);

  if (pathname === '/') {
    return null;
  }

  return (
    <header className="border-b border-white/10 bg-[#050505]/95 px-6 py-5 text-white backdrop-blur">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight font-space">
          RankUp AEO
        </Link>
        <div className="hidden items-center gap-4 text-xs font-bold uppercase tracking-wider text-zinc-400 md:flex">
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
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/audit-flow"
            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-black transition hover:bg-gray-200"
          >
            Get audit
            <ArrowRight className="h-3 w-3" />
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen ? (
          <div className="absolute left-0 right-0 top-14 z-50 rounded-2xl border border-white/10 bg-[#080808]/95 p-4 shadow-2xl backdrop-blur md:hidden">
            <div className="grid gap-1 text-sm font-bold uppercase tracking-wider text-zinc-300">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-3 transition hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
