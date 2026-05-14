import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LifeOS",
  description: "Private, local-first life organizer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-dvh bg-surface font-sans text-zinc-100 antialiased`}>
        <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 pb-12 pt-6 sm:px-6">
          <header className="mb-8 flex flex-col gap-4 border-b border-surface-border pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Local-first</p>
              <h1 className="text-2xl font-semibold tracking-tight text-white">LifeOS</h1>
            </div>
            <SiteNav />
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
