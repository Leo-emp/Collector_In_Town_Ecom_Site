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
    "Premium diecast model cars from Mini GT, Hot Wheels, Inno64, and Pop Race. Myanmar's collector destination for 1:64 scale diecast models since 2019.",
  metadataBase: new URL("https://www.collectorintown.com"),
  openGraph: {
    title: "Collector In Town — Premium Diecast Models",
    description:
      "Premium diecast model cars from Mini GT, Hot Wheels, Inno64, and Pop Race. Myanmar's collector destination since 2019.",
    url: "https://www.collectorintown.com",
    siteName: "Collector In Town",
    images: [{ url: "/images/logo.png", width: 1024, height: 1024, alt: "Collector In Town Logo" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Collector In Town — Premium Diecast Models",
    description: "Premium diecast model cars. Myanmar's collector destination since 2019.",
    images: ["/images/logo.png"],
  },
  keywords: [
    "diecast models", "Mini GT", "Hot Wheels", "Inno64", "Pop Race",
    "1:64 scale", "model cars", "Myanmar", "collector", "Collector In Town",
    "diecast cars Myanmar", "CIT model cars",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const lang = headersList.get("x-locale") || "en";

  return (
    <html lang={lang} className={`${outfit.variable} ${cinzel.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Collector In Town",
              alternateName: "CIT Model Cars Collection",
              url: "https://www.collectorintown.com",
              logo: "https://www.collectorintown.com/images/logo.png",
              foundingDate: "2019",
              description:
                "Premium diecast model cars from Mini GT, Hot Wheels, Inno64, and Pop Race. Myanmar's collector destination since 2019.",
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Collector In Town",
              url: "https://www.collectorintown.com",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://www.collectorintown.com/en/products/new-arrivals?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-text-primary font-[family-name:var(--font-outfit)]">
        {children}
      </body>
    </html>
  );
}
