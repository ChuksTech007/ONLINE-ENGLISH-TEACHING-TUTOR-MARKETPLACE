"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const PRESETS = [5, 10, 20, 50];

function RechargeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [fee, setFee] = useState("2.00");
  const [custom, setCustom] = useState("5");
  const [selected, setSelected] = useState<number | "custom">(5);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    api<{ contactFee: string }>("/settings/public").then((d) => setFee(d.contactFee)).catch(() => undefined);
    api<{ balance: string }>("/wallets/me").then((d) => setBalance(d.balance)).catch(() => undefined);
  }, []);

  async function buy(amount: number) {
    setBusy(true);
    setError("");
    try {
      const wallet = await api<{ balance: string }>("/wallets/recharge", {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      setBalance(wallet.balance);
      setMessage(`$${amount.toFixed(2)} advertising credits added. Current balance $${wallet.balance}.`);
      await refresh();
      const next = params.get("next");
      if (next) router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recharge failed");
    } finally {
      setBusy(false);
    }
  }

  const amount = selected === "custom" ? Number(custom) : selected;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Advertising credits</p>
        <h1 className="mt-2 font-display text-3xl text-navy">Recharge your account</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/70">
          This is a prepaid student-contact system. The minimum top-up is $5. A configurable fee of ${fee} is deducted when a new student contacts you. Repeat messages from that student are free. Lesson fees never pass through this wallet.
        </p>
      </div>
      {balance && (
        <div className="rounded-[1.6rem] bg-navy p-6 text-cream">
          <div className="text-sm text-gold">Current balance</div>
          <div className="mt-2 font-display text-4xl">${balance}</div>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-5">
        {PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setSelected(value)}
            className={`rounded-[1.4rem] p-5 text-left ${selected === value ? "bg-navy text-cream" : "bg-white text-navy shadow-sm"}`}
          >
            <div className="text-sm opacity-70">Preset</div>
            <div className="mt-1 font-display text-3xl">${value}</div>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSelected("custom")}
          className={`rounded-[1.4rem] p-5 text-left ${selected === "custom" ? "bg-navy text-cream" : "bg-white text-navy shadow-sm"}`}
        >
          <div className="text-sm opacity-70">Custom</div>
          <div className="mt-1 font-display text-2xl">Your amount</div>
        </button>
      </div>
      {selected === "custom" && (
        <div>
          <label className="label">Custom amount (USD, minimum 5)</label>
          <input className="field max-w-xs" type="number" min={5} step="1" value={custom} onChange={(e) => setCustom(e.target.value)} />
        </div>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
      {message && <p className="rounded-2xl bg-gold-soft/60 px-4 py-3 text-sm text-navy">{message}</p>}
      <button className="btn-primary" disabled={busy || !Number.isFinite(amount) || amount < 5} onClick={() => buy(amount)}>
        {busy ? "Adding credits…" : `Add $${Number.isFinite(amount) ? amount.toFixed(2) : "0.00"} in credits`}
      </button>
      <p className="text-xs text-navy/50">
        Credits are applied immediately in this demo. Production will wait for the payment gateway to confirm the charge.
      </p>
    </div>
  );
}

export default function RechargePage() {
  return (
    <Suspense>
      <RechargeForm />
    </Suspense>
  );
}
