import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import VisitTracker from "@/components/VisitTracker";
import CookieBanner from "@/components/ui/CookieBanner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "HockeyBeats - Get better at hockey to the music you love",
    template: "%s | HockeyBeats",
  },
  description: "Hockey training games with music. Play along to Spotify, build your score and rank against teammates. Field hockey, ice hockey and floorball.",
  keywords: ["hockey", "training", "game", "field hockey", "ice hockey", "floorball", "music", "Spotify", "practice"],
  icons: { icon: '/images/hb-favicon.png' },
  metadataBase: new URL('https://www.hockeybeats.app'),
  openGraph: {
    title: "HockeyBeats - Get better at hockey to the music you love",
    description: "Hockey training games with music. Play along to Spotify, build your score and rank against teammates.",
    url: 'https://www.hockeybeats.app',
    siteName: 'HockeyBeats',
    type: 'website',
    images: [{ url: '/images/hero-clean.png', width: 1942, height: 809 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "HockeyBeats - Hockey training games with music",
    description: "Play along to Spotify, build your score and rank against teammates.",
    images: ['/images/hero-clean.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-straight/css/uicons-solid-straight.css" />
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-rounded/css/uicons-solid-rounded.css" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">{children}<Analytics /><VisitTracker /><CookieBanner /></body>
    </html>
  );
}
