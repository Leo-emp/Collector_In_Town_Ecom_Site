// Checkout page — server component wrapper for CheckoutForm
// Loads dictionary and passes it to the client component
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = {
  title: "Checkout — Collector In Town",
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl text-text-primary mb-8">
        {dict.checkout.title}
      </h1>
      <CheckoutForm lang={lang} dict={dict} />
    </div>
  );
}
