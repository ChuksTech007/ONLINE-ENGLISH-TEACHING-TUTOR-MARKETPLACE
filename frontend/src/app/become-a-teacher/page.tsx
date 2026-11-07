"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function BecomeTeacherPage() {
  const [fee, setFee] = useState("2.00");
  useEffect(() => {
    api<{ contactFee: string }>("/settings/public")
      .then((d) => setFee(d.contactFee))
      .catch(() => undefined);
  }, []);
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl text-navy">Are you an English teacher?</h1>
      <p className="mt-4 text-lg leading-8 text-navy/75">
        Create your professional profile, connect with students worldwide and grow your teaching business. You decide your prices, schedule and payment arrangements.
      </p>
      <div className="mt-8 rounded-3xl bg-white p-6">
        <h2 className="font-display text-2xl text-navy">You keep 100% of lesson fees</h2>
        <p className="mt-3 text-navy/75">
          Students pay you directly. Merit never takes a commission on teaching income. You buy advertising credits in advance. When a new student contacts you for the first time, the platform deducts the current contact fee (${fee}). Repeat messages from that student are not charged.
        </p>
        <Link href="/register?role=TEACHER" className="mt-6 inline-block rounded-full bg-navy px-6 py-3 text-cream">
          Create a teacher account
        </Link>
      </div>
    </div>
  );
}
