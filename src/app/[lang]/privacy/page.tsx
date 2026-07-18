// Privacy Policy page
import { notFound } from "next/navigation";
import { hasLocale } from "../dictionaries";

export const metadata = { title: "Privacy Policy — Collector In Town" };

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-text-primary mb-6">
        Privacy Policy
      </h1>
      <p className="text-text-muted text-sm mb-8">Last updated: July 2026</p>

      <div className="space-y-6 text-text-secondary text-sm leading-relaxed">
        <section>
          <h2 className="text-text-primary font-semibold text-lg mb-2">Information We Collect</h2>
          <p>When you place an order, we collect your name, email address, phone number, and delivery address. This information is necessary to process and deliver your order.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold text-lg mb-2">How We Use Your Information</h2>
          <p>We use your information to: process orders, send order confirmations and tracking updates, respond to customer service inquiries, and improve our services. We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold text-lg mb-2">Payment Security</h2>
          <p>All payment processing is handled by secure third-party providers (KBZPay and Stripe). We do not store your full payment details on our servers.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold text-lg mb-2">Data Retention</h2>
          <p>We retain order data for the duration required by local regulations. You may request deletion of your personal data by contacting us.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold text-lg mb-2">Contact</h2>
          <p>For privacy-related inquiries, contact us at hello@collectorintown.com.</p>
        </section>
      </div>
    </div>
  );
}
