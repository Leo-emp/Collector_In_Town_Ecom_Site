// Admin login page — uses regular Better Auth sign-in
// If the user is already signed in with an admin account, redirects to dashboard
// Otherwise shows email/password login form
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AdminLoginPage() {
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

    try {
      // Sign in with Better Auth using email/password
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Check if the signed-in user has admin access
      const checkRes = await fetch("/api/admin/check");
      if (checkRes.ok) {
        router.push(`/${lang}/admin`);
        router.refresh();
      } else {
        setError("This account does not have admin access");
        setLoading(false);
      }
    } catch {
      setError("Sign in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl text-text-primary mb-2">
            Admin Access
          </h1>
          <p className="text-text-muted text-sm">
            Sign in with your admin account
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
              placeholder="admin@example.com"
              autoFocus
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
              placeholder="Enter your password"
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
      </div>
    </div>
  );
}
