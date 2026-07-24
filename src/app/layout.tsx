import type { Metadata } from "next";
import { Outfit, Cinzel } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

export const metadata: Metadata = {
  title: "Collector In Town — Premium Diecast Models",
  description:
    "Premium diecast model cars from Mini GT, Hot Wheels, Inno64, and Pop Race. Myanmar's collector destination.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const lang = headersList.get("x-locale") || "en";

  return (
    <html lang={lang} className={`${outfit.variable} ${cinzel.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply saved theme before paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('theme');
              if (t === 'light') return;
              document.documentElement.classList.add('dark');
            } catch(e) {
              document.documentElement.classList.add('dark');
            }
          })();
        `}} />
      </head>
      <body className="min-h-screen bg-background text-text-primary font-[family-name:var(--font-outfit)]">
        {children}
      </body>
    </html>
  );
}
