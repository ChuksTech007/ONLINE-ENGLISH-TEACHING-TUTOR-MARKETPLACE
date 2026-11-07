"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

type Tx = {
  id: string;
  type: string;
  amount: string;
  description: string;
  createdAt: string;
  teacher: { name: string };
};
type Pack = { id: string; name: string; creditAmount: string; price: string; active: boolean };
type Settings = { contactFee: string; allowNegativeWallet: boolean };

export default function AdminFinancePage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [packages, setPackages] = useState<Pack[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [fee, setFee] = useState("2");
  const [teacherId, setTeacherId] = useState("");
  const [amount, setAmount] = useState("10");
  const [reason, setReason] = useState("Promotional credit");
  const [saved, setSaved] = useState("");

  async function load() {
    const [t, p, s] = await Promise.all([
      api<Tx[]>("/admin/transactions"),
      api<Pack[]>("/admin/packages"),
      api<Settings>("/admin/settings"),
    ]);
    setTxs(t);
    setPackages(p);
    setSettings(s);
    setFee(String(s.contactFee));
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy">Advertising finance</h1>
        <p className="mt-2 text-sm text-navy/60">
          This ledger is advertising credit only. Lesson fees are paid privately between student and teacher.
        </p>
      </div>
      <form
        className="rounded-[1.6rem] bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          await api("/admin/settings", { method: "PATCH", body: JSON.stringify({ contactFee: Number(fee) }) });
          setSaved("Contact fee updated. Historical deductions stay unchanged.");
          await load();
        }}
      >
        <h2 className="font-display text-xl text-navy">First-contact fee</h2>
        <p className="mt-1 text-sm text-navy/60">
          Applied only to a new student–teacher first contact. Repeat messages and profile views are never charged.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <input className="field max-w-40" value={fee} onChange={(e) => setFee(e.target.value)} />
          <button className="btn-primary py-2">Save fee</button>
        </div>
        {settings && (
          <p className="mt-3 text-sm text-navy/55">Negative wallets allowed: {String(settings.allowNegativeWallet)}</p>
        )}
      </form>

      <form
        className="rounded-[1.6rem] bg-white p-6 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          await api(`/admin/wallets/${teacherId}/adjust`, {
            method: "POST",
            body: JSON.stringify({ amount: Number(amount), type: "ADMIN_CREDIT", reason }),
          });
          setSaved("Manual credit recorded on the teacher ledger.");
          await load();
        }}
      >
        <h2 className="font-display text-xl text-navy">Manual wallet credit</h2>
        <p className="mt-1 text-sm text-navy/60">Use this for promotions, goodwill or reversing a disputed deduction.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="label">Teacher profile ID</label>
            <input className="field" placeholder="clxxxxxxxx" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} />
          </div>
          <div>
            <label className="label">Amount</label>
            <input className="field" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="label">Reason</label>
            <input className="field" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        </div>
        <button className="btn-primary mt-4 py-2">Add credits</button>
      </form>

      <div className="rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl text-navy">Packages on sale</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {packages.map((pack) => (
            <li key={pack.id} className="rounded-2xl bg-cream px-4 py-3 text-sm text-navy">
              <span className="font-medium">{pack.name}</span>
              <span className="text-navy/60">
                {" "}
                · {pack.creditAmount} credits for {pack.price}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {saved && <p className="rounded-2xl bg-gold-soft/60 px-4 py-3 text-sm text-navy">{saved}</p>}

      <div className="overflow-x-auto rounded-[1.6rem] bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-navy/10 text-navy/50">
              <th className="p-4">When</th>
              <th>Teacher</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx.id} className="border-b border-navy/5">
                <td className="p-4">{new Date(tx.createdAt).toLocaleString()}</td>
                <td>{tx.teacher.name}</td>
                <td>
                  <StatusBadge value={tx.type} />
                </td>
                <td>${tx.amount}</td>
                <td className="pr-4 text-navy/70">{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
