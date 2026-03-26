import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nifty Pulse - Market Valuation Dashboard",
  description:
    "Real-time Nifty valuation dashboard tracking P/E, P/B, and Dividend Yield against historical medians to identify value-investing opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
