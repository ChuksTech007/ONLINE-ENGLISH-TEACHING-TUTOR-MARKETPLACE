"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Calendar, Inbox, MessageSquare, Search, Shield, UserRound, Wallet } from "lucide-react";

function label(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, string | number> | null>(null);

  useEffect(() => {
    if (user?.role === "TEACHER") {
      api<Record<string, string | number>>("/teachers/me/dashboard").then(setStats);
    } else if (user?.role === "STUDENT") {
      api<Record<string, string | number>>("/students/me/dashboard").then(setStats);
    } else if (user?.role === "ADMIN") {
      api<Record<string, string | number>>("/admin/stats").then(setStats);
    }
  }, [user]);

  const banner =
    user?.role === "TEACHER"
      ? "/images/teacher-desk.jpg"
      : user?.role === "ADMIN"
        ? "/images/library.jpg"
        : "/images/student-study.jpg";

  const actions =
    user?.role === "TEACHER"
      ? [
          { href: "/dashboard/profile", label: "Edit teaching profile", icon: UserRound },
          { href: "/dashboard/wallet", label: "Buy advertising credits", icon: Wallet },
          { href: "/dashboard/enquiries", label: "Review enquiries", icon: Inbox },
        ]
      : user?.role === "ADMIN"
        ? [
            { href: "/dashboard/admin/teachers", label: "Review teachers", icon: Shield },
            { href: "/dashboard/admin/finance", label: "Advertising finance", icon: Wallet },
          ]
        : [
            { href: "/teachers", label: "Find a teacher", icon: Search },
            { href: "/dashboard/messages", label: "Open messages", icon: MessageSquare },
            { href: "/dashboard/lessons", label: "Upcoming lessons", icon: Calendar },
          ];

  return (
    <div>
      <div className="relative overflow-hidden rounded-[1.6rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner} alt="" className="h-44 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
        <div className="absolute bottom-5 left-6 text-cream">
          <p className="text-xs uppercase tracking-[0.18em] text-gold">
            {user?.role === "ADMIN" ? "Marketplace control" : "Welcome back"}
          </p>
          <h2 className="font-display text-3xl">{user?.firstName}</h2>
        </div>
      </div>

      {user?.role === "TEACHER" && user.teacher?.status !== "APPROVED" && (
        <p className="mt-4 rounded-2xl bg-gold-soft/70 p-4 text-sm text-navy">
          Your profile status is {user.teacher?.status}. It becomes visible in the directory after administrator approval. You can still edit your profile and buy advertising credits.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats &&
          Object.entries(stats).map(([key, value]) => (
            <div key={key} className="rounded-[1.4rem] bg-white p-5 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-navy/45">{label(key)}</div>
              <div className="mt-2 font-display text-2xl text-navy">{String(value)}</div>
            </div>
          ))}
        {!stats &&
          [1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-[1.4rem]" />)}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {actions.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-lift flex items-center gap-3 rounded-[1.4rem] bg-white p-4 shadow-sm"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cream text-navy">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="font-medium text-navy">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
