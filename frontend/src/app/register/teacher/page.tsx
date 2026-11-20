"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PasswordField } from "@/components/PasswordField";

export default function TeacherRegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!terms || !privacy) {
      setError("Accept the Terms and Conditions and the Privacy Policy to continue.");
      return;
    }
    setBusy(true);
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: "TEACHER",
        }),
      });
      await refresh();
      router.push("/dashboard/teacher/verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[70vh] md:grid-cols-2">
      <div className="relative hidden md:block">
        <img src="/images/teacher-walk.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-navy/55" />
        <div className="absolute bottom-10 left-10 right-10 text-cream">
          <p className="text-xs uppercase tracking-[0.18em] text-gold">Join as a teacher</p>
          <p className="mt-3 font-display text-4xl">Teach independently. Keep 100% of your earnings.</p>
          <p className="mt-3 max-w-md text-cream/75">
            After you create this account you will confirm your email, add advertising credits from $5, then build your profile.
          </p>
        </div>
      </div>
      <div className="px-6 py-12">
        <div className="mx-auto w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.18em] text-gold">Teacher registration</p>
          <h1 className="mt-2 font-display text-4xl text-navy">Get started</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <input className="field" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <input className="field" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <PasswordField
              value={form.password}
              onChange={(password) => setForm({ ...form, password })}
              placeholder="Password (min 8 characters)"
              minLength={8}
              required
              autoComplete="new-password"
            />
            <PasswordField
              value={form.confirm}
              onChange={(confirm) => setForm({ ...form, confirm })}
              placeholder="Confirm password"
              minLength={8}
              required
              autoComplete="new-password"
            />
            <label className="flex items-start gap-2 text-sm text-navy/75">
              <input type="checkbox" className="mt-1" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              <span>
                I accept the{" "}
                <Link href="/terms" className="underline">
                  Terms and Conditions
                </Link>
                .
              </span>
            </label>
            <label className="flex items-start gap-2 text-sm text-navy/75">
              <input type="checkbox" className="mt-1" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} />
              <span>
                I accept the{" "}
                <Link href="/privacy" className="underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? "Creating teacher account…" : "Create teacher account"}
            </button>
          </form>
          <p className="mt-4 text-sm text-navy/70">
            Already have a teacher account? <Link href="/login/teacher">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
