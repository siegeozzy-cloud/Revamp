import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { META } from "@/content/story";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  title: META.title,
  description: META.description,
  openGraph: {
    title: META.title,
    description: META.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable}`}>
      <body>
        <a
          href="#contact"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-aim focus:px-5 focus:py-2.5 focus:text-sm focus:text-white"
        >
          Skip to contact
        </a>
        {children}
      </body>
    </html>
  );
}
