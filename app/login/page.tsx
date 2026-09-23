import type { Viewport } from "next";
import { LoginForm } from "./login-form";

// Per-route viewport: enables safe-area insets (notch / home indicator)
// via viewportFit "cover", and tints the mobile browser/PWA status bar
// to match the app's light-blue theme. Kept in a server component
// because "viewport" cannot be exported from a "use client" file.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eefafe",
};

export default function LoginPage() {
  return <LoginForm />;
}
