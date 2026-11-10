"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PasswordField } from "@/components/PasswordField";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await api<{ user: { role: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      const next = params.get("next");
      if (next) router.push(next);
      else if (res.user.role === "ADMIN") router.push("/dashboard/admin");
      else router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="grid min-h-[70vh] md:grid-cols-2">
      <div className="relative hidden md:block">
        <img src="/images/library.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-navy/55" />
        <div className="absolute bottom-10 left-10 right-10 text-cream">
          <p className="font-display text-4xl">Welcome back to Merit.</p>
          <p className="mt-3 max-w-md text-cream/75">Your teachers, messages and upcoming lessons are waiting in the dashboard.</p>
        </div>
      </div>
      <div className="flex items-center px-6 py-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-4xl text-navy">Log in</h1>
          <p className="mt-2 text-sm text-navy/60">Students, teachers and administrators use the same door.</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <PasswordField
              value={password}
              onChange={setPassword}
              placeholder="Password"
              required
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button className="btn-primary w-full">Continue</button>
          </form>
          <div className="mt-8 rounded-[1.4rem] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-navy/45">Demo accounts · Password123!</p>
            <div className="mt-3 grid gap-2">
              {[
                { role: "Student", email: "nina.chen@merit.test" },
                { role: "Teacher", email: "amara.okafor@merit.test" },
                { role: "Admin", email: "admin@merit.test" },
              ].map((item) => (
                <button
                  key={item.email}
                  type="button"
                  className="flex items-center justify-between rounded-full bg-cream px-4 py-2 text-left text-sm text-navy"
                  onClick={() => {
                    setEmail(item.email);
                    setPassword("Password123!");
                  }}
                >
                  <span>{item.role}</span>
                  <span className="text-navy/50">{item.email}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-5 text-sm text-navy/70">
            New here? <Link href="/register" className="text-navy underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
