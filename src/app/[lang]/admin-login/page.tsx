// Admin login page — single password field to access the admin dashboard
// Lives at /[lang]/admin-login (OUTSIDE the admin layout to avoid redirect loop)
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminLoginPage() {
  // Get current locale from URL params
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();

  // Form state
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Submit the password to the login API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Call the login API endpoint
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      // Redirect to admin dashboard on success
      router.push(`/${lang}/admin`);
      // Refresh server components so the layout picks up the new cookie
      router.refresh();
    } else {
      // Show error message from API
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl text-text-primary mb-2">
            Admin Access
          </h1>
          <p className="text-text-muted text-sm">
            Enter the admin password to continue
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-6 space-y-5">
          {/* Error message */}
          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Password input */}
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
              placeholder="Enter admin password"
              autoFocus
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-background py-3 rounded-lg font-semibold text-sm
                       hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
