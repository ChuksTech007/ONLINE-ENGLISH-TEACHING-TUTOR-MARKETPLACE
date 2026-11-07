"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Record<string, string | number> | null>(null);

  useEffect(() => {
    if (user?.role === "TEACHER") {
      api<Record<string, string | number>>("/teachers/me/dashboard").then(setStats);
    } else if (user?.role === "STUDENT") {
      api<Record<string, string | number>>("/students/me/dashboard").then(setStats);
    } else if (user?.role === "ADMIN") {
      api<Record<string, string | number>>("/admin/stats").then(setStats);
    }
  }, [user]);

  if (user?.role === "ADMIN") {
    return (
      <div>
        <h1 className="font-display text-3xl text-navy">Administrator overview</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats &&
            Object.entries(stats).map(([key, value]) => (
              <div key={key} className="rounded-3xl bg-white p-5">
                <div className="text-xs uppercase tracking-wide text-navy/50">{key}</div>
                <div className="mt-2 font-display text-2xl text-navy">{String(value)}</div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Welcome back, {user?.firstName}</h1>
      {user?.role === "TEACHER" && user.teacher?.status !== "APPROVED" && (
        <p className="mt-4 rounded-2xl bg-gold-soft/60 p-4 text-sm">
          Your profile status is {user.teacher?.status}. It becomes visible in the directory after administrator approval.
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats &&
          Object.entries(stats).map(([key, value]) => (
            <div key={key} className="rounded-3xl bg-white p-5">
              <div className="text-xs uppercase tracking-wide text-navy/50">{key}</div>
              <div className="mt-2 font-display text-2xl text-navy">{String(value)}</div>
            </div>
          ))}
      </div>
    </div>
  );
}
