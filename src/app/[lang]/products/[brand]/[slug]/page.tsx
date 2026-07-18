// Product detail page — full product info with gallery, specs, and related items
// Route: /en/products/mini-gt/nissan-gtr-r35-liberty-walk
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "../../../dictionaries";
import { formatPrice } from "@/lib/format";
import { PhotoGallery } from "@/components/product/PhotoGallery";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Metadata } from "next";

// Placeholder product data — will be replaced with Supabase query
const PLACEHOLDER_PRODUCTS = [
  { id: "1", name_en: "Nissan GT-R R35 Liberty Walk", name_my: "နစ်ဆန် GT-R R35 Liberty Walk", slug: "nissan-gtr-r35-liberty-walk", brand: "mini-gt", scale: "1:64", price: 45000, description_en: "Mini GT 1:64 scale Nissan GT-R R35 with Liberty Walk body kit. Metallic blue finish with detailed interior and opening doors.", description_my: "Mini GT 1:64 စကေး နစ်ဆန် GT-R R35 Liberty Walk ကိုယ်ထည်ကစ်ပါ။ အပြာရောင် metallic finish ဖြင့် အတွင်းပိုင်းအသေးစိတ်ပါ။", photos: [] as string[], stock_count: 15, status: "active" },
  { id: "2", name_en: "Porsche 911 GT3 RS", name_my: "ပေါ့ရှ 911 GT3 RS", slug: "porsche-911-gt3-rs", brand: "mini-gt", scale: "1:64", price: 52000, description_en: "Mini GT 1:64 Porsche 911 GT3 RS in Guards Red. Opening hood reveals detailed flat-six engine.", description_my: "Mini GT 1:64 ပေါ့ရှ 911 GT3 RS Guards Red အနီရောင်။", photos: [] as string[], stock_count: 8, status: "active" },
  { id: "3", name_en: "Toyota AE86 Sprinter Trueno", name_my: "တိုယိုတာ AE86 Sprinter Trueno", slug: "toyota-ae86-sprinter-trueno", brand: "hot-wheels", scale: "1:64", price: 12000, description_en: "Hot Wheels premium Toyota AE86 from the Japan Historics series. White and black panda colorway with Real Riders rubber tires.", description_my: "Hot Wheels ပရီမီယံ တိုယိုတာ AE86 Japan Historics စီးရီး။", photos: [] as string[], stock_count: 25, status: "active" },
  { id: "4", name_en: "Mazda RX-7 FD3S Spirit R", name_my: "မဇ်ဒါ RX-7 FD3S Spirit R", slug: "mazda-rx7-fd3s-spirit-r", brand: "hot-wheels", scale: "1:64", price: 15000, description_en: "Hot Wheels premium Mazda RX-7 FD3S Spirit R in brilliant red. Real Riders rubber tires and detailed rotary engine.", description_my: "Hot Wheels ပရီမီယံ မဇ်ဒါ RX-7 FD3S Spirit R အနီရောင်။", photos: [] as string[], stock_count: 20, status: "active" },
  { id: "5", name_en: "Honda Civic Type-R EK9", name_my: "ဟွန်ဒါ Civic Type-R EK9", slug: "honda-civic-type-r-ek9", brand: "inno64", scale: "1:64", price: 38000, description_en: "Inno64 Honda Civic Type-R EK9 in Championship White. Highly detailed with opening hood and Mugen accessories.", description_my: "Inno64 ဟွန်ဒါ Civic Type-R EK9 Championship White အဖြူရောင်။", photos: [] as string[], stock_count: 10, status: "active" },
  { id: "6", name_en: "Mitsubishi Lancer Evolution III", name_my: "မစ်ဆူဘီရှီ Lancer Evolution III", slug: "mitsubishi-lancer-evo-iii", brand: "inno64", scale: "1:64", price: 42000, description_en: "Inno64 Mitsubishi Lancer Evolution III in Dandelion Yellow. Rally-spec with roof scoop and Enkei wheels.", description_my: "Inno64 မစ်ဆူဘီရှီ Lancer Evolution III Dandelion Yellow အဝါရောင်။", photos: [] as string[], stock_count: 6, status: "active" },
  { id: "7", name_en: "Nissan Skyline GT-R R34 V-Spec II", name_my: "နစ်ဆန် Skyline GT-R R34 V-Spec II", slug: "nissan-skyline-gtr-r34-vspec-ii", brand: "pop-race", scale: "1:64", price: 35000, description_en: "Pop Race Nissan Skyline GT-R R34 V-Spec II in Bayside Blue. Chrome Nismo bumper, detailed undercarriage, and Brembo brakes.", description_my: "Pop Race နစ်ဆန် Skyline GT-R R34 V-Spec II Bayside Blue အပြာရောင်။", photos: [] as string[], stock_count: 12, status: "active" },
  { id: "8", name_en: "Toyota Supra A80 TRD", name_my: "တိုယိုတာ Supra A80 TRD", slug: "toyota-supra-a80-trd", brand: "pop-race", scale: "1:64", price: 32000, description_en: "Pop Race Toyota Supra A80 with TRD 3000GT wing in Super White II. Recaro interior and Rays TE37 wheels.", description_my: "Pop Race တိုယိုတာ Supra A80 TRD 3000GT wing Super White II အဖြူရောင်။", photos: [] as string[], stock_count: 0, status: "sold_out" },
];

