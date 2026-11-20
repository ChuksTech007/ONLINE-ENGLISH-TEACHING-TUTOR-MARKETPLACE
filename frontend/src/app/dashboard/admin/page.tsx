"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Headphones, Landmark, Shield, Users } from "lucide-react";

type Stats = {
  totalTeachers?: number;
  approvedTeachers?: number;
  pendingTeachers?: number;
  totalStudents?: number;
  totalEnquiries?: number;
  creditSales?: string;
  creditDeductions?: string;
  contactFee?: string;
  openSupportChats?: number;
};

export default function AdminHomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    api<Stats>("/admin/stats").then(setStats);
  }, []);

  return (
    <div>
      <div className="relative overflow-hidden rounded-[1.6rem] bg-[#1a1a1a] p-8 text-cream">
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Independent operations console</p>
        <h1 className="mt-2 font-display text-3xl">Marketplace control</h1>
        <p className="mt-2 max-w-2xl text-sm text-cream/65">
          This workspace is for administrators only. Approve teacher profiles, set the student-contact fee, and audit advertising wallets. Lesson money never appears here.
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Pending teacher reviews", value: stats?.pendingTeachers ?? "—" },
          { label: "Approved teachers", value: stats?.approvedTeachers ?? "—" },
          { label: "Students", value: stats?.totalStudents ?? "—" },
          { label: "Contact fee", value: stats ? `$${stats.contactFee}` : "—" },
          { label: "Credit sales", value: stats ? `$${stats.creditSales}` : "—" },
          { label: "Open support chats", value: stats?.openSupportChats ?? "—" },
        ].map((card) => (
          <div key={card.label} className="rounded-[1.4rem] bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-navy/50">{card.label}</div>
            <div className="mt-2 font-display text-2xl text-navy">{String(card.value)}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {[
          { href: "/dashboard/admin/teachers", label: "Review teacher applications", body: "Approve, reject with a reason, suspend or reactivate.", icon: Users },
          { href: "/dashboard/admin/finance", label: "Advertising finance", body: "Change the contact fee and inspect the credit ledger.", icon: Landmark },
          { href: "/dashboard/admin/support", label: "Customer live chat", body: "Reply to visitors from the public site widget.", icon: Headphones },
          { href: "/trust", label: "Public trust page", body: "How Merit talks about money, safety and advertising credits.", icon: Shield },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card-lift rounded-[1.4rem] bg-white p-5 shadow-sm">
            <item.icon className="h-5 w-5 text-gold" />
            <div className="mt-3 font-medium text-navy">{item.label}</div>
            <p className="mt-1 text-sm text-navy/60">{item.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
