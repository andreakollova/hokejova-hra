import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hokejovy Trener - Trening pozemneho hokeja",
  description:
    "Trenuj techniku miesania lopticky v interaktivnom treningovom prostredi s kamerou v realnom case.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950 text-white font-sans">{children}</body>
    </html>
  );
}
