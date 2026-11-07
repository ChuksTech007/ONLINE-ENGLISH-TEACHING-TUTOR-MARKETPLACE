"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherProfileEditor() {
  const [form, setForm] = useState({
    bio: "",
    qualifications: "",
    experienceYears: 0,
    specializations: "",
    levels: "",
    languages: "",
    isNativeSpeaker: false,
    hourlyRate: 10,
    currency: "USD",
    methodology: "",
    city: "",
    country: "",
    preferredPlatform: "ZOOM",
    paymentMethods: "PayPal: your@email.com",
  });
  const [slots, setSlots] = useState<{ dayOfWeek: number; startMinute: number; endMinute: number }[]>([]);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    api<Record<string, unknown>>("/teachers/me").then((data) => {
      setForm({
        bio: String(data.bio || ""),
        qualifications: String(data.qualifications || ""),
        experienceYears: Number(data.experienceYears || 0),
        specializations: ((data.specializations as string[]) || []).join(", "),
        levels: ((data.levels as string[]) || []).join(", "),
        languages: ((data.languages as string[]) || []).join(", "),
        isNativeSpeaker: Boolean(data.isNativeSpeaker),
        hourlyRate: Number(data.hourlyRate || 0),
        currency: String(data.currency || "USD"),
        methodology: String(data.methodology || ""),
        city: String(data.city || ""),
        country: String(data.country || ""),
        preferredPlatform: String(data.preferredPlatform || "ZOOM"),
        paymentMethods: ((data.paymentMethods as { type: string; details: string }[]) || [])
          .map((m) => `${m.type}: ${m.details}`)
          .join("\n"),
      });
      setSlots((data.availability as typeof slots) || []);
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api("/teachers/me", {
      method: "PATCH",
      body: JSON.stringify({
        ...form,
        experienceYears: Number(form.experienceYears),
        hourlyRate: Number(form.hourlyRate),
        specializations: form.specializations.split(",").map((s) => s.trim()).filter(Boolean),
        levels: form.levels.split(",").map((s) => s.trim()).filter(Boolean),
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
        paymentMethods: form.paymentMethods
          .split("\n")
          .map((line) => {
            const [type, ...rest] = line.split(":");
            return { type: type.trim(), details: rest.join(":").trim() };
          })
          .filter((m) => m.type && m.details),
      }),
    });
    await api("/teachers/me/availability", {
      method: "PUT",
      body: JSON.stringify({ slots }),
    });
    setSaved("Profile saved.");
  }

  async function uploadPhoto(file: File) {
    const body = new FormData();
    body.append("file", file);
    await api("/uploads/photo", { method: "POST", body });
    setSaved("Photo uploaded.");
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-3xl bg-white p-6">
      <h1 className="font-display text-3xl text-navy">Teaching profile</h1>
      <input type="file" accept="image/*" onChange={(e) => e.target.files && uploadPhoto(e.target.files[0])} />
      <textarea className="h-28 w-full rounded-2xl border border-navy/10 px-4 py-3" placeholder="Biography" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      <textarea className="h-24 w-full rounded-2xl border border-navy/10 px-4 py-3" placeholder="Qualifications" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} />
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-2xl border border-navy/10 px-4 py-3" type="number" placeholder="Years of experience" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} />
        <input className="rounded-2xl border border-navy/10 px-4 py-3" type="number" placeholder="Hourly rate" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} />
        <input className="rounded-2xl border border-navy/10 px-4 py-3" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className="rounded-2xl border border-navy/10 px-4 py-3" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
      </div>
      <input className="w-full rounded-2xl border border-navy/10 px-4 py-3" placeholder="Specializations, comma separated" value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} />
      <input className="w-full rounded-2xl border border-navy/10 px-4 py-3" placeholder="Levels, comma separated" value={form.levels} onChange={(e) => setForm({ ...form, levels: e.target.value })} />
      <input className="w-full rounded-2xl border border-navy/10 px-4 py-3" placeholder="Languages, comma separated" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isNativeSpeaker} onChange={(e) => setForm({ ...form, isNativeSpeaker: e.target.checked })} />
        Native English speaker
      </label>
      <textarea className="h-24 w-full rounded-2xl border border-navy/10 px-4 py-3" placeholder="Teaching methodology" value={form.methodology} onChange={(e) => setForm({ ...form, methodology: e.target.value })} />
      <select className="w-full rounded-2xl border border-navy/10 px-4 py-3" value={form.preferredPlatform} onChange={(e) => setForm({ ...form, preferredPlatform: e.target.value })}>
        <option value="ZOOM">Zoom</option>
        <option value="GOOGLE_MEET">Google Meet</option>
        <option value="MICROSOFT_TEAMS">Microsoft Teams</option>
      </select>
      <textarea className="h-24 w-full rounded-2xl border border-navy/10 px-4 py-3" placeholder="Payment methods, one per line: PayPal: email" value={form.paymentMethods} onChange={(e) => setForm({ ...form, paymentMethods: e.target.value })} />
      <h2 className="pt-4 font-display text-2xl">Weekly availability</h2>
      {slots.map((slot, i) => (
        <div key={i} className="grid grid-cols-3 gap-2">
          <select className="rounded-2xl border border-navy/10 px-3 py-2" value={slot.dayOfWeek} onChange={(e) => {
            const next = [...slots];
            next[i] = { ...slot, dayOfWeek: Number(e.target.value) };
            setSlots(next);
          }}>
            {DAYS.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
          </select>
          <input className="rounded-2xl border border-navy/10 px-3 py-2" type="time" value={`${String(Math.floor(slot.startMinute / 60)).padStart(2, "0")}:${String(slot.startMinute % 60).padStart(2, "0")}`} onChange={(e) => {
            const [h, m] = e.target.value.split(":").map(Number);
            const next = [...slots];
            next[i] = { ...slot, startMinute: h * 60 + m };
            setSlots(next);
          }} />
          <input className="rounded-2xl border border-navy/10 px-3 py-2" type="time" value={`${String(Math.floor(slot.endMinute / 60)).padStart(2, "0")}:${String(slot.endMinute % 60).padStart(2, "0")}`} onChange={(e) => {
            const [h, m] = e.target.value.split(":").map(Number);
            const next = [...slots];
            next[i] = { ...slot, endMinute: h * 60 + m };
            setSlots(next);
          }} />
        </div>
      ))}
      <button type="button" className="text-sm text-navy" onClick={() => setSlots([...slots, { dayOfWeek: 1, startMinute: 540, endMinute: 720 }])}>
        Add availability slot
      </button>
      <button className="block rounded-full bg-navy px-6 py-3 text-cream">Save profile</button>
      {saved && <p className="text-sm text-navy-800">{saved}</p>}
    </form>
  );
}
