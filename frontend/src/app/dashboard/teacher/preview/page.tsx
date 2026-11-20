"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, mediaUrl } from "@/lib/api";
import { DAYS } from "@/lib/specializations";

type Profile = {
  slug: string;
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  country: string;
  city?: string;
  bio: string;
  qualifications: string;
  experienceYears: number;
  specializations: string[];
  languages: string[];
  hourlyRate: string;
  currency: string;
  methodology: string;
  preferredPlatform: string;
  introVideoUrl?: string | null;
  status: string;
  availability: { dayOfWeek: number; startMinute: number; endMinute: number }[];
};

function hhmm(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

export default function TeacherPreviewPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setProfile(await api<Profile>("/teachers/me"));
  }
  useEffect(() => {
    load();
  }, []);

  async function submit() {
    setBusy(true);
    try {
      const next = await api<Profile>("/teachers/me/submit", { method: "POST" });
      setProfile(next);
      setMessage("Profile submitted for administrator approval. Status is now PENDING.");
    } finally {
      setBusy(false);
    }
  }

  if (!profile) return <div className="skeleton h-80 rounded-[1.6rem]" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-navy">Profile preview</h1>
        <p className="mt-2 text-sm text-navy/60">
          This is how students will see you after approval. Private meeting links are never shown here.
        </p>
      </div>
      <article className="overflow-hidden rounded-[1.6rem] bg-white shadow-sm">
        <div className="grid md:grid-cols-[220px_1fr]">
          <div className="bg-navy p-6 text-cream">
            {profile.photoUrl ? (
              <img src={mediaUrl(profile.photoUrl)} alt="" className="h-40 w-40 rounded-full object-cover" />
            ) : (
              <div className="grid h-40 w-40 place-items-center rounded-full bg-gold font-display text-4xl text-navy">
                {profile.firstName[0]}
              </div>
            )}
            <h2 className="mt-4 font-display text-2xl">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="mt-1 text-sm text-cream/70">
              {[profile.city, profile.country].filter(Boolean).join(", ")}
            </p>
            <p className="mt-4 font-display text-3xl text-gold">
              {profile.currency} {profile.hourlyRate}
            </p>
            <p className="text-xs text-cream/50">per hour · {profile.preferredPlatform.replace("_", " ")}</p>
          </div>
          <div className="space-y-4 p-6">
            <p className="text-sm leading-7 text-navy/75">{profile.bio || "Add a professional introduction so students know who you help."}</p>
            <div>
              <div className="text-xs uppercase tracking-wide text-navy/40">Qualifications</div>
              <p className="mt-1 text-sm text-navy/75">{profile.qualifications || "Add qualifications"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.specializations.map((item) => (
                <span key={item} className="rounded-full bg-cream px-3 py-1 text-xs text-navy">
                  {item}
                </span>
              ))}
            </div>
            <p className="text-sm text-navy/60">{profile.experienceYears} years · {profile.languages.join(", ")}</p>
            {profile.introVideoUrl && (
              <a href={profile.introVideoUrl} className="text-sm text-navy underline" target="_blank" rel="noreferrer">
                Introduction video
              </a>
            )}
            <div>
              <div className="text-xs uppercase tracking-wide text-navy/40">Availability</div>
              <ul className="mt-1 text-sm text-navy/70">
                {profile.availability.length === 0 && <li>No weekly slots yet</li>}
                {profile.availability.map((slot, i) => (
                  <li key={i}>
                    {DAYS[slot.dayOfWeek]} {hhmm(slot.startMinute)}–{hhmm(slot.endMinute)}
                  </li>
                ))}
              </ul>
            </div>
            <button className="btn-gold pointer-events-none">Contact teacher</button>
          </div>
        </div>
      </article>
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/teacher/profile" className="btn-soft">
          Edit profile
        </Link>
        <button className="btn-primary" disabled={busy || profile.status === "SUSPENDED"} onClick={submit}>
          {busy ? "Submitting…" : "Submit profile for approval"}
        </button>
      </div>
      {message && <p className="rounded-2xl bg-gold-soft/60 px-4 py-3 text-sm text-navy">{message}</p>}
      {profile.status === "APPROVED" && (
        <Link href={`/teachers/${profile.slug}`} className="text-sm text-navy underline">
          View live directory listing
        </Link>
      )}
    </div>
  );
}
