"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [role, setRole] = useState(params.get("role") === "TEACHER" ? "TEACHER" : "STUDENT");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    phone: "",
  });
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...form, role }),
      });
      await refresh();
      router.push(role === "TEACHER" ? "/dashboard/profile" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-4xl text-navy">Create your account</h1>
      <div className="mt-6 grid grid-cols-2 rounded-full bg-white p-1">
        {["STUDENT", "TEACHER"].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRole(item)}
            className={`rounded-full py-2 text-sm ${role === item ? "bg-navy text-cream" : "text-navy"}`}
          >
            {item === "STUDENT" ? "I want to learn" : "I want to teach"}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-3xl bg-white p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-2xl border border-navy/10 px-4 py-3" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <input className="rounded-2xl border border-navy/10 px-4 py-3" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        </div>
        <input className="w-full rounded-2xl border border-navy/10 px-4 py-3" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="w-full rounded-2xl border border-navy/10 px-4 py-3" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
        <input className="w-full rounded-2xl border border-navy/10 px-4 py-3" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="w-full rounded-2xl border border-navy/10 px-4 py-3" type="password" minLength={8} placeholder="Password (min 8 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button className="w-full rounded-full bg-navy py-3 text-cream">Create account</button>
      </form>
      <p className="mt-4 text-sm text-navy/70">
        Already registered? <Link href="/login">Log in</Link>
      </p>
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
