// Sign out button — client component that calls Better Auth signOut
"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton({ lang }: { lang: string }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push(`/${lang}`);
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-5 py-2.5 border border-error/30 text-error rounded-lg font-semibold text-sm
                 hover:bg-error/10 transition-colors"
    >
      Sign Out
    </button>
  );
}
