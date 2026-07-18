// Terms of Service page
import { notFound } from "next/navigation";
import { hasLocale } from "../dictionaries";

export const metadata = { title: "Terms of Service — Collector In Town" };

export default async function TermsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-text-primary mb-6">
        Terms of Service
      </h1>
      <p className="text-text-muted text-sm mb-8">Last updated: July 2026</p>

      <div className="space-y-6 text-text-secondary text-sm leading-relaxed">
        <section>
          <h2 className="text-text-primary font-semibold text-lg mb-2">Orders & Payment</h2>
          <p>All prices are listed in Myanmar Kyat (MMK). Payment is required at the time of order. We accept KBZPay and credit/debit cards. Orders are confirmed once payment is successfully processed.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold text-lg mb-2">Delivery</h2>
          <p>Delivery fees vary by zone and are displayed at checkout. Estimated delivery times are approximate and may vary due to circumstances beyond our control. We are not responsible for delays caused by delivery partners.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold text-lg mb-2">Returns & Refunds</h2>
          <p>Products may be returned within 7 days of delivery if unopened and in original packaging. Refunds are processed to the original payment method within 5-10 business days. Delivery fees are non-refundable.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold text-lg mb-2">Product Availability</h2>
          <p>All products are subject to availability. We reserve the right to limit quantities. In the rare case a product becomes unavailable after ordering, we will contact you to arrange a refund or replacement.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold text-lg mb-2">Intellectual Property</h2>
          <p>All content on this website — including images, text, logos, and design — is the property of Collector In Town and may not be reproduced without permission.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-semibold text-lg mb-2">Contact</h2>
          <p>For questions about these terms, contact us at hello@collectorintown.com.</p>
        </section>
      </div>
    </div>
  );
}
