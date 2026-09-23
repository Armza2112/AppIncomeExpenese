"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Not signed in (and the initial /auth/refresh check has finished) —
  // this route is protected, so bounce to /login.
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[linear-gradient(180deg,#f4fbfe_0%,#e1f5fe_55%,#b3e5fc_100%)]">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-6 overscroll-contain bg-[linear-gradient(180deg,#f4fbfe_0%,#e1f5fe_55%,#b3e5fc_100%)] px-6 text-center font-sans text-foreground [-webkit-tap-highlight-color:transparent]"
      style={{
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- avatar comes
          from Google's own CDN; a plain <img> avoids configuring next/image
          remote patterns just for this temporary test page */}
      <img
        src={user.avatarUrl}
        alt={user.name}
        width={80}
        height={80}
        className="h-20 w-20 rounded-full border border-primary/20 object-cover shadow-sm"
      />

      <div>
        <p className="text-lg font-semibold text-card-foreground">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>

      <p className="max-w-xs text-sm text-muted-foreground">
        เข้าสู่ระบบสำเร็จแล้ว — นี่คือหน้าทดสอบชั่วคราว ยังไม่ใช่หน้าแอปจริง
      </p>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex h-12 w-full max-w-xs touch-manipulation items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 text-sm font-semibold text-card-foreground shadow-sm transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoggingOut ? <Spinner className="h-4 w-4" /> : null}
        ออกจากระบบ
      </button>
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
