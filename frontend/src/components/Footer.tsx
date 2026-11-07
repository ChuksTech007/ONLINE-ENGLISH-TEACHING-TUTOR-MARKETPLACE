import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto bg-navy text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gold font-display text-lg text-navy">M</span>
            <span className="font-display text-2xl">Merit English</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-cream/70">
            A professional marketplace connecting English teachers with students worldwide. Teachers keep 100% of lesson fees. Merit earns from advertising credits only.
          </p>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Learn</div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-cream/80">
            <Link href="/teachers">Find a teacher</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/register">Create a student account</Link>
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Teach</div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-cream/80">
            <Link href="/become-a-teacher">Become a teacher</Link>
            <Link href="/training">Free teacher training</Link>
            <Link href="/register?role=TEACHER">Create a teacher profile</Link>
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-gold">Company</div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-cream/80">
            <Link href="/about">About us</Link>
            <Link href="/trust">Trust and safety</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-cream/45">
        Profile views are free. Only a new student contact uses advertising credit. Lessons happen on Zoom, Google Meet or Teams.
      </div>
    </footer>
  );
}
