"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { dashboardHome } from "@/lib/paths";
import { PasswordField } from "@/components/PasswordField";

const copy = {
  STUDENT: {
    kicker: "Student login",
    title: "Welcome back",
    body: "Your teachers, messages and upcoming lessons are waiting in your student studio.",
    image: "/images/student-study.jpg",
    registerHref: "/register",
    registerLabel: "Create a student account",
    demo: [{ role: "Student", email: "nina.chen@merit.test" }],
  },
  TEACHER: {
    kicker: "Teacher login",
    title: "Enter your teaching studio",
    body: "Advertising credits, student enquiries and your public profile live here — separate from the student marketplace.",
    image: "/images/teacher-desk.jpg",
    registerHref: "/register/teacher",
    registerLabel: "Join as a teacher",
    demo: [{ role: "Teacher", email: "amara.okafor@merit.test" }],
  },
  ADMIN: {
    kicker: "Administrator",
    title: "Operations console",
    body: "Approve teachers, set the contact fee and audit advertising wallets.",
    image: "/images/library.jpg",
    registerHref: "/",
    registerLabel: "Back to Merit English",
    demo: [{ role: "Admin", email: "admin@merit.test" }],
  },
};

export function AuthPortal({ portal }: { portal: "STUDENT" | "TEACHER" | "ADMIN" }) {
  return (
    <Suspense>
      <LoginForm portal={portal} />
    </Suspense>
  );
}

function LoginForm({ portal }: { portal: "STUDENT" | "TEACHER" | "ADMIN" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const text = copy[portal];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api<{ user: { role: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res.user.role !== portal) {
        await logout();
        setError(
          portal === "TEACHER"
            ? "This login is for teachers. Students use the student login. Administrators use the operations login."
            : portal === "ADMIN"
              ? "This login is for administrators only."
              : "This login is for students. Teachers use the teacher studio login.",
        );
        return;
      }
      await refresh();
      const next = params.get("next");
      router.push(next || dashboardHome(res.user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-[70vh] md:grid-cols-2">
      <div className="relative hidden md:block">
        <img src={text.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-navy/55" />
        <div className="absolute bottom-10 left-10 right-10 text-cream">
          <p className="text-xs uppercase tracking-[0.18em] text-gold">{text.kicker}</p>
          <p className="mt-3 font-display text-4xl">{text.title}</p>
          <p className="mt-3 max-w-md text-cream/75">{text.body}</p>
        </div>
      </div>
      <div className="flex items-center px-6 py-16">
        <div className="mx-auto w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.18em] text-gold">{text.kicker}</p>
          <h1 className="mt-2 font-display text-4xl text-navy">Log in</h1>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <input className="field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            <PasswordField value={password} onChange={setPassword} placeholder="Password" required autoComplete="current-password" />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? "Signing in…" : "Continue"}
            </button>
            <p className="text-center text-xs text-navy/45">The first sign-in after idle can take up to a minute while the API starts.</p>
          </form>
          <div className="mt-8 rounded-[1.4rem] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-navy/45">Demo · Password123!</p>
            <div className="mt-3 grid gap-2">
              {text.demo.map((item) => (
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
            {portal === "ADMIN" ? (
              <Link href="/" className="text-navy underline">
                {text.registerLabel}
              </Link>
            ) : (
              <>
                New here?{" "}
                <Link href={text.registerHref} className="text-navy underline">
                  {text.registerLabel}
                </Link>
              </>
            )}
          </p>
          {portal === "STUDENT" && (
            <p className="mt-2 text-sm text-navy/55">
              Teacher? <Link href="/login/teacher">Open the teacher studio</Link>
            </p>
          )}
          {portal === "TEACHER" && (
            <p className="mt-2 text-sm text-navy/55">
              Student? <Link href="/login">Student login</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
