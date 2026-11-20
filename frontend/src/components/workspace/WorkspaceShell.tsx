"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

export type WorkspaceLink = { href: string; label: string; icon: LucideIcon };

export function WorkspaceShell({
  tone,
  kicker,
  title,
  subtitle,
  links,
  children,
}: {
  tone: "student" | "teacher" | "admin";
  kicker: string;
  title: string;
  subtitle?: string;
  links: WorkspaceLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const palette =
    tone === "teacher"
      ? {
          frame: "bg-[#071526]",
          header: "from-[#071526] to-[#0b1f3a]",
          kicker: "text-gold",
          aside: "bg-[#0b1f3a] text-cream",
          active: "bg-gold text-navy",
          idle: "text-cream/75 hover:bg-white/10 hover:text-cream",
          logout: "text-cream/45 hover:bg-white/10 hover:text-cream",
        }
      : tone === "admin"
        ? {
            frame: "bg-[#101010]",
            header: "from-[#101010] to-[#1a1a1a]",
            kicker: "text-gold",
            aside: "bg-[#1a1a1a] text-cream",
            active: "bg-cream text-navy",
            idle: "text-cream/70 hover:bg-white/10 hover:text-cream",
            logout: "text-cream/40 hover:bg-white/10 hover:text-cream",
          }
        : {
            frame: "bg-[linear-gradient(180deg,#14325c_0%,#14325c_150px,#f4efe6_150px)]",
            header: "from-[#14325c] to-[#1c4478]",
            kicker: "text-gold-soft",
            aside: "bg-white text-navy",
            active: "bg-navy text-cream",
            idle: "text-navy/75 hover:bg-cream",
            logout: "text-navy/45 hover:bg-cream",
          };

  return (
    <div className={`min-h-[calc(100vh-0px)] ${tone === "student" ? palette.frame : `${palette.frame} text-cream`}`}>
      <div className={`bg-gradient-to-r ${palette.header}`}>
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-5">
          <p className={`text-xs uppercase tracking-[0.18em] ${palette.kicker}`}>{kicker}</p>
          <h1 className="mt-1 font-display text-3xl text-cream">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-cream/60">{subtitle}</p>}
        </div>
      </div>
      <div className={`mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row ${tone === "student" ? "" : "pb-16"}`}>
        <aside className="w-full shrink-0 md:w-64">
          <nav className={`rounded-[1.6rem] p-4 shadow-sm ${palette.aside}`}>
            <div className="flex flex-col gap-1 text-sm">
              {links.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== "/dashboard" &&
                    link.href !== "/dashboard/teacher" &&
                    link.href !== "/dashboard/admin" &&
                    pathname.startsWith(link.href + "/"));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 rounded-full px-3 py-2 ${active ? palette.active : palette.idle}`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              <button
                onClick={async () => {
                  await logout();
                  router.push(tone === "teacher" ? "/become-a-teacher" : tone === "admin" ? "/login/admin" : "/");
                }}
                className={`mt-3 flex items-center gap-2 rounded-full px-3 py-2 text-left ${palette.logout}`}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </nav>
        </aside>
        <section className="min-w-0 flex-1">{children}</section>
      </div>
    </div>
  );
}
