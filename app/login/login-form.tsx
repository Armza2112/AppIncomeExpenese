"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isGmailAddress(email: string): boolean {
  return email.split("@")[1]?.toLowerCase().trim() === "gmail.com";
}

// --- Google Identity Services (GIS) types ---------------------------------
// GIS is loaded via a plain <script> tag (next/script), not an npm package,
// so TypeScript doesn't know about window.google — declare just what we use.
type GoogleCredentialResponse = { credential: string };
type GoogleButtonConfig = {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: GoogleButtonConfig) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
// Google's rendered button is a fixed ~40px tall regardless of `size`; this
// scales it up to match the h-14 (56px) buttons used elsewhere on the page.
const GOOGLE_BTN_SCALE = 48 / 40;

export function LoginForm() {
  const router = useRouter();
  const { user, isLoading: authLoading, loginWithGoogleIdToken } = useAuth();

  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const didRenderButton = useRef(false);

  // Lazy initializer instead of an effect: on a fresh page load the GIS
  // script genuinely hasn't loaded yet (false, correct). On a client-side
  // remount (e.g. logout -> back to /login) the <script> tag from the
  // earlier mount is already loaded and window.google already exists, so
  // this picks that up immediately instead of waiting on a re-fired
  // onLoad that next/script doesn't reliably deliver to a brand-new mount.
  const [gisReady, setGisReady] = useState(
    () => typeof window !== "undefined" && !!window.google
  );
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Already signed in (e.g. the /auth/refresh check on app load succeeded)
  // — bounce away from the login page instead of showing it again.
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  const handleGoogleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      setAuthError(null);
      setIsSigningIn(true);
      try {
        // POST /auth/google with the Google ID token — backend verifies it,
        // finds-or-creates the user, and returns { accessToken, user } plus
        // a Set-Cookie for the httpOnly refresh_token.
        await loginWithGoogleIdToken(response.credential);
        router.replace("/");
      } catch (err) {
        setAuthError(
          err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่"
        );
      } finally {
        setIsSigningIn(false);
      }
    },
    [loginWithGoogleIdToken, router]
  );

  // Initialize Google Identity Services once its script has loaded, then
  // render Google's OWN sign-in button into our container.
  //
  // Deliberately not using google.accounts.id.prompt() (One Tap) — it
  // depends on the browser silently completing a FedCM credential fetch,
  // which fails intermittently ("FedCM get() rejects with NetworkError /
  // AbortError") depending on third-party sign-in settings, cooldowns and
  // extensions, even with a correctly authorized origin. renderButton()
  // opens the same account picker but as a direct response to a real click
  // on Google's own button — the flow FedCM actually supports reliably.
  useEffect(() => {
    if (!gisReady || !window.google || !GOOGLE_CLIENT_ID) return;
    if (didRenderButton.current || !googleButtonRef.current) return;
    didRenderButton.current = true;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      logo_alignment: "left",
      // Google's own button tops out at ~40px tall regardless of `size`.
      // GOOGLE_BTN_SCALE (below) visually stretches it to match the 56px
      // (h-14) height of the other buttons on this page — the width here
      // is the PRE-scale value, so width * GOOGLE_BTN_SCALE ends up close
      // to the same on-screen width as those buttons.
      width: Math.round(336 / GOOGLE_BTN_SCALE),
    });
  }, [gisReady, handleGoogleCredential]);

  function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed || isSigningIn) return;

    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError("กรุณากรอกอีเมลให้ถูกต้อง");
      setEmailHint(null);
      return;
    }
    if (!isGmailAddress(trimmed)) {
      setEmailError("รองรับเฉพาะอีเมล Gmail เท่านั้น");
      setEmailHint(null);
      return;
    }
    setEmailError(null);
    // The typed email only pre-validates the domain. Browsers won't let a
    // script finish a Google sign-in on a real button's behalf (that's the
    // whole point of the iframe-based button), so instead of trying to
    // auto-launch it, point the person at the real Google button below.
    setEmailHint(
      `อีเมล ${trimmed} ใช้ได้ — กดปุ่ม "Sign in with Google" ด้านล่างเพื่อเข้าสู่ระบบ`
    );
    googleButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const disabled = !agreed || isSigningIn;

  // Avoid flashing the login form for a signed-in user while the redirect
  // above is in flight, or while the initial /auth/refresh check runs.
  if (authLoading || user) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[linear-gradient(180deg,#f4fbfe_0%,#e1f5fe_55%,#b3e5fc_100%)]">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-end overscroll-contain bg-[linear-gradient(180deg,#f4fbfe_0%,#e1f5fe_55%,#b3e5fc_100%)] px-6 text-center font-sans text-foreground [-webkit-tap-highlight-color:transparent]"
      style={{
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <Script
        src="https://accounts.google.com/gsi/client?hl=th"
        strategy="afterInteractive"
        onLoad={() => setGisReady(true)}
      />

      {/* Logo */}
      <div className="relative mb-7 flex h-40 w-40 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-primary/20" aria-hidden="true" />
        <div className="h-36 w-36 overflow-hidden rounded-full shadow-sm">
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

      <h1 className="text-2xl font-bold tracking-tight">Chin &amp; Chill</h1>
      <p className="mt-1 text-lg font-semibold text-primary">
        บันทึกการเงินส่วนตัว เข้าใจง่าย
      </p>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
        จัดการรายรับรายจ่ายได้ง่าย ๆ ทั้งหมวดหมู่ งบประมาณ และรายงานสรุป
        เริ่มต้นได้เลย!
      </p>

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
          ของ Chin &amp; Chill แล้ว
        </span>
      </label>

      {/* Email → pre-checks it's a Gmail address, then triggers Google sign-in */}
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
          aria-label="อีเมล Gmail ของคุณ"
          aria-invalid={emailError !== null}
          className="h-14 w-full rounded-2xl border border-border bg-card px-5 text-base text-card-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        {emailError && (
          <p className="px-2 text-left text-xs text-red-600">{emailError}</p>
        )}
        {emailHint && !emailError && (
          <p className="px-2 text-left text-xs text-emerald-600">{emailHint}</p>
        )}
        <button
          type="submit"
          disabled={disabled}
          className="flex h-14 w-full touch-manipulation items-center justify-center gap-2.5 rounded-2xl bg-primary px-4 text-base font-semibold text-primary-foreground shadow-sm transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          ตรวจสอบอีเมล
        </button>
      </form>

      <div className="my-4 flex w-full max-w-sm items-center gap-3">
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="text-xs text-muted-foreground">หรือ</span>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
      </div>

      {/* Google's own button, rendered for real via GIS so the click is a
          genuine user gesture FedCM will honor. A transparent overlay blocks
          it until the consent checkbox is ticked. */}
      <div className="relative flex h-14 w-full max-w-sm flex-col items-center justify-center gap-2.5">
        <div
          ref={googleButtonRef}
          style={{ transform: `scale(${GOOGLE_BTN_SCALE})` }}
          className={`flex items-center justify-center transition-opacity ${
            isSigningIn ? "pointer-events-none opacity-60" : ""
          } ${!gisReady ? "opacity-0" : ""}`}
        />
        {!gisReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        {!agreed && (
          <button
            type="button"
            aria-label="กรุณายอมรับเงื่อนไขก่อนเข้าสู่ระบบด้วย Google"
            onClick={() => setAuthError("กรุณายอมรับเงื่อนไขก่อนเข้าสู่ระบบ")}
            className="absolute inset-0 cursor-not-allowed"
          />
        )}
      </div>

      {authError && (
        <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-red-600">
          {authError}
        </p>
      )}

      {!agreed && (
        <p className="mt-3 text-[11px] text-muted-foreground/80">
          กรุณายอมรับเงื่อนไขก่อนเข้าสู่ระบบ
        </p>
      )}

      <p className="mt-4 text-[11px] text-muted-foreground/70">v0.1.0</p>
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

