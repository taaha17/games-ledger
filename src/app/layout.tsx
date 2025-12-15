import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
import { Toaster } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
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
  title: {
    default: "GamesLedger",
    template: "%s | GamesLedger",
  },
  description: "Track your video game journey - Your personal game library and tracking companion",
  keywords: ["games", "game tracking", "backlog", "video games", "gaming", "library"],
  authors: [{ name: "GamesLedger" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "GamesLedger",
    title: "GamesLedger - Track Your Gaming Journey",
    description: "Your personal game library and tracking companion",
  },
  twitter: {
    card: "summary_large_image",
    title: "GamesLedger",
    description: "Track your video game journey",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#161616" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
