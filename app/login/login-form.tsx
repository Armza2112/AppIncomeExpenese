"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Image from "next/image";

type Provider = "google" | "microsoft";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MICROSOFT_DOMAINS = ["hotmail.com", "outlook.com", "live.com", "msn.com"];

function resolveProvider(email: string): Provider | null {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return null;
  if (domain === "gmail.com") return "google";
  if (MICROSOFT_DOMAINS.includes(domain)) return "microsoft";
  return null;
}

export function LoginForm() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(
    null
  );
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

  function handleSignIn(provider: Provider) {
    if (loadingProvider || !agreed) return;
    setLoadingProvider(provider);
    // TODO: replace with the real OAuth flow, e.g. NextAuth.js:
    //   signIn(provider, { callbackUrl: "/" })
    // Google provider + Azure AD / Microsoft Entra ID provider covers
    // Gmail and Hotmail/Outlook accounts respectively.
    setTimeout(() => setLoadingProvider(null), 1500);
  }

  function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loadingProvider || !agreed) return;

    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError("กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }
    const provider = resolveProvider(trimmed);
    if (!provider) {
      setEmailError("รองรับเฉพาะอีเมล Gmail และ Hotmail/Outlook เท่านั้น");
      return;
    }
    setEmailError(null);
    // Route to the matching OAuth provider based on the email's domain —
    // still no password, this only decides which OAuth screen to open.
    handleSignIn(provider);
  }

  const disabled = !agreed || loadingProvider !== null;

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-end overscroll-contain bg-[linear-gradient(180deg,#f4fbfe_0%,#e1f5fe_55%,#b3e5fc_100%)] px-6 text-center font-sans text-foreground [-webkit-tap-highlight-color:transparent]"
      style={{
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      {/* Logo */}
      <div className="relative mb-4 flex h-28 w-28 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-primary/20" aria-hidden="true" />
        <div className="h-24 w-24 overflow-hidden rounded-full shadow-sm">
          <Image
            src="/logo-mascot.png"
            alt="โลโก้แอป"
            width={512}
            height={512}
            priority
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">รายรับ-รายจ่าย</h1>
      <p className="mt-1 text-lg font-semibold text-primary">
        บันทึกการเงินส่วนตัว เข้าใจง่าย
      </p>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
        จัดการรายรับรายจ่ายได้ง่าย ๆ ทั้งหมวดหมู่ งบประมาณ และรายงานสรุป
        เริ่มต้นได้เลย!
      </p>

      {/* Feature chips */}
      <div className="mt-6 flex max-w-sm flex-wrap items-center justify-center gap-2">
        <FeatureChip icon={<ReceiptIcon />} label="บันทึกรายการ" />
        <FeatureChip icon={<PieChartIcon />} label="สรุปรายจ่าย" />
        <FeatureChip icon={<TagIcon />} label="หมวดหมู่" />
        <FeatureChip icon={<ChartIcon />} label="งบประมาณ" />
        <FeatureChip icon={<DownloadIcon />} label="ส่งออก CSV" />
      </div>

      <div className="mt-8 w-full max-w-sm border-t border-border" />

      {/* Consent */}
      <label className="mt-6 flex w-full max-w-sm cursor-pointer items-start gap-3 text-left">
        <button
          type="button"
          role="checkbox"
          aria-checked={agreed}
          onClick={() => setAgreed((v) => !v)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 touch-manipulation items-center justify-center rounded-full border transition-colors ${
            agreed
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card"
          }`}
        >
          {agreed && (
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <span className="text-xs leading-relaxed text-muted-foreground">
          ฉันยอมรับ{" "}
          <a
            href="/terms"
            className="text-card-foreground underline underline-offset-2 hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            เงื่อนไขการใช้งาน
          </a>{" "}
          และรับทราบ{" "}
          <a
            href="/privacy"
            className="text-card-foreground underline underline-offset-2 hover:text-primary"
            onClick={(e) => e.stopPropagation()}
          >
            นโยบายความเป็นส่วนตัว
          </a>{" "}
          ของรายรับ-รายจ่ายแล้ว
        </span>
      </label>

      {/* Email → auto-routes to the matching OAuth provider */}
      <form
        onSubmit={handleEmailSubmit}
        noValidate
        className="mt-6 flex w-full max-w-sm flex-col gap-2"
      >
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="you@gmail.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          aria-label="อีเมล Gmail หรือ Hotmail/Outlook ของคุณ"
          aria-invalid={emailError !== null}
          className="h-14 w-full rounded-2xl border border-border bg-card px-5 text-base text-card-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        {emailError && (
          <p className="px-2 text-left text-xs text-red-600">{emailError}</p>
        )}
        <button
          type="submit"
          disabled={disabled}
          className="flex h-14 w-full touch-manipulation items-center justify-center gap-2.5 rounded-2xl bg-primary px-4 text-base font-semibold text-primary-foreground shadow-sm transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {loadingProvider !== null ? <Spinner /> : null}
          ดำเนินการต่อด้วยอีเมล
        </button>
      </form>

      <div className="my-4 flex w-full max-w-sm items-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">หรือ</span>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      {/* Buttons */}
      <div className="flex w-full max-w-sm flex-col gap-2.5">
        <button
          type="button"
          onClick={() => handleSignIn("google")}
          disabled={disabled}
          aria-label="ดำเนินการต่อด้วยบัญชี Google"
          className="flex h-14 w-full touch-manipulation items-center justify-center gap-2.5 rounded-2xl border border-border bg-card px-4 text-base font-semibold text-card-foreground shadow-sm transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {loadingProvider === "google" ? <Spinner /> : <GoogleIcon />}
          ดำเนินการต่อด้วย Google
        </button>

        <button
          type="button"
          onClick={() => handleSignIn("microsoft")}
          disabled={disabled}
          aria-label="เข้าสู่ระบบด้วยบัญชี Microsoft Hotmail หรือ Outlook"
          className="flex h-14 w-full touch-manipulation items-center justify-center gap-2.5 rounded-2xl border border-border bg-card px-4 text-base font-semibold text-card-foreground shadow-sm transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          {loadingProvider === "microsoft" ? <Spinner /> : <MicrosoftIcon />}
          เข้าสู่ระบบด้วย Hotmail / Outlook
        </button>
      </div>

      {!agreed && (
        <p className="mt-3 text-[11px] text-muted-foreground/80">
          กรุณายอมรับเงื่อนไขก่อนเข้าสู่ระบบ
        </p>
      )}

      <p className="mt-4 text-[11px] text-muted-foreground/70">v0.1.0</p>
    </div>
  );
}

function FeatureChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground">
      <span className="text-primary">{icon}</span>
      {label}
    </span>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.88c2.27-2.09 3.57-5.17 3.57-8.84Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.27a12 12 0 0 0 0 10.76l4-3.11Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.62l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 23 23" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M12 1h10v10H12z" />
      <path fill="#00A4EF" d="M1 12h10v10H1z" />
      <path fill="#FFB900" d="M12 12h10v10H12z" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PieChartIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 4v8l6 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 3H4v7l10 10 7-7L11 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19V10M12 19V5M19 19v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v10m0 0-3.5-3.5M12 14l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 18h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
