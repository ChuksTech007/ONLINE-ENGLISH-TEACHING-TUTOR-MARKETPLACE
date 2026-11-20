"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Calendar, Inbox, MessageSquare, Search } from "lucide-react";

type Stats = {
  enquiries?: number;
  upcomingLessons?: number;
  completedLessons?: number;
  teachers?: number;
};

export default function StudentHomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>("/students/me/dashboard").then(setStats).catch(() => setStats({}));
  }, []);

  const cards = [
    { label: "Teachers contacted", value: stats?.teachers ?? "—", href: "/teachers" },
    { label: "Open enquiries", value: stats?.enquiries ?? "—", href: "/dashboard/enquiries" },
    { label: "Upcoming lessons", value: stats?.upcomingLessons ?? "—", href: "/dashboard/lessons" },
    { label: "Completed lessons", value: stats?.completedLessons ?? "—", href: "/dashboard/lessons" },
  ];

  return (
    <div>
      <div className="relative overflow-hidden rounded-[1.6rem]">
        <img src="/images/student-study.jpg" alt="" className="h-52 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14325c] to-transparent" />
        <div className="absolute bottom-5 left-6 text-cream">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-soft">Your learning studio</p>
          <h2 className="font-display text-3xl">Hello, {user?.firstName}</h2>
          <p className="mt-1 max-w-md text-sm text-cream/75">
            Browse teachers, send a free enquiry, then arrange lessons and pay your teacher directly.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-[1.4rem] bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-navy/45">{card.label}</div>
            <div className="mt-2 font-display text-3xl text-navy">{String(card.value)}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { href: "/teachers", label: "Find a teacher", body: "Filter by price, country and specialisation.", icon: Search },
          { href: "/dashboard/messages", label: "Open messages", body: "Keep lesson times and meeting links in one thread.", icon: MessageSquare },
          { href: "/dashboard/lessons", label: "Upcoming lessons", body: "Join Zoom, Meet or Teams from your schedule.", icon: Calendar },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="card-lift rounded-[1.4rem] bg-white p-5 shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cream text-navy">
              <item.icon className="h-5 w-5" />
            </span>
            <div className="mt-3 font-medium text-navy">{item.label}</div>
            <p className="mt-1 text-sm text-navy/60">{item.body}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-[1.6rem] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Inbox className="mt-1 h-5 w-5 text-gold" />
          <div>
            <h3 className="font-display text-2xl text-navy">Contacting a teacher is free for you</h3>
            <p className="mt-2 text-sm leading-7 text-navy/70">
              Merit never charges students for messages. Lesson fees are paid to the teacher using the method on their profile. You keep the relationship — Merit only helps you find them.
            </p>
            <Link href="/teachers" className="btn-primary mt-4">
              Browse the directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
