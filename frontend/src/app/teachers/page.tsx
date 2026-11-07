"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, type TeacherCard as Teacher } from "@/lib/api";
import { TeacherCard } from "@/components/TeacherCard";
import { Suspense } from "react";

function Directory() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [country, setCountry] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [level, setLevel] = useState("");
  const [native, setNative] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (country) sp.set("country", country);
    if (specialization) sp.set("specialization", specialization);
    if (level) sp.set("level", level);
    if (native) sp.set("native", native);
    if (minExperience) sp.set("minExperience", minExperience);
    if (maxPrice) sp.set("maxPrice", maxPrice);
    sp.set("page", String(page));
    return sp.toString();
  }, [q, country, specialization, level, native, minExperience, maxPrice, page]);

  useEffect(() => {
    setLoading(true);
    api<{ teachers: Teacher[]; total: number }>(`/teachers?${query}`)
      .then((data) => {
        setTeachers(data.teachers);
        setTotal(data.total);
      })
      .catch(() => {
        setTeachers([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl text-navy">Find an English teacher</h1>
      <p className="mt-2 max-w-2xl text-navy/70">
        Browse approved teachers. You will only be charged by the teacher for lessons — contacting a teacher is free for students.
      </p>
      <div className="mt-8 grid gap-3 rounded-3xl bg-white p-4 md:grid-cols-4">
        <input className="rounded-2xl border border-navy/10 px-4 py-3" placeholder="Search name or bio" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
        <input className="rounded-2xl border border-navy/10 px-4 py-3" placeholder="Country" value={country} onChange={(e) => { setPage(1); setCountry(e.target.value); }} />
        <select className="rounded-2xl border border-navy/10 px-4 py-3" value={specialization} onChange={(e) => { setPage(1); setSpecialization(e.target.value); }}>
          <option value="">Any specialization</option>
          {["Conversational English", "Business English", "IELTS", "Pronunciation", "Academic writing", "Interview preparation"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="rounded-2xl border border-navy/10 px-4 py-3" value={level} onChange={(e) => { setPage(1); setLevel(e.target.value); }}>
          <option value="">Any level</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <select className="rounded-2xl border border-navy/10 px-4 py-3" value={native} onChange={(e) => { setPage(1); setNative(e.target.value); }}>
          <option value="">Native or non-native</option>
          <option value="true">Native speaker</option>
          <option value="false">Non-native speaker</option>
        </select>
        <input className="rounded-2xl border border-navy/10 px-4 py-3" placeholder="Min. years experience" value={minExperience} onChange={(e) => { setPage(1); setMinExperience(e.target.value); }} />
        <input className="rounded-2xl border border-navy/10 px-4 py-3" placeholder="Max hourly price" value={maxPrice} onChange={(e) => { setPage(1); setMaxPrice(e.target.value); }} />
        <div className="flex items-center px-2 text-sm text-navy/60">{total} teachers</div>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {loading ? <p>Loading teachers…</p> : teachers.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />)}
      </div>
      {total > 12 && (
        <div className="mt-8 flex justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-full border px-4 py-2">
            Previous
          </button>
          <button disabled={page * 12 >= total} onClick={() => setPage(page + 1)} className="rounded-full border px-4 py-2">
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default function TeachersPage() {
  return (
    <Suspense>
      <Directory />
    </Suspense>
  );
}
