"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

const studentLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/teachers", label: "Find teachers" },
  { href: "/dashboard/enquiries", label: "Enquiries" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/lessons", label: "Lessons" },
];

const teacherLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/wallet", label: "Advertising wallet" },
  { href: "/dashboard/enquiries", label: "Enquiries" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/lessons", label: "Lessons" },
];

const adminLinks = [
  { href: "/dashboard/admin", label: "Admin home" },
  { href: "/dashboard/admin/teachers", label: "Teachers" },
  { href: "/dashboard/admin/finance", label: "Finance" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push("/login?next=/dashboard");
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="px-4 py-16 text-center">Loading your dashboard…</div>;
  }

  const links =
    user.role === "ADMIN" ? adminLinks : user.role === "TEACHER" ? teacherLinks : studentLinks;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row">
      <aside className="w-full shrink-0 md:w-56">
        <div className="rounded-3xl bg-white p-5">
          <div className="text-sm text-navy/50">{user.role.toLowerCase()}</div>
          <div className="font-display text-xl text-navy">
            {user.firstName} {user.lastName}
          </div>
          <nav className="mt-5 flex flex-col gap-2 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-2 ${pathname === link.href ? "bg-navy text-cream" : "text-navy/80 hover:bg-cream"}`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="mt-3 rounded-full px-3 py-2 text-left text-navy/60"
            >
              Log out
            </button>
          </nav>
        </div>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
