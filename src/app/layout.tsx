import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nifty Pulse - Tactical Investment Command Center",
  description:
    "Real-time Nifty valuation dashboard with tactical signals for SIP & Lumpsum decisions across Nifty 50, Next 50, Midcap 150, Smallcap 250, LargeMidcap 250, and Nifty 500.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nifty Pulse",
  },
};

export const viewport: Viewport = {
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
