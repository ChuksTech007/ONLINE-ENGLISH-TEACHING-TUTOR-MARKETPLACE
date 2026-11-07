"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api, type TeacherCard as Teacher } from "@/lib/api";
import { TeacherCard } from "@/components/TeacherCard";
import { PageHero } from "@/components/PageHero";

function Directory() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [country, setCountry] = useState(params.get("country") || "");
  const [specialization, setSpecialization] = useState(params.get("specialization") || "");
  const [level, setLevel] = useState(params.get("level") || "");
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
    <div>
      <PageHero
        kicker="Teacher directory"
        title="Find an English teacher who fits your goal, budget and timetable."
        subtitle="Contacting a teacher is always free for students. You pay the teacher directly for lessons - Merit never takes a commission."
        image="/images/teachers-group.jpg"
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-3 rounded-[1.6rem] bg-white p-4 shadow-sm md:grid-cols-4">
          <input className="field" placeholder="Search name or bio" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
          <input className="field" placeholder="Country" value={country} onChange={(e) => { setPage(1); setCountry(e.target.value); }} />
          <select className="field" value={specialization} onChange={(e) => { setPage(1); setSpecialization(e.target.value); }}>
            <option value="">Any specialization</option>
            {["Conversational English", "Business English", "IELTS", "Pronunciation", "Academic writing", "Interview preparation"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select className="field" value={level} onChange={(e) => { setPage(1); setLevel(e.target.value); }}>
            <option value="">Any level</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
          <select className="field" value={native} onChange={(e) => { setPage(1); setNative(e.target.value); }}>
            <option value="">Native or non-native</option>
            <option value="true">Native speaker</option>
            <option value="false">Non-native speaker</option>
          </select>
          <input className="field" placeholder="Min. years experience" value={minExperience} onChange={(e) => { setPage(1); setMinExperience(e.target.value); }} />
          <input className="field" placeholder="Max hourly price" value={maxPrice} onChange={(e) => { setPage(1); setMaxPrice(e.target.value); }} />
          <div className="flex items-center px-2 text-sm text-navy/60">{total} approved teachers</div>
        </div>
        <p className="mt-4 text-xs text-navy/50">Featured profiles appear first. That is paid promotional visibility. Everyone else is listed organically. Views never cost a teacher money.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {loading && <p className="text-navy/60">Loading teachers…</p>}
          {!loading && teachers.length === 0 && (
            <div className="col-span-full rounded-[1.6rem] bg-white p-10 text-center">
              <h2 className="font-display text-2xl text-navy">No teachers match those filters</h2>
              <p className="mt-2 text-navy/65">Try a wider country, price or specialization.</p>
            </div>
          )}
          {teachers.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />)}
        </div>
        {total > 12 && (
          <div className="mt-8 flex justify-center gap-3">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-full border border-navy/15 px-4 py-2">Previous</button>
            <button disabled={page * 12 >= total} onClick={() => setPage(page + 1)} className="rounded-full border border-navy/15 px-4 py-2">Next</button>
          </div>
        )}
      </div>
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
