// Locale layout — wraps all pages under /en/* and /my/*
// Provides the Navbar, Footer, and dictionary context
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, locales } from "./dictionaries";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// Pre-generate both locale paths at build time for static rendering
export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Locale layout component — validates the locale and loads translations
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>; // params is a Promise in Next.js 15+
}) {
  // Await the params — required in Next.js 15+ App Router
  const { lang } = await params;

  // If the locale isn't supported (not "en" or "my"), show 404
  if (!hasLocale(lang)) notFound();

  // Load the translation dictionary for this locale
  const dict = await getDictionary(lang);

  return (
    <>
      {/* Main navigation — sticky at top */}
      <Navbar lang={lang} dict={dict} />

      {/* Page content — grows to fill space between nav and footer */}
      <main className="min-h-[calc(100vh-64px-200px)]">{children}</main>

      {/* Site footer — always at bottom */}
      <Footer lang={lang} dict={dict} />
    </>
  );
}
