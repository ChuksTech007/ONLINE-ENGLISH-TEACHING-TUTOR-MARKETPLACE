"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

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
      <h1 className="font-display text-3xl text-navy">Finance</h1>
      <form
        className="rounded-3xl bg-white p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          await api("/admin/settings", { method: "PATCH", body: JSON.stringify({ contactFee: Number(fee) }) });
          await load();
        }}
      >
        <h2 className="font-display text-xl">Contact fee</h2>
        <p className="mt-1 text-sm text-navy/60">Applied only to a new student-teacher first contact. Historical deductions stay unchanged.</p>
        <div className="mt-3 flex gap-2">
          <input className="rounded-full border px-4 py-2" value={fee} onChange={(e) => setFee(e.target.value)} />
          <button className="rounded-full bg-navy px-4 py-2 text-cream">Save fee</button>
        </div>
        {settings && <p className="mt-2 text-sm">Negative wallets allowed: {String(settings.allowNegativeWallet)}</p>}
      </form>

      <form
        className="rounded-3xl bg-white p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          await api(`/admin/wallets/${teacherId}/adjust`, {
            method: "POST",
            body: JSON.stringify({ amount: Number(amount), type: "ADMIN_CREDIT", reason }),
          });
          await load();
        }}
      >
        <h2 className="font-display text-xl">Manual wallet credit</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input className="rounded-full border px-4 py-2" placeholder="Teacher profile ID" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} />
          <input className="rounded-full border px-4 py-2" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input className="rounded-full border px-4 py-2" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <button className="mt-3 rounded-full bg-navy px-4 py-2 text-cream">Add credits</button>
      </form>

      <div className="rounded-3xl bg-white p-5">
        <h2 className="font-display text-xl">Packages</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {packages.map((pack) => (
            <li key={pack.id}>{pack.name}: {pack.creditAmount} credits for {pack.price}</li>
          ))}
        </ul>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white">
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
                <td>{tx.type}</td>
                <td>${tx.amount}</td>
                <td>{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
