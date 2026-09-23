"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
};

type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

type ApiError = {
  statusCode: number;
  message: string;
  error: string;
};

type AuthContextValue = {
  /** null while signed out, populated after a successful /auth/google or /auth/refresh */
  user: AuthUser | null;
  /** kept in memory only — never persisted to localStorage/sessionStorage, per the backend's security notes */
  accessToken: string | null;
  /** true while the initial "restore session from cookie" check (POST /auth/refresh) is in flight */
  isLoading: boolean;
  loginWithGoogleIdToken: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function postAuth(path: string, body?: unknown): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    // required so the browser sends/accepts the httpOnly refresh_token cookie
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const data: Partial<ApiError> | null = await res.json().catch(() => null);
    throw new Error(data?.message ?? `คำขอล้มเหลว (${res.status})`);
  }

  return res.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const didInit = useRef(false);

  // On first mount (app load / full page reload): try to restore the
  // session from the refresh_token cookie, per the backend's guidance —
  // this is what makes the session persist until the cookie itself expires.
  useEffect(() => {
    if (didInit.current) return; // guards against React StrictMode's double-invoke in dev
    didInit.current = true;

    // Note: no cleanup-based cancellation here on purpose. In dev,
    // React Strict Mode mounts this effect, cleans it up, then mounts it
    // again — the `didInit` guard above already stops a second fetch from
    // firing, so there is only ever one in-flight request. Gating the
    // state updates on a "cancelled" flag set by that phantom cleanup was
    // silencing setIsLoading(false) for the one real request, leaving the
    // login page stuck on its loading spinner forever.
    postAuth("/auth/refresh")
      .then((data) => {
        setAccessToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => {
        // no valid refresh_token cookie yet (or it expired) — just means signed out
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const loginWithGoogleIdToken = useCallback(async (idToken: string) => {
    const data = await postAuth("/auth/google", { idToken });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await postAuth("/auth/logout");
    } finally {
      // clear local state regardless of whether the request succeeded —
      // the cookie itself is cleared server-side on success
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, loginWithGoogleIdToken, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth ต้องถูกเรียกภายใน <AuthProvider>");
  }
  return ctx;
}
