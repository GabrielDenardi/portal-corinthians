import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { footerLinkGroups, siteNavigation } from "@/content/home";
import { CORINTHIANS_CREST_URL } from "@/lib/assets";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Portal Corinthians",
    template: "%s | Portal Corinthians",
  },
  description:
    "Portal Corinthians reúne notícias, bastidores, próximo jogo e destaques editoriais com uma identidade esportiva forte e contemporânea.",
  keywords: ["Corinthians", "notícias", "futebol", "Portal Corinthians", "próximo jogo"],
  icons: {
    icon: CORINTHIANS_CREST_URL,
    shortcut: CORINTHIANS_CREST_URL,
    apple: CORINTHIANS_CREST_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${barlowCondensed.variable} antialiased`}>
      <body className="min-h-screen overflow-x-hidden bg-app text-ink">
        <div className="flex min-h-screen flex-col">
          <Header navigation={siteNavigation} />
          {children}
          <Footer groups={footerLinkGroups} />
        </div>
      </body>
    </html>
  );
}
