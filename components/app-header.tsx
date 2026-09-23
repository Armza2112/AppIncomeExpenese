"use client";

import { useAuth } from "@/lib/auth-context";

// Shared top bar for every signed-in page: avatar + name, matching the
// reference layout. Lives in app/(app)/layout.tsx so it's identical on
// every route under that group.
export function AppHeader() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header
      className="flex items-center gap-3 rounded-b-3xl bg-primary px-5 pb-4 shadow-sm"
      style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- avatar comes
          from Google's own CDN; a plain <img> avoids configuring next/image
          remote patterns just for this */}
      <img
        src={user.avatarUrl}
        alt={user.name}
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-full border-2 border-card object-cover shadow-sm"
      />
      <p className="truncate text-base font-semibold text-primary-foreground">
        {user.name}
      </p>
    </header>
  );
}
