'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AuthUser = {
  id: string;
  fullName: string;
  email: string;
};

export default function AuthProfileMenu({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        const result = await response.json().catch(() => null);

        if (!cancelled && result?.authenticated && result?.user) {
          setUser(result.user);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('mousedown', closeOnOutsideClick);
    return () => window.removeEventListener('mousedown', closeOnOutsideClick);
  }, [open]);

  const initials = useMemo(() => {
    const source = user?.fullName || user?.email || '';
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';
  }, [user]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setOpen(false);
      onNavigate?.();
      router.replace('/');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white text-xs font-black text-black transition hover:scale-105 hover:bg-zinc-200"
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        {initials}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-[80] w-64 rounded-xl border border-white/10 bg-[#080808] p-3 text-left shadow-2xl shadow-black/40">
          <div className="border-b border-white/10 px-2 pb-3">
            <div className="truncate text-sm font-bold normal-case tracking-normal text-white">{user.fullName}</div>
            <div className="mt-1 truncate text-xs font-medium normal-case tracking-normal text-zinc-500">{user.email}</div>
          </div>
          <div className="mt-2 grid gap-1">
            <Link
              href="/dashboard"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="rounded-lg px-2 py-2 text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg px-2 py-2 text-left text-xs font-bold uppercase tracking-wider text-red-300 transition hover:bg-red-500/10 hover:text-red-200 disabled:cursor-wait disabled:opacity-60"
            >
              {loggingOut ? 'Logging out...' : 'Log out'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
