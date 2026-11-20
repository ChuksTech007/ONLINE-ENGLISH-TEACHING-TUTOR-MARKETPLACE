"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { TEACHER_SPECIALIZATIONS } from "@/lib/specializations";

type Form = {
  firstName: string;
  lastName: string;
  bio: string;
  qualifications: string;
  experienceYears: number;
  specializations: string[];
  extraSpecialization: string;
  levels: string;
  languages: string;
  isNativeSpeaker: boolean;
  hourlyRate: number;
  groupRate: string;
  lessonDuration: string;
  currency: string;
  methodology: string;
  city: string;
  country: string;
  preferredPlatform: string;
  introVideoUrl: string;
};

const empty: Form = {
  firstName: "",
  lastName: "",
  bio: "",
  qualifications: "",
  experienceYears: 0,
  specializations: [],
  extraSpecialization: "",
  levels: "",
  languages: "",
  isNativeSpeaker: false,
  hourlyRate: 10,
  groupRate: "",
  lessonDuration: "60",
  currency: "USD",
  methodology: "",
  city: "",
  country: "",
  preferredPlatform: "ZOOM",
  introVideoUrl: "",
};

export default function TeacherProfilePage() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState<Form>(empty);
  const [saved, setSaved] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Record<string, unknown>>("/teachers/me").then((data) => {
      const specs = ((data.specializations as string[]) || []).filter(Boolean);
      const known = specs.filter((s) => TEACHER_SPECIALIZATIONS.includes(s));
      const extra = specs.filter((s) => !TEACHER_SPECIALIZATIONS.includes(s));
      setForm({
        firstName: String(data.firstName || user?.firstName || ""),
        lastName: String(data.lastName || user?.lastName || ""),
        bio: String(data.bio || ""),
        qualifications: String(data.qualifications || ""),
        experienceYears: Number(data.experienceYears || 0),
        specializations: known,
        extraSpecialization: extra.join(", "),
        levels: ((data.levels as string[]) || []).join(", "),
        languages: ((data.languages as string[]) || []).join(", "),
        isNativeSpeaker: Boolean(data.isNativeSpeaker),
        hourlyRate: Number(data.hourlyRate || 0),
        groupRate: "",
        lessonDuration: "60",
        currency: String(data.currency || "USD"),
        methodology: String(data.methodology || ""),
        city: String(data.city || ""),
        country: String(data.country || user?.country || ""),
        preferredPlatform: String(data.preferredPlatform || "ZOOM"),
        introVideoUrl: String(data.introVideoUrl || ""),
      });
    });
  }, [user]);

  function specs() {
    return [
      ...form.specializations,
      ...form.extraSpecialization.split(",").map((s) => s.trim()).filter(Boolean),
    ];
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved("");
    try {
      await api("/teachers/me", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          bio: form.bio,
          qualifications: form.qualifications,
          experienceYears: Number(form.experienceYears),
          specializations: specs(),
          levels: form.levels.split(",").map((s) => s.trim()).filter(Boolean),
          languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
          isNativeSpeaker: form.isNativeSpeaker,
          hourlyRate: Number(form.hourlyRate),
          currency: form.currency,
          methodology: [
            form.methodology,
            form.lessonDuration ? `Preferred lesson duration: ${form.lessonDuration} minutes.` : "",
            form.groupRate ? `Group lesson rate: ${form.currency} ${form.groupRate}.` : "",
          ]
            .filter(Boolean)
            .join("\n"),
          city: form.city,
          country: form.country,
          preferredPlatform: form.preferredPlatform,
          introVideoUrl: form.introVideoUrl || "",
        }),
      });
      await refresh();
      setSaved("Profile saved. You can continue later. Preview it, then submit for administrator approval.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadPhoto(file: File) {
    const body = new FormData();
    body.append("file", file);
    await api("/uploads/photo", { method: "POST", body });
    setPhotoName(file.name);
    setSaved("Photograph uploaded.");
  }

  function toggleSpec(name: string) {
    setForm((current) => ({
      ...current,
      specializations: current.specializations.includes(name)
        ? current.specializations.filter((item) => item !== name)
        : [...current.specializations, name],
    }));
  }

  return (
    <form onSubmit={save} className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-navy">My profile</h1>
        <p className="mt-2 text-sm text-navy/60">
          Save incomplete sections and return later. Students see this after an administrator approves it.
        </p>
      </div>

      <section className="space-y-3 rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">A. Personal information</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="label">First name</label>
            <input className="field" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          </div>
          <div>
            <label className="label">Last name</label>
            <input className="field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <div>
            <label className="label">Country</label>
            <input className="field" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div>
            <label className="label">City</label>
            <input className="field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
        </div>
        <label className="label">Languages spoken</label>
        <input className="field" placeholder="English, French" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
        <label className="label">Profile photograph</label>
        <label className="mt-1 flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-navy/20 bg-cream px-4 py-4 text-sm text-navy/70">
          <span>{photoName || "Choose a JPEG or PNG"}</span>
          <span className="rounded-full bg-navy px-3 py-1 text-xs text-cream">Upload</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadPhoto(e.target.files[0])} />
        </label>
      </section>

      <section className="space-y-3 rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">B. Professional information</h2>
        <label className="label">Professional introduction</label>
        <textarea className="field h-28" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <label className="label">Teaching qualifications</label>
        <textarea className="field h-24" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} />
        <label className="label">Previous teaching experience</label>
        <textarea className="field h-24" value={form.methodology} onChange={(e) => setForm({ ...form, methodology: e.target.value })} />
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="label">Years of experience</label>
            <input className="field" type="number" min={0} value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} />
          </div>
          <label className="mt-7 flex items-center gap-2 text-sm text-navy/80">
            <input type="checkbox" checked={form.isNativeSpeaker} onChange={(e) => setForm({ ...form, isNativeSpeaker: e.target.checked })} />
            Native English speaker
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">C. Teaching specialisations</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {TEACHER_SPECIALIZATIONS.map((item) => (
            <label key={item} className="flex items-center gap-2 rounded-2xl bg-cream px-3 py-2 text-sm text-navy">
              <input type="checkbox" checked={form.specializations.includes(item)} onChange={() => toggleSpec(item)} />
              {item}
            </label>
          ))}
        </div>
        <label className="label">Additional specialisations</label>
        <input className="field" placeholder="Exam coaching, Accent reduction" value={form.extraSpecialization} onChange={(e) => setForm({ ...form, extraSpecialization: e.target.value })} />
        <label className="label">Levels (comma separated)</label>
        <input className="field" placeholder="Beginner, Intermediate, Advanced" value={form.levels} onChange={(e) => setForm({ ...form, levels: e.target.value })} />
      </section>

      <section className="space-y-3 rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">D. Teaching rates</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="label">Individual lesson rate</label>
            <input className="field" type="number" min={0} value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Currency</label>
            <input className="field" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
          <div>
            <label className="label">Group lesson rate (optional)</label>
            <input className="field" value={form.groupRate} onChange={(e) => setForm({ ...form, groupRate: e.target.value })} />
          </div>
          <div>
            <label className="label">Preferred lesson duration (minutes)</label>
            <input className="field" value={form.lessonDuration} onChange={(e) => setForm({ ...form, lessonDuration: e.target.value })} />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">F. Online teaching arrangements</h2>
        <p className="text-sm text-navy/60">Private meeting links stay off the public profile. Share them in messages after a student contacts you.</p>
        <select className="field" value={form.preferredPlatform} onChange={(e) => setForm({ ...form, preferredPlatform: e.target.value })}>
          <option value="ZOOM">Zoom</option>
          <option value="GOOGLE_MEET">Google Meet</option>
          <option value="MICROSOFT_TEAMS">Microsoft Teams</option>
          <option value="OTHER">Other</option>
        </select>
      </section>

      <section className="space-y-3 rounded-[1.6rem] bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-navy">G. Introduction video</h2>
        <label className="label">Supported video link (optional)</label>
        <input className="field" placeholder="https://..." value={form.introVideoUrl} onChange={(e) => setForm({ ...form, introVideoUrl: e.target.value })} />
      </section>

      <div className="flex flex-wrap gap-3">
        <button className="btn-primary" disabled={busy}>
          {busy ? "Saving…" : "Save and continue later"}
        </button>
        <Link href="/dashboard/teacher/availability" className="btn-soft">
          Set availability
        </Link>
        <Link href="/dashboard/teacher/preview" className="btn-soft">
          Preview profile
        </Link>
      </div>
      {saved && <p className="rounded-2xl bg-gold-soft/60 px-4 py-3 text-sm text-navy">{saved}</p>}
    </form>
  );
}
