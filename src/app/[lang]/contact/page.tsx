// Contact page — contact info and form
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "../dictionaries";

export const metadata = { title: "Contact Us — Collector In Town" };

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-text-primary mb-6">
        {dict.footer.contact}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-text-primary font-semibold mb-2">Get in Touch</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Have questions about a model or your order? We&apos;re here to help.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-text-primary text-sm font-medium">Email</p>
                <p className="text-text-secondary text-sm">hello@collectorintown.com</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-text-primary text-sm font-medium">Phone</p>
                <p className="text-text-secondary text-sm">09-xxx-xxx-xxx</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-text-primary text-sm font-medium">Location</p>
                <p className="text-text-secondary text-sm">Yangon, Myanmar</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-text-muted text-xs">Business Hours: Mon–Sat, 9:00 AM – 6:00 PM (MMT)</p>
          </div>
        </div>

        {/* Contact form placeholder */}
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-text-primary font-semibold">Send a Message</h2>
          <div>
            <label className="text-text-secondary text-sm block mb-1.5">Name</label>
            <input type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-text-secondary text-sm block mb-1.5">Email</label>
            <input type="email" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-text-secondary text-sm block mb-1.5">Message</label>
            <textarea className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent resize-none h-28" />
          </div>
          <button className="w-full py-3 bg-accent text-background rounded-lg font-semibold hover:bg-accent-hover transition-colors">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
