"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { BottomNav } from "@/components/bottom-nav";
import { AppHeader } from "@/components/app-header";

// Shared shell for every signed-in page: guards the route (redirects to
// /login if there's no session) and renders the floating bottom nav bar
// under all of them, so each page under app/(app)/ only has to render its
// own content.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[linear-gradient(180deg,#f4fbfe_0%,#e1f5fe_55%,#b3e5fc_100%)]">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <main className="flex-1 pb-28">{children}</main>
      <BottomNav />
    </div>
  );
}

function Spinner({ className = "h-5 w-5 shrink-0" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}
