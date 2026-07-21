// Order tracking page — guest-accessible order status lookup
// Customers enter their order number to see delivery progress
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { TrackingForm } from "@/components/tracking/TrackingForm";

export const metadata = {
  title: "Track Order — Collector In Town",
};

export default async function TrackOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { lang } = await params;
  const { token } = await searchParams;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl text-text-primary mb-2">
        {dict.tracking.title}
      </h1>
      <p className="text-text-secondary mb-8">
        Enter your order number to check delivery status.
      </p>
      <TrackingForm lang={lang} dict={dict} initialToken={token} />
    </div>
  );
}
