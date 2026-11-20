"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function TeacherAccountPage() {
  const { user, refresh, logout } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    country: user?.country || "",
    timezone: user?.timezone || "UTC",
  });
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/auth/me", { method: "PATCH", body: JSON.stringify(form) });
      await refresh();
      setSaved("Account details saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-navy">Account settings</h1>
        <p className="mt-2 text-sm text-navy/60">{user?.email} · {user?.emailVerified ? "Email verified" : "Email not verified"}</p>
      </div>
      <section className="grid gap-3 rounded-[1.6rem] bg-white p-6 shadow-sm md:grid-cols-2">
        <div>
          <label className="label">First name</label>
          <input className="field" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </div>
        <div>
          <label className="label">Last name</label>
          <input className="field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="label">Country</label>
          <input className="field" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Timezone</label>
          <input className="field" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
        </div>
      </section>
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save account"}
        </button>
        <button
          type="button"
          className="btn-soft"
          onClick={async () => {
            await logout();
            window.location.href = "/become-a-teacher";
          }}
        >
          Log out
        </button>
      </div>
      {saved && <p className="rounded-2xl bg-gold-soft/60 px-4 py-3 text-sm text-navy">{saved}</p>}
    </form>
  );
}
