"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function TeacherVerifyPage() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await api("/auth/verify/complete", { method: "POST" });
      await refresh();
      router.push("/dashboard/teacher/recharge?next=/dashboard/teacher/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm email");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError("");
    try {
      await api("/auth/verify/resend", { method: "POST" });
      setMessage("A new verification notice was recorded. Continue below to activate this account.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend");
    }
  }

  return (
    <div className="rounded-[1.6rem] bg-white p-8 shadow-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-gold">Step 1 of 3</p>
      <h1 className="mt-2 font-display text-3xl text-navy">Confirm your email</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-navy/70">
        We sent a verification link to <strong>{user?.email}</strong>. Confirm the address so you can add advertising credits and build your teacher profile.
      </p>
      <p className="mt-4 rounded-2xl bg-cream px-4 py-3 text-sm text-navy/70">
        This demo does not send a live mailbox message. Use Continue to mark the address as verified, then recharge from $5.
      </p>
      {message && <p className="mt-3 text-sm text-navy">{message}</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn-primary" disabled={busy} onClick={confirm}>
          {busy ? "Confirming…" : "Continue to advertising credits"}
        </button>
        <button className="btn-soft" type="button" onClick={resend}>
          Resend verification
        </button>
      </div>
    </div>
  );
}
