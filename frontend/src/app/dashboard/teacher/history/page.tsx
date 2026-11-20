"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

type Tx = {
  id: string;
  type: string;
  amount: string;
  previousBalance: string;
  newBalance: string;
  description: string;
  createdAt: string;
};

export default function TeacherHistoryPage() {
  const [txs, setTxs] = useState<Tx[] | null>(null);
  useEffect(() => {
    api<Tx[]>("/wallets/me/transactions").then(setTxs).catch(() => setTxs([]));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Contact and deduction history</h1>
      <p className="mt-2 max-w-2xl text-sm text-navy/70">
        Every recharge and every first-contact deduction is recorded here. Duplicate charges for the same student are blocked by the platform.
      </p>
      {txs === null && <div className="skeleton mt-6 h-48 rounded-[1.6rem]" />}
      {txs && txs.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="No wallet activity yet"
            body="Buy advertising credits when you are ready for new student contacts."
            href="/dashboard/teacher/recharge"
            action="Recharge account"
            image="/images/materials.jpg"
          />
        </div>
      )}
      {txs && txs.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-[1.6rem] bg-white shadow-sm">
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
  );
}
