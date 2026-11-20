"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CreditCard, Inbox, MessageSquare, UserRound } from "lucide-react";

type Dash = {
  profileViews: number;
  newEnquiries: number;
  walletBalance: string;
  totalDeducted: string;
  status: string;
  rejectionReason?: string | null;
  profileCompletion: number;
  slug: string;
  recentMessages: { id: string; body: string; createdAt: string; conversationId: string; from: string }[];
  recentDeductions: { id: string; amount: string; description: string; createdAt: string }[];
  rechargeHistory: { id: string; amount: string; description: string; createdAt: string }[];
};

export default function TeacherHomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Dash | null>(null);

  useEffect(() => {
    api<Dash>("/teachers/me/dashboard").then(setStats).catch(() => undefined);
  }, []);

  const balance = Number(stats?.walletBalance ?? user?.teacher?.walletBalance ?? 0);
  const low = balance > 0 && balance < 4;
  const empty = balance <= 0;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[1.6rem]">
        <img src="/images/teacher-desk.jpg" alt="" className="h-52 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071526] to-transparent" />
        <div className="absolute bottom-5 left-6 right-6 text-cream">
          <p className="text-xs uppercase tracking-[0.18em] text-gold">Independent teaching studio</p>
          <h2 className="font-display text-3xl">Welcome back, {user?.firstName}</h2>
          <p className="mt-1 max-w-xl text-sm text-cream/75">
            Students pay you directly. Merit only deducts a contact fee when a new student writes to you.
          </p>
        </div>
      </div>

      {stats?.status && stats.status !== "APPROVED" && (
        <p className="rounded-2xl bg-gold-soft/80 p-4 text-sm text-navy">
          Profile status: {stats.status.replace("_", " ")}.
          {stats.status === "PENDING" && " An administrator will review it before it appears in the student directory."}
          {stats.status === "REJECTED" && stats.rejectionReason ? ` ${stats.rejectionReason}` : ""}
          {stats.status === "SUSPENDED" && " New chargeable enquiries are paused until an administrator reactivates you."}
        </p>
      )}
      {empty && (
        <p className="rounded-2xl bg-navy p-4 text-sm text-cream">
          Advertising credits are exhausted. Your approved profile can stay visible, but new student contacts are paused until you recharge.
          <Link href="/dashboard/teacher/recharge" className="ml-2 underline text-gold">
            Recharge now
          </Link>
        </p>
      )}
      {low && (
        <p className="rounded-2xl bg-gold-soft/70 p-4 text-sm text-navy">
          Advertising credit is running low (${balance.toFixed(2)}). Top up so new students can still reach you.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Advertising credits", value: stats ? `$${stats.walletBalance}` : "—", href: "/dashboard/teacher/wallet" },
          { label: "Student enquiries", value: stats?.newEnquiries ?? "—", href: "/dashboard/teacher/enquiries" },
          { label: "Profile views", value: stats?.profileViews ?? "—", href: "/dashboard/teacher/preview" },
          { label: "Profile complete", value: stats ? `${stats.profileCompletion}%` : "—", href: "/dashboard/teacher/profile" },
        ].map((card) => (
          <Link key={card.label} href={card.href} className="rounded-[1.4rem] bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-navy/45">{card.label}</div>
            <div className="mt-2 font-display text-3xl text-navy">{String(card.value)}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/dashboard/teacher/profile", label: "Edit profile", icon: UserRound },
          { href: "/dashboard/teacher/recharge", label: "Recharge credits", icon: CreditCard },
          { href: "/dashboard/teacher/messages", label: "View messages", icon: MessageSquare },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card-lift flex items-center gap-3 rounded-[1.4rem] bg-white p-4 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-gold">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="font-medium text-navy">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-[1.6rem] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl text-navy">Recent messages</h3>
            <Link href="/dashboard/teacher/messages" className="text-sm text-navy/50">
              Inbox
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(stats?.recentMessages || []).length === 0 && (
              <p className="text-sm text-navy/55">No student messages yet. Complete your profile so students can find you.</p>
            )}
            {(stats?.recentMessages || []).map((message) => (
              <Link
                key={message.id}
                href={`/dashboard/teacher/messages/${message.conversationId}`}
                className="block rounded-2xl bg-cream px-4 py-3"
              >
                <div className="text-sm font-medium text-navy">{message.from}</div>
                <div className="mt-1 truncate text-sm text-navy/60">{message.body}</div>
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-[1.6rem] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl text-navy">Recent deductions</h3>
            <Link href="/dashboard/teacher/history" className="text-sm text-navy/50">
              Ledger
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(stats?.recentDeductions || []).length === 0 && (
              <p className="text-sm text-navy/55">No contact fees yet. You are charged once per new student.</p>
            )}
            {(stats?.recentDeductions || []).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3 text-sm">
                <span className="text-navy/70">{tx.description}</span>
                <span className="font-medium text-navy">${tx.amount}</span>
              </div>
            ))}
          </div>
          <h4 className="mt-6 text-sm uppercase tracking-wide text-navy/45">Recharge history</h4>
          <div className="mt-3 space-y-2">
            {(stats?.rechargeHistory || []).length === 0 && <p className="text-sm text-navy/55">No recharges yet.</p>}
            {(stats?.rechargeHistory || []).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-sm text-navy/70">
                <span>{tx.description}</span>
                <span>+${tx.amount}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Link
        href="/dashboard/teacher/enquiries"
        className="card-lift flex items-center gap-3 rounded-[1.4rem] bg-white p-4 shadow-sm"
      >
        <Inbox className="h-5 w-5 text-gold" />
        <span className="text-sm text-navy/75">Open student enquiries to reply and arrange lessons on your terms.</span>
      </Link>
    </div>
  );
}
