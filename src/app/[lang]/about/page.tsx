// About page — brand story and mission
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";

export const metadata = { title: "About Us — Collector In Town" };

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-text-primary mb-6">
        {dict.footer.about}
      </h1>

      <div className="prose prose-invert max-w-none space-y-6 text-text-secondary leading-relaxed">
        <p>
          Collector In Town is Myanmar&apos;s premier destination for premium diecast model cars.
          We are passionate collectors who curate the finest 1:64 scale models from the world&apos;s
          top brands — Mini GT, Hot Wheels, Inno64, and Pop Race.
        </p>
        <p>
          Every model in our collection is handpicked for quality, detail, and authenticity.
          Whether you&apos;re a seasoned collector or just starting your journey, we&apos;re here
          to help you find the perfect addition to your shelf.
        </p>

        <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-text-primary pt-4">Our Mission</h2>
        <p>
          To make premium diecast collecting accessible to enthusiasts across Myanmar.
          We believe every collector deserves access to authentic, high-quality models
          at fair prices, delivered safely to their door.
        </p>

        <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-text-primary pt-4">Why Choose Us</h2>
        <ul className="space-y-2">
          <li>Authentic products from authorized distributors</li>
          <li>Careful packaging to protect every model</li>
          <li>Delivery across all regions of Myanmar</li>
          <li>Bilingual support in English and Burmese</li>
          <li>Secure payment via KBZPay and card</li>
        </ul>
      </div>
    </div>
  );
}
