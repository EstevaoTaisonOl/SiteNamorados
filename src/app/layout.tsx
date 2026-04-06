import type { Metadata } from "next";
import { Outfit, Fraunces } from "next/font/google";
import "./globals.css";
import { GiftProvider } from "@/context/GiftContext";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: "italic",
});

export const metadata: Metadata = {
  title: "Eternal Memories | Transforme memórias em experiências",
  description: "Crie presentes digitais interativos e emocionantes para quem você ama.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="font-sans min-h-full flex flex-col lowercase selection:bg-sunset selection:text-white">
        <div className="noise-overlay" />
        <GiftProvider>
          {children}
        </GiftProvider>
      </body>
    </html>
  );
}


