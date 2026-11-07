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
  const [photoName, setPhotoName] = useState("");

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
    setSaved("Profile saved. An administrator still needs to approve it before it appears in the public directory.");
  }

  async function uploadPhoto(file: File) {
    const body = new FormData();
    body.append("file", file);
    await api("/uploads/photo", { method: "POST", body });
    setPhotoName(file.name);
    setSaved("Photo uploaded.");
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy">Teaching profile</h1>
        <p className="mt-2 text-sm text-navy/60">
          Students compare you in a few seconds. A clear photograph, honest price and specific specializations convert better than a long empty biography.
        </p>
      </div>

      <section className="rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">Photograph</h2>
        <p className="mt-1 text-sm text-navy/55">Use a well-lit head-and-shoulders photo. This is what appears on your public card.</p>
        <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-navy/20 bg-cream px-4 py-4 text-sm text-navy/70">
          <span>{photoName || "Choose a JPEG or PNG"}</span>
          <span className="rounded-full bg-navy px-3 py-1 text-xs text-cream">Upload</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && uploadPhoto(e.target.files[0])}
          />
        </label>
      </section>

      <section className="space-y-3 rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">About you</h2>
        <label className="label">Biography</label>
        <textarea className="field h-28" placeholder="Who you help and how" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <label className="label">Qualifications</label>
        <textarea className="field h-24" placeholder="CELTA, DELTA, degrees, years in the classroom" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} />
        <label className="label">Teaching methodology</label>
        <textarea className="field h-24" placeholder="How a typical lesson runs" value={form.methodology} onChange={(e) => setForm({ ...form, methodology: e.target.value })} />
      </section>

      <section className="space-y-3 rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">Pricing and location</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="label">Years of experience</label>
            <input className="field" type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Hourly rate</label>
            <input className="field" type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">City</label>
            <input className="field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="label">Country</label>
            <input className="field" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm text-navy/80">
          <input type="checkbox" checked={form.isNativeSpeaker} onChange={(e) => setForm({ ...form, isNativeSpeaker: e.target.checked })} />
          Native English speaker
        </label>
      </section>

      <section className="space-y-3 rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">What you teach</h2>
        <label className="label">Specializations (comma separated)</label>
        <input className="field" placeholder="IELTS, Business English, Pronunciation" value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} />
        <label className="label">Levels (comma separated)</label>
        <input className="field" placeholder="Beginner, Intermediate, Advanced" value={form.levels} onChange={(e) => setForm({ ...form, levels: e.target.value })} />
        <label className="label">Languages (comma separated)</label>
        <input className="field" placeholder="English, French" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
        <label className="label">Preferred classroom</label>
        <select className="field" value={form.preferredPlatform} onChange={(e) => setForm({ ...form, preferredPlatform: e.target.value })}>
          <option value="ZOOM">Zoom</option>
          <option value="GOOGLE_MEET">Google Meet</option>
          <option value="MICROSOFT_TEAMS">Microsoft Teams</option>
        </select>
        <label className="label">How students pay you (one per line: Type: details)</label>
        <textarea className="field h-24" value={form.paymentMethods} onChange={(e) => setForm({ ...form, paymentMethods: e.target.value })} />
      </section>

      <section className="space-y-3 rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">Weekly availability</h2>
        {slots.map((slot, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <select
              className="field py-2"
              value={slot.dayOfWeek}
              onChange={(e) => {
                const next = [...slots];
                next[i] = { ...slot, dayOfWeek: Number(e.target.value) };
                setSlots(next);
              }}
            >
              {DAYS.map((d, idx) => (
                <option key={d} value={idx}>
                  {d}
                </option>
              ))}
            </select>
            <input
              className="field py-2"
              type="time"
              value={`${String(Math.floor(slot.startMinute / 60)).padStart(2, "0")}:${String(slot.startMinute % 60).padStart(2, "0")}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                const next = [...slots];
                next[i] = { ...slot, startMinute: h * 60 + m };
                setSlots(next);
              }}
            />
            <input
              className="field py-2"
              type="time"
              value={`${String(Math.floor(slot.endMinute / 60)).padStart(2, "0")}:${String(slot.endMinute % 60).padStart(2, "0")}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                const next = [...slots];
                next[i] = { ...slot, endMinute: h * 60 + m };
                setSlots(next);
              }}
            />
          </div>
        ))}
        <button
          type="button"
          className="text-sm text-navy underline"
          onClick={() => setSlots([...slots, { dayOfWeek: 1, startMinute: 540, endMinute: 720 }])}
        >
          Add availability slot
        </button>
      </section>

      <button className="btn-primary">Save profile</button>
      {saved && <p className="rounded-2xl bg-gold-soft/60 px-4 py-3 text-sm text-navy">{saved}</p>}
    </form>
  );
}
