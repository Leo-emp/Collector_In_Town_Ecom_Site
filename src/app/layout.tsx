import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

// Inter for body text, Playfair Display for headings — premium typography
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

// Default metadata — overridden per page for SEO
export const metadata: Metadata = {
  title: "Collector In Town — Premium Diecast Models",
  description:
    "Premium diecast model cars from Mini GT, Hot Wheels, Inno64, and Pop Race. Myanmar's collector destination.",
};

// Root layout — wraps everything including locale and admin layouts
// Reads x-locale header set by proxy.ts to set the correct html lang attribute
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the locale from the proxy header — defaults to "en"
  const headersList = await headers();
  const lang = headersList.get("x-locale") || "en";

  return (
    <html lang={lang} className={`${inter.variable} ${playfair.variable} dark`}>
      <body className="min-h-screen bg-background text-text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
