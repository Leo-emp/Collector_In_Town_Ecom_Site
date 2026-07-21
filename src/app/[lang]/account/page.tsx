// Account page — shows profile when signed in, sign-in prompt when not
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { getDictionary, hasLocale } from "../dictionaries";
import { auth } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

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
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  // Not signed in — show sign-in / sign-up prompt
  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl text-text-primary mb-3">
          {dict.account.title}
        </h1>

        <p className="text-text-secondary text-sm mb-8">
          Sign in to your account or create a new one to start collecting.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${lang}/sign-in`}
            className="px-6 py-3 bg-accent text-background rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors"
          >
            {dict.nav.signIn}
          </Link>
          <Link
            href={`/${lang}/sign-up`}
            className="px-6 py-3 border border-border text-text-primary rounded-lg font-semibold text-sm hover:bg-surface-hover transition-colors"
          >
            {dict.nav.signUp}
          </Link>
        </div>

        <div className="mt-10 pt-6 border-t border-border">
          <Link href={`/${lang}/track`} className="text-accent text-sm hover:underline">
            {dict.account.trackOrder} &rarr;
          </Link>
        </div>
      </div>
    );
  }

  // Signed in — show account dashboard
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl text-text-primary mb-8">
        {dict.account.title}
      </h1>

      {/* Profile card */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <span className="text-accent text-xl font-semibold">
              {session.user.name?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <p className="text-text-primary font-semibold text-lg">{session.user.name}</p>
            <p className="text-text-muted text-sm">{session.user.email}</p>
          </div>
        </div>
      </div>

      {/* Order history placeholder — will query from Turso when orders table exists */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-6">
        <h2 className="text-text-primary font-semibold text-lg mb-3">{dict.account.orderHistory}</h2>
        <p className="text-text-muted text-sm">{dict.account.noOrders}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/${lang}/track`}
          className="px-5 py-2.5 border border-border text-text-primary rounded-lg font-semibold text-sm
                     hover:bg-surface-hover transition-colors text-center"
        >
          {dict.account.trackOrder}
        </Link>
        <SignOutButton lang={lang} />
      </div>
    </div>
  );
}
