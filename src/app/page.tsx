// Root page — redirects to locale-prefixed route
// Will be replaced by i18n middleware redirect in Task 3
export default function RootPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-5xl text-accent mb-4">
          Collector In Town
        </h1>
        <p className="text-text-secondary text-lg">
          Premium Diecast Models — Coming Soon
        </p>
      </div>
    </div>
  );
}
