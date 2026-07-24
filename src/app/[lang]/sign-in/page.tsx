// Sign in page — email/password login with Better Auth
// Has its own minimal header (public navbar is hidden)
"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await authClient.signIn.email({
      email,
      password,
    });

    if (authError) {
      setError(authError.message || "Invalid email or password");
      setLoading(false);
      return;
    }

    router.push(`/${lang}/account`);
  };

  return (
    <div className="min-h-screen">
      {/* Minimal header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={`/${lang}`} className="flex items-center gap-3">
            <img src="/images/logo.png" alt="Collector In Town" className="h-10 w-auto" />
            <span className="font-[family-name:var(--font-cinzel)] text-sm text-accent font-bold hidden sm:block">
              Collector In Town
            </span>
          </Link>
          <Link
            href={`/${lang}`}
            className="text-text-secondary text-sm hover:text-text-primary transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Shop
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl text-text-primary mb-2">
              Welcome Back
            </h1>
            <p className="text-text-muted text-sm">
              Sign in to your Collector In Town account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-6 space-y-5">
            {error && (
              <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-text-secondary text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary
                           placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-text-secondary text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary
                           placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-background py-3 rounded-lg font-semibold text-sm
                         hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href={`/${lang}/sign-up`} className="text-accent hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
