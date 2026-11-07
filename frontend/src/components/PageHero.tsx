export function PageHero({
  kicker,
  title,
  subtitle,
  image,
  children,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  image: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-cream">
      <img src={image} alt="" className="kenburns absolute inset-0 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
        {kicker && (
          <p className="reveal text-sm uppercase tracking-[0.22em] text-gold">{kicker}</p>
        )}
        <h1 className="reveal reveal-d1 mt-4 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="reveal reveal-d2 mt-5 max-w-2xl text-lg leading-8 text-cream/80">{subtitle}</p>
        )}
        {children && <div className="reveal reveal-d3 mt-8">{children}</div>}
      </div>
    </section>
  );
}
