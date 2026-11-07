import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative isolate overflow-hidden bg-navy text-cream">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/library.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-navy/75" />
      <div className="relative mx-auto max-w-xl px-4 py-32 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-gold">404</p>
        <h1 className="mt-3 font-display text-5xl">That page is not on the timetable</h1>
        <p className="mt-4 text-cream/75">The link may be old, or the teacher profile is still waiting for approval.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/teachers" className="btn-gold">
            Find a teacher
          </Link>
          <Link href="/" className="rounded-full border border-cream/30 px-5 py-3">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
