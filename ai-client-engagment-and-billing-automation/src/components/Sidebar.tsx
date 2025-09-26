'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/leads', label: 'Leads', icon: '👥' },
  { href: '/emails', label: 'Emails', icon: '📧' },
  { href: '/invoices', label: 'Invoices', icon: '💰' },
  { href: '/transactions', label: 'Transactions', icon: '💳' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const items = useMemo(() => NAV_ITEMS, []);

  return (
    <aside className="relative w-72 p-6 overflow-hidden">
      {/* Background gradient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute bottom-0 -right-10 h-56 w-56 rounded-full bg-purple-500 blur-3xl" />
      </div>

      <div className="relative z-10 backdrop-blur-xl bg-white/70 dark:bg-white/5 border border-white/20 rounded-2xl shadow-xl p-5">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg ring-2 ring-white/50" />
          <div>
            <div className="text-sm uppercase tracking-wider text-gray-500">AI Suite</div>
            <h2 className="text-xl font-bold">Biz Automation</h2>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {items.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border relative overflow-hidden
                  ${active
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg'
                    : 'bg-white/60 dark:bg-white/0 text-gray-800 dark:text-gray-100 hover:bg-white border-white/30'}
                `}
              >
                {!active && (
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden>
                    <span className="absolute -inset-px bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
                  </span>
                )}
                <span className="text-lg">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {!active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-transparent group-hover:bg-blue-400 transition-colors" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-white/5 dark:to-white/0 border border-white/40">
          <div className="text-xs text-gray-500 uppercase tracking-wider">Status</div>
          <div className="mt-1 text-sm">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Online
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}


