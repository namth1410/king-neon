import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Outfit } from "next/font/google";
import "@/styles/globals.scss";
import "@/styles/tailwind.css";
import { NavigationProgress } from "@/components/NavigationProgress";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "King Neon Admin",
  description: "Admin dashboard for King Neon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${outfit.variable}`}>
      <body className="bg-zinc-950 text-white">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
