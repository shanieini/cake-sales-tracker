import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthGate from "@/components/AuthGate";
import KeyboardInset from "@/components/KeyboardInset";
import SplashOverlay from "@/components/SplashOverlay";
import { cakeStrings } from "@/lib/strings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: cakeStrings.title,
  description: "מעקב אחרי מכירות עוגות, הוצאות, ודוח מכירות חודשי ושנתי.",
  // iOS reads this instead of the web manifest for "Add to Home Screen":
  // `capable` drops the Safari chrome once launched from the home screen,
  // and `black-translucent` lets the app's own background show through
  // the status bar instead of a plain white or black band.
  appleWebApp: {
    capable: true,
    title: cakeStrings.title,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  // Ask the browser to shrink the layout viewport for the keyboard instead of
  // overlaying it. Chrome/Android honours this, which makes `dvh` correct
  // there and leaves --keyboard-inset at 0; iOS ignores it, which is why
  // KeyboardInset exists as well rather than instead.
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1c1a17" },
    { media: "(prefers-color-scheme: dark)", color: "#14120f" },
  ],
};

// Hebrew only, always — see src/lib/strings.ts. No theme toggle either:
// dark mode follows the OS via `prefers-color-scheme` in globals.css, with
// no settings page to override it — there's nowhere in this small app that
// UI would naturally live yet.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col font-sans">
        <KeyboardInset />
        {/* In the layout, so it plays once per document load and not on
            client-side navigations between pages. */}
        <SplashOverlay />
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
