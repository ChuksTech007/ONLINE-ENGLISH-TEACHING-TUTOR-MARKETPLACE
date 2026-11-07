"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminHomePage() {
  const [stats, setStats] = useState<Record<string, string | number> | null>(null);
  useEffect(() => {
    api<Record<string, string | number>>("/admin/stats").then(setStats);
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Marketplace control</h1>
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