// Dynamic metadata from product data
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; brand: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = PLACEHOLDER_PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name_en} — Collector In Town`,
    description: product.description_en,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; brand: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  // Find the product by slug
  const product = PLACEHOLDER_PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  // Get display values based on locale
  const name = lang === "my" ? product.name_my : product.name_en;
  const description = lang === "my" ? product.description_my : product.description_en;
  const isInStock = product.stock_count > 0 && product.status === "active";

  // Related products — up to 4 from the same brand, excluding current product
  const relatedProducts = PLACEHOLDER_PRODUCTS
    .filter((p) => p.brand === product.brand && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href={`/${lang}`} className="hover:text-accent transition-colors">
          {dict.nav.home}
        </Link>
        <span>/</span>
        <Link
          href={`/${lang}/products/${product.brand}`}
          className="hover:text-accent transition-colors capitalize"
        >
          {product.brand.replace("-", " ")}
        </Link>
        <span>/</span>
        <span className="text-text-secondary truncate max-w-[200px]">{name}</span>
      </nav>

      {/* Product layout — 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left column: Photo gallery */}
        <PhotoGallery photos={product.photos} productName={name} />

        {/* Right column: Product info */}
        <div>
          {/* Brand label */}
          <p className="text-accent text-sm uppercase tracking-wider mb-2">
            {product.brand.replace("-", " ")}
          </p>

          {/* Product name */}
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-text-primary mb-4">
            {name}
          </h1>

          {/* Price */}
          <p className="text-accent text-2xl font-bold mb-6">
            {formatPrice(product.price)}
          </p>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full
                ${isInStock ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}
            >
              <span className={`w-2 h-2 rounded-full ${isInStock ? "bg-success" : "bg-error"}`} />
              {isInStock ? dict.product.inStock : dict.product.outOfStock}
            </span>
          </div>

          {/* Specs table */}
          <div className="border-t border-border pt-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{dict.product.brand}</span>
              <span className="text-text-primary capitalize">{product.brand.replace("-", " ")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{dict.product.scale}</span>
              <span className="text-text-primary">{product.scale}</span>
            </div>
          </div>

          {/* Add to cart */}
          <div className="mb-8">
            <AddToCartButton
              productId={product.id}
              isInStock={isInStock}
              dict={dict}
            />
          </div>

          {/* Description */}
          <div className="border-t border-border pt-6">
            <h2 className="text-text-primary font-semibold mb-3">
              {dict.product.description}
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-text-primary mb-8">
            {dict.product.relatedProducts}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} dict={dict} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
