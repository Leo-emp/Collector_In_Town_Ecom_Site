// Cart page — server component that loads dictionary and renders CartContent
// The actual cart logic lives in CartContent (client component with CartContext)
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";
import { CartContent } from "@/components/cart/CartContent";

export const metadata = {
  title: "Shopping Cart — Collector In Town",
};

export default async function CartPage({
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
        {dict.cart.title}
      </h1>
      <CartContent lang={lang} dict={dict} />
    </div>
  );
}
