"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Shield, Users, Landmark } from "lucide-react";

function label(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<Record<string, string | number> | null>(null);
  useEffect(() => {
    api<Record<string, string | number>>("/admin/stats").then(setStats);
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Marketplace control</h1>
      <p className="mt-2 text-sm text-navy/60">
        Approve teachers, set the first-contact fee, and audit advertising wallets. Lesson money never appears here.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats &&
          Object.entries(stats).map(([key, value]) => (
            <div key={key} className="rounded-[1.6rem] bg-white p-5 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-navy/50">{label(key)}</div>
              <div className="mt-2 font-display text-2xl text-navy">{String(value)}</div>
            </div>
          ))}
        {!stats && [1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-[1.6rem]" />)}
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { href: "/dashboard/admin/teachers", label: "Review teacher applications", icon: Users },
          { href: "/dashboard/admin/finance", label: "Advertising finance", icon: Landmark },
          { href: "/trust", label: "Public trust page", icon: Shield },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card-lift flex items-center gap-3 rounded-[1.4rem] bg-white p-4 shadow-sm">
            <item.icon className="h-5 w-5 text-gold" />
            <span className="text-sm font-medium text-navy">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
