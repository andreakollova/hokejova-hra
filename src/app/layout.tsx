import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hokejový Tréner - Tréning pozemného hokeja",
  description:
    "Trénuj techniku miešania loptičky v interaktívnom tréningovom prostredí s kamerou v reálnom čase.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-950 text-white font-sans">{children}</body>
    </html>
  );
}
