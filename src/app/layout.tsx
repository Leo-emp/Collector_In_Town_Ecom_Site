import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} dark`}>
      <body className="min-h-screen bg-background text-text-primary font-sans">
        {children}
      </body>
    </html>
  );
}
