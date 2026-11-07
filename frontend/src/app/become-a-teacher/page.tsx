"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";

export default function BecomeTeacherPage() {
  const [fee, setFee] = useState("2.00");
  const [packages, setPackages] = useState<{ name: string; creditAmount: string; price: string; currency: string }[]>([]);
  useEffect(() => {
    api<{ contactFee: string; packages: typeof packages }>("/settings/public")
      .then((d) => {
        setFee(d.contactFee);
        setPackages(d.packages || []);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div>
      <PageHero
        kicker="Teach on Merit"
        title="Are you an English teacher?"
        subtitle="Create your professional profile, connect with students worldwide and grow your teaching business. You decide your prices, schedule and payment arrangements."
        image="/images/teacher-walk.jpg"
      >
        <Link href="/register?role=TEACHER" className="btn-gold">
          Create a teacher account
        </Link>
      </PageHero>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2">
        <Reveal>
          <img src="/images/teacher-desk.jpg" alt="Teacher in a home studio" className="h-full w-full rounded-[2rem] object-cover" />
        </Reveal>
        <Reveal delay={100}>
          <h2 className="font-display text-4xl text-navy">You keep 100% of lesson fees</h2>
          <p className="mt-4 leading-8 text-navy/75">
            Students pay you directly. Merit never takes a commission on teaching income. You buy advertising credits in advance. When a new student contacts you for the first time, the platform deducts the current contact fee (${fee}). Repeat messages from that student are not charged.
          </p>
          <ul className="mt-6 space-y-3 text-navy/80">
            {[
              "You set hourly prices and currencies",
              "You choose Zoom, Google Meet or Teams",
              "You publish PayPal, Wise, bank or mobile-money instructions",
              "Admin reviews your profile before it goes live",
              "Free training is available and never required for approval",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl text-navy">Advertising credit packages</h2>
          <p className="mt-3 max-w-2xl text-navy/70">Credits are not lesson money. They pay for new student contacts only. Administrators can change these packages at any time.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {(packages.length ? packages : [
              { name: "Starter", creditAmount: "5", price: "5", currency: "USD" },
              { name: "Basic", creditAmount: "10", price: "10", currency: "USD" },
              { name: "Professional", creditAmount: "20", price: "20", currency: "USD" },
              { name: "Business", creditAmount: "50", price: "50", currency: "USD" },
            ]).map((pack) => (
              <div key={pack.name} className="rounded-[1.6rem] border border-navy/10 p-5">
                <div className="text-sm text-gold">{pack.name}</div>
                <div className="mt-2 font-display text-3xl text-navy">{pack.currency} {pack.price}</div>
                <div className="mt-1 text-sm text-navy/60">{pack.creditAmount} advertising credits</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Apply, complete your profile, wait for approval"
        body="Most teachers are reviewed on qualifications, photo and lesson information. Training articles are free whenever you want them."
        primary={{ href: "/register?role=TEACHER", label: "Start your teacher profile" }}
        secondary={{ href: "/training", label: "Read free training" }}
      />
    </div>
  );
}
