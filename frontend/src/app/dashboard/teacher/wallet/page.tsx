"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Wallet = { balance: string; totalPurchased: string; totalDeducted: string };

export default function TeacherWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [fee, setFee] = useState("2.00");

  useEffect(() => {
    api<Wallet>("/wallets/me").then(setWallet).catch(() => undefined);
    api<{ contactFee: string }>("/settings/public").then((d) => setFee(d.contactFee)).catch(() => undefined);
  }, []);

  const balance = Number(wallet?.balance ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-navy">Advertising credit balance</h1>
        <p className="mt-2 max-w-2xl text-sm text-navy/70">
          Current student-contact fee: ${fee}. You are charged once per new student. Directory views and follow-up messages are free.
        </p>
      </div>
      {wallet && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.6rem] bg-navy p-6 text-cream">
            <div className="text-sm text-gold">Available credits</div>
            <div className="mt-2 font-display text-4xl">${wallet.balance}</div>
            {balance <= 0 && <p className="mt-3 text-xs text-gold">New chargeable enquiries are paused until you recharge.</p>}
          </div>
          <div className="rounded-[1.6rem] bg-white p-6 shadow-sm">
            <div className="text-sm text-navy/50">Purchased</div>
            <div className="mt-2 font-display text-3xl text-navy">${wallet.totalPurchased}</div>
          </div>
          <div className="rounded-[1.6rem] bg-white p-6 shadow-sm">
            <div className="text-sm text-navy/50">Deducted</div>
            <div className="mt-2 font-display text-3xl text-navy">${wallet.totalDeducted}</div>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/teacher/recharge" className="btn-primary">
          Recharge account
        </Link>
        <Link href="/dashboard/teacher/history" className="btn-soft">
          View contact history
        </Link>
      </div>
    </div>
  );
}
