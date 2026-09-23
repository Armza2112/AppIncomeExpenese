"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const leftItems: NavItem[] = [
  { href: "/", label: "หน้าหลัก", icon: <OverviewIcon /> },
  { href: "/transactions", label: "ธุรกรรม", icon: <TransactionsIcon /> },
];

const rightItems: NavItem[] = [
  { href: "/wallet", label: "กระเป๋า", icon: <WalletIcon /> },
  { href: "/menu", label: "เมนู", icon: <MenuIcon /> },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-1.5"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="relative flex w-full items-center justify-between rounded-full border border-border bg-card px-4 py-2.5 shadow-lg shadow-primary-foreground/10">
        {leftItems.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        {/* spacer so the elevated center button doesn't overlap the labels */}
        <div className="w-14 shrink-0" aria-hidden="true" />

        {rightItems.map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}

        <Link
          href="/transactions/new"
          aria-label="เพิ่มรายการ"
          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 touch-manipulation items-center justify-center rounded-full bg-primary-foreground text-white shadow-md shadow-primary-foreground/40 transition-transform active:scale-95"
        >
          <PlusIcon />
        </Link>
      </div>
    </nav>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className="flex w-12 touch-manipulation flex-col items-center gap-1 py-1 text-[10px]"
    >
      <span
        className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
          active
            ? "bg-primary-foreground text-white shadow-sm shadow-primary-foreground/30"
            : "text-muted-foreground"
        }`}
      >
        {item.icon}
      </span>
      <span
        className={
          active
            ? "font-semibold text-primary-foreground"
            : "text-muted-foreground"
        }
      >
        {item.label}
      </span>
    </Link>
  );
}

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[32px] w-[32px]" aria-hidden="true">
      <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
      <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
    </svg>
  );
}

function TransactionsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[32px] w-[32px]" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[32px] w-[32px]" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
      <path d="M16 14h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[32px] w-[32px]" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
