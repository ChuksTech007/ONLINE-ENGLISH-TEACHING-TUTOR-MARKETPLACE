import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-navy/10 bg-navy text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl">Merit English</div>
          <p className="mt-3 text-sm text-cream/70">
            A professional marketplace connecting English teachers with students worldwide.
          </p>
        </div>
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-gold">Learn</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-cream/80">
            <Link href="/teachers">Find a teacher</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/register">Create a student account</Link>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-gold">Teach</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-cream/80">
            <Link href="/become-a-teacher">Become a teacher</Link>
            <Link href="/register?role=TEACHER">Create a teacher profile</Link>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-gold">Company</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-cream/80">
            <Link href="/about">About us</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-cream/50">
        Teachers keep 100% of lesson fees. Merit earns from advertising credits only.
      </div>
    </footer>
  );
}
