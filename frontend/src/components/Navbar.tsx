"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const links = [
  { href: "/teachers", label: "Find a teacher" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/become-a-teacher", label: "Become a teacher" },
  { href: "/training", label: "Teacher training" },
  { href: "/about", label: "About" },
  { href: "/trust", label: "Trust" },
];

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dash = user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-navy font-display text-lg text-gold">M</span>
          <span>
            <span className="block font-display text-xl leading-none text-navy">Merit</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-navy/55">English</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition ${pathname === link.href || pathname.startsWith(link.href + "/") ? "font-medium text-navy" : "text-navy/65 hover:text-navy"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <Link href={dash} className="btn-primary py-2">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-navy/80 hover:text-navy">
                Log in
              </Link>
              <Link href="/register" className="btn-primary py-2">
                Register
              </Link>
            </>
          )}
        </div>
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-navy/10 bg-cream px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3 text-navy">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <Link href={dash} onClick={() => setOpen(false)}>Dashboard</Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
                <Link href="/register" onClick={() => setOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
