import Link from "next/link";

export function CtaBand({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-cream">
      <img src="/images/teachers-group.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-navy/80" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-cream/75">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={primary.href} className="btn-gold">
            {primary.label}
          </Link>
          {secondary && (
            <Link href={secondary.href} className="rounded-full border border-cream/30 px-5 py-3 text-cream">
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
