"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function PaymentSettingsPage() {
  const [lines, setLines] = useState("PayPal: your@email.com");
  const [processor, setProcessor] = useState(false);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    api<{ paymentMethods?: { type: string; details: string }[] }>("/teachers/me").then((data) => {
      const methods = data.paymentMethods || [];
      setProcessor(methods.some((m) => m.type === "MERIT_PROCESSOR"));
      setLines(
        methods
          .filter((m) => m.type !== "MERIT_PROCESSOR")
          .map((m) => `${m.type}: ${m.details}`)
          .join("\n") || "PayPal: your@email.com",
      );
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const paymentMethods = lines
      .split("\n")
      .map((line) => {
        const [type, ...rest] = line.split(":");
        return { type: type.trim(), details: rest.join(":").trim() };
      })
      .filter((m) => m.type && m.details);
    if (processor) {
      paymentMethods.push({
        type: "MERIT_PROCESSOR",
        details: "Opt in to 10% platform processing when the payment gateway is connected.",
      });
    }
    await api("/teachers/me", { method: "PATCH", body: JSON.stringify({ paymentMethods }) });
    setSaved("Payment settings saved. Direct student payments never attract a Merit commission.");
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-navy">Payment settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-navy/70">
          Two independent arrangements. Advertising credits are separate from lesson money.
        </p>
      </div>
      <section className="rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">Option A — Direct student payments</h2>
        <p className="mt-2 text-sm text-navy/65">
          Students pay you using your preferred method. You keep 100% of teaching fees. Merit does not charge a lesson commission.
        </p>
        <label className="label mt-4">How students pay you (one per line: Type: details)</label>
        <textarea className="field h-32" value={lines} onChange={(e) => setLines(e.target.value)} />
      </section>
      <section className="rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">Option B — Merit English payment processing</h2>
        <p className="mt-2 text-sm text-navy/65">
          Optional. A 10% processing fee applies only to payments actually processed through Merit. Direct payments are never charged this fee. Gateway collection is not live in this demo — your preference is stored for when it is connected.
        </p>
        <label className="mt-4 flex items-start gap-3 text-sm text-navy">
          <input type="checkbox" className="mt-1" checked={processor} onChange={(e) => setProcessor(e.target.checked)} />
          I would like Merit English to process student payments when that service is available (10% processing fee).
        </label>
      </section>
      <button className="btn-primary">Save payment settings</button>
      {saved && <p className="rounded-2xl bg-gold-soft/60 px-4 py-3 text-sm text-navy">{saved}</p>}
    </form>
  );
}
