"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PasswordField } from "@/components/PasswordField";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
    country: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (params.get("role") === "TEACHER") router.replace("/register/teacher");
  }, [params, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { confirm: _confirm, ...payload } = form;
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...payload, role: "STUDENT" }),
      });
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[70vh] md:grid-cols-2">
      <div className="relative hidden md:block">
        <img src="/images/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-navy/50" />
        <div className="absolute bottom-10 left-10 right-10 text-cream">
          <p className="font-display text-4xl">Start with the right teacher.</p>
          <p className="mt-3 max-w-md text-cream/75">Create a free student account. Contacting a teacher never costs you money on Merit.</p>
        </div>
      </div>
      <div className="px-6 py-12">
        <div className="mx-auto w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.18em] text-gold">Student registration</p>
          <h1 className="mt-2 font-display text-4xl text-navy">Create your account</h1>
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="field" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <input className="field" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <input className="field" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="field" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
            <input className="field" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? "Creating account…" : "Create student account"}
            </button>
          </form>
          <p className="mt-4 text-sm text-navy/70">
            Already registered? <Link href="/login">Student login</Link>
          </p>
          <p className="mt-2 text-sm text-navy/55">
            Want to teach? <Link href="/become-a-teacher">Teach on Merit English</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
