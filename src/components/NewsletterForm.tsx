// Newsletter signup form — client component because it needs event handlers
"use client";

import type { Dictionary } from "@/app/[lang]/dictionaries";

interface NewsletterFormProps {
  dict: Dictionary;
}

export function NewsletterForm({ dict }: NewsletterFormProps) {
  // Handle form submission — will connect to API route in Task 10
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Submit to newsletter API endpoint
  };

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder={dict.footer.emailPlaceholder}
        className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg
                   text-text-primary text-sm placeholder:text-text-muted
                   focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                   transition-colors"
        required
      />
      <button
        type="submit"
        className="px-5 py-2.5 bg-accent text-background rounded-lg font-medium text-sm
                   hover:bg-accent-hover transition-colors shrink-0"
      >
        {dict.footer.subscribe}
      </button>
    </form>
  );
}
