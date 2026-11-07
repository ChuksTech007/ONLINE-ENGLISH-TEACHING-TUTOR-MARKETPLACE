"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

type Wallet = { balance: string; totalPurchased: string; totalDeducted: string };
type Pack = { id: string; name: string; creditAmount: string | number; price: string | number; currency: string };
type Tx = {
  id: string;
  type: string;
  amount: string;
  previousBalance: string;
  newBalance: string;
  description: string;
  reference: string;
  createdAt: string;
  enquiryId?: string | null;
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [packages, setPackages] = useState<Pack[]>([]);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [message, setMessage] = useState("");
  const [buying, setBuying] = useState<string | null>(null);

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
    setBuying(packageId);
    try {
      await api("/wallets/purchase", { method: "POST", body: JSON.stringify({ packageId }) });
      setMessage("Credits added to your wallet. In production this follows a verified card payment.");
      await load();
    } finally {
      setBuying(null);
    }
  }

  const featured = packages.find((p) => String(p.name).toLowerCase().includes("professional"))?.id
    || packages[Math.max(0, packages.length - 2)]?.id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-navy">Advertising wallet</h1>
        <p className="mt-2 max-w-2xl text-navy/70">
          Credits pay for new student contacts only. Profile views are free. Repeat messages from the same student are free. Lesson fees never pass through this wallet.
        </p>
      </div>
      {wallet && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.6rem] bg-navy p-6 text-cream">
            <div className="text-sm text-gold">Current balance</div>
            <div className="mt-2 font-display text-4xl">${wallet.balance}</div>
            <p className="mt-3 text-xs text-cream/55">Enough for new first contacts at the current admin-set fee.</p>
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
      <div>
        <h2 className="font-display text-2xl text-navy">Credit packages</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {packages.map((pack) => (
            <button
              key={pack.id}
              onClick={() => buy(pack.id)}
              disabled={buying === pack.id}
              className={`card-lift rounded-[1.6rem] p-5 text-left ${
                pack.id === featured ? "bg-navy text-cream" : "bg-white text-navy shadow-sm"
              }`}
            >
              {pack.id === featured && <div className="mb-2 text-xs uppercase tracking-wide text-gold">Most chosen</div>}
              <div className="font-display text-xl">{pack.name}</div>
              <div className={`mt-2 text-sm ${pack.id === featured ? "text-cream/70" : "text-navy/60"}`}>
                {pack.creditAmount} credits
              </div>
              <div className="mt-4 text-lg">
                {pack.currency} {pack.price}
              </div>
            </button>
          ))}
        </div>
      </div>
      {message && <p className="rounded-2xl bg-gold-soft/60 px-4 py-3 text-sm text-navy">{message}</p>}
      <div>
        <h2 className="font-display text-2xl text-navy">Ledger</h2>
        {txs.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No wallet activity yet"
              body="Buy a credit pack when you are ready for new student contacts. Organic directory listing does not use this balance."
              image="/images/materials.jpg"
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-[1.6rem] bg-white shadow-sm">
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
                    <td>
                      <StatusBadge value={tx.type} />
                    </td>
                    <td>${tx.amount}</td>
                    <td>
                      ${tx.previousBalance} → ${tx.newBalance}
                    </td>
                    <td className="pr-4 text-navy/70">{tx.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
