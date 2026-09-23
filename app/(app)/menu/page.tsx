"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function MenuPage() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
      if (!user) return null;

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  }

  return (

    <div>
      <p className="text-sm text-muted-foreground">{user.email}</p>

      <p className="max-w-xs text-sm text-muted-foreground">
        เข้าสู่ระบบสำเร็จแล้ว — หน้า &quot;หน้าหลัก&quot; นี้ยังเป็นแค่โครงทดสอบ
        ของจริงจะใส่กราฟสรุปรายรับ-รายจ่ายทีหลัง
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
