// FAQ page — frequently asked questions
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";

export const metadata = { title: "FAQ — Collector In Town" };

const FAQS = [
  { q: "Are all products authentic?", a: "Yes. Every model we sell is sourced from authorized distributors. We guarantee 100% authenticity on all products." },
  { q: "What payment methods do you accept?", a: "We accept KBZPay (Myanmar's most popular mobile wallet) and credit/debit cards (Visa, Mastercard). Apple Pay is also supported through our card payment gateway." },
  { q: "How long does delivery take?", a: "Yangon: 1-2 business days. Mandalay/Naypyidaw: 2-3 business days. Other regions: 3-5 business days. You'll receive tracking updates via email." },
  { q: "Can I return or exchange a product?", a: "We accept returns within 7 days of delivery if the product is unopened and in original condition. Contact us to initiate a return." },
  { q: "Do you ship internationally?", a: "Currently we only deliver within Myanmar. We're exploring international shipping options for the future." },
  { q: "How do I track my order?", a: "Use the Track Order page and enter your order number. You'll see real-time status updates from confirmed through to delivered." },
  { q: "What scales do you carry?", a: "Most of our collection is 1:64 scale, which is the most popular size for diecast collecting. We occasionally stock 1:43 and other scales." },
  { q: "Do you have a physical store?", a: "We currently operate online only, which allows us to offer the best prices. We occasionally attend collector meetups and events in Yangon." },
];

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl text-text-primary mb-8">
        {dict.footer.faq}
      </h1>

      <div className="space-y-4">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-5">
            <h2 className="text-text-primary font-semibold mb-2">{faq.q}</h2>
            <p className="text-text-secondary text-sm leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
