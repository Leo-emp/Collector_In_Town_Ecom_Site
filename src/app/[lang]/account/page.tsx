// Account page — sign in / sign up prompt
// Will show order history after Supabase Auth is connected
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "../dictionaries";

export const metadata = {
  title: "My Account — Collector In Town",
};

export default async function AccountPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>

      <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-text-primary mb-3">
        {dict.account.title}
      </h1>

      <p className="text-text-secondary text-sm mb-8">
        Sign in to your account or create a new one to start collecting.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button className="px-6 py-3 bg-accent text-background rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors">
          {dict.nav.signIn}
        </button>
        <button className="px-6 py-3 border border-border text-text-primary rounded-lg font-semibold text-sm hover:bg-surface-hover transition-colors">
          {dict.nav.signUp}
        </button>
      </div>

      <div className="mt-10 pt-6 border-t border-border">
        <Link href={`/${lang}/track`} className="text-accent text-sm hover:underline">
          {dict.account.trackOrder} &rarr;
        </Link>
      </div>
    </div>
  );
}
