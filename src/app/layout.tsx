import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import type { Metadata, Viewport } from "next";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LumoTrade - AI-Powered Market Intelligence",
    template: "%s | LumoTrade",
  },
  description:
    "Real-time market analysis powered by AI. Get instant insights on stock trends, predictions, and what's moving the market today. Built for traders who want clarity.",
  keywords: [
    "stock market",
    "AI trading",
    "market analysis",
    "stock predictions",
    "technical analysis",
    "market intelligence",
    "trading insights",
    "S&P 500",
    "NASDAQ",
    "market trends",
  ],
  authors: [{ name: "LumoTrade" }],
  creator: "LumoTrade",
  publisher: "LumoTrade",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lumotrade.com",
    siteName: "LumoTrade",
    title: "LumoTrade - AI-Powered Market Intelligence",
    description:
      "Real-time market analysis powered by AI. Get instant insights on stock trends, predictions, and what's moving the market today.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LumoTrade - AI Market Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LumoTrade - AI-Powered Market Intelligence",
    description:
      "Real-time market analysis powered by AI. Get instant insights on stock trends and predictions.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1419" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
