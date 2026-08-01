import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GTO Review Trainer",
  description: "A daily Poker GTO review trainer for preflop and postflop decisions.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
