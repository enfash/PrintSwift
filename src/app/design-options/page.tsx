import DesignOptionSearch from '@/components/design-option-search';

export default function DesignOptionsPage() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading">Design Option Search</h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Use our AI-powered search to discover design ideas. Describe what you're looking for, and let us inspire you.
          </p>
        </div>
        <DesignOptionSearch />
      </div>
    </section>
  );
}
