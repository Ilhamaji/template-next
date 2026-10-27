import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Self-hosted fonts — no network access needed at build or runtime.
 * Files live in app/fonts/ under the SIL Open Font License (see OFL.txt).
 *
 * To swap in a brand font: drop the .ttf/.woff2 files into app/fonts/,
 * update the `src` paths below, and keep `variable` names in sync with
 * app/globals.css.
 */
const geistSans = localFont({
  src: [
    { path: "./fonts/Geist-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Geist-Medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-geist-sans",
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
});

const geistMono = localFont({
  src: [{ path: "./fonts/GeistMono-Regular.ttf", weight: "400", style: "normal" }],
  variable: "--font-geist-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  title: {
    default: "Template Next",
    template: "%s · Template Next",
  },
  description:
    "Agent-ready Next.js starter: one source of truth for rules, portable skills, and a strict workflow built for AI coding agents.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
