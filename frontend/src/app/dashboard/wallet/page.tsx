"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Wallet = { balance: string; totalPurchased: string; totalDeducted: string };
type Pack = { id: string; name: string; creditAmount: string | number; price: string | number; currency: string };
type Tx = { id: string; type: string; amount: string; previousBalance: string; newBalance: string; description: string; reference: string; createdAt: string; enquiryId?: string | null };

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [packages, setPackages] = useState<Pack[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const [w, p, t] = await Promise.all([
      api<Wallet>("/wallets/me"),
      api<Pack[]>("/wallets/packages"),
      api<Tx[]>("/wallets/me/transactions"),
    ]);
    setWallet(w);
    setPackages(p);
    setTxs(t);
  }

  useEffect(() => {
    load();
  }, []);

  async function buy(packageId: string) {
    await api("/wallets/purchase", { method: "POST", body: JSON.stringify({ packageId }) });
    setMessage("Credits added after verified purchase.");
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-navy">Advertising wallet</h1>
      <p className="text-navy/70">
        Credits pay for new student contacts only. Profile views are free. Repeat messages from the same student are free.
      </p>
      {wallet && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-navy p-5 text-cream">
            <div className="text-sm text-gold">Current balance</div>
            <div className="mt-2 font-display text-4xl">${wallet.balance}</div>
          </div>
          <div className="rounded-3xl bg-white p-5">
            <div className="text-sm text-navy/50">Purchased</div>
            <div className="mt-2 font-display text-3xl text-navy">${wallet.totalPurchased}</div>
          </div>
          <div className="rounded-3xl bg-white p-5">
            <div className="text-sm text-navy/50">Deducted</div>
            <div className="mt-2 font-display text-3xl text-navy">${wallet.totalDeducted}</div>
          </div>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-4">
        {packages.map((pack) => (
          <button key={pack.id} onClick={() => buy(pack.id)} className="rounded-3xl bg-white p-5 text-left">
            <div className="font-display text-xl text-navy">{pack.name}</div>
            <div className="mt-2 text-sm text-navy/60">{pack.creditAmount} credits</div>
            <div className="mt-4 text-navy">{pack.currency} {pack.price}</div>
          </button>
        ))}
      </div>
      {message && <p className="text-sm">{message}</p>}
      <div className="overflow-x-auto rounded-3xl bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-navy/10 text-navy/50">
              <th className="p-4">Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx.id} className="border-b border-navy/5">
                <td className="p-4">{new Date(tx.createdAt).toLocaleString()}</td>
                <td>{tx.type}</td>
                <td>${tx.amount}</td>
                <td>${tx.previousBalance} → ${tx.newBalance}</td>
                <td>{tx.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
