"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Globe2, ShieldCheck, Video } from "lucide-react";
import { api, type TeacherCard as Teacher } from "@/lib/api";
import { TeacherCard } from "@/components/TeacherCard";

export default function HomePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    api<{ teachers: Teacher[] }>("/teachers?pageSize=3")
      .then((data) => setTeachers(data.teachers))
      .catch(() => setTeachers([]));
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-navy text-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold">Online English marketplace</p>
            <h1 className="mt-4 font-display text-4xl leading-tight md:text-6xl">
              Learn English online with professional teachers from around the world.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-cream/75">
              Connect with experienced English teachers, arrange flexible online lessons and improve your English from anywhere.
            </p>
            <form
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              action="/teachers"
            >
              <input
                name="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Teacher name, country or specialization"
                className="h-12 flex-1 rounded-full bg-white px-5 text-navy outline-none"
              />
              <button className="h-12 rounded-full bg-gold px-6 font-medium text-navy">
                Find a teacher
              </button>
            </form>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <Link href="/teachers" className="inline-flex items-center gap-2 text-gold">
                Browse all teachers <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/become-a-teacher" className="text-cream/80">
                Become a teacher
              </Link>
            </div>
          </div>
          <div className="hidden items-center md:flex">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="text-gold">How Merit works</div>
              <ol className="mt-6 space-y-5 text-cream/85">
                <li>1. Find an English teacher who matches your goals and budget.</li>
                <li>2. Contact the teacher and arrange lessons on your terms.</li>
                <li>3. Learn online through Zoom or Google Meet. Pay the teacher directly.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl text-navy">Featured teachers</h2>
            <p className="mt-2 text-navy/70">Approved professionals ready for online lessons.</p>
          </div>
          <Link href="/teachers" className="text-sm text-navy-800">
            View directory
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-3">
          {[
            {
              icon: Globe2,
              title: "Teachers worldwide",
              body: "Filter by country, experience, price, specialization and native-speaker status.",
            },
            {
              icon: Video,
              title: "Lessons on Zoom or Meet",
              body: "Merit does not host video. Teachers share a meeting link. You join from your dashboard.",
            },
            {
              icon: ShieldCheck,
              title: "Teachers keep 100%",
              body: "Students pay teachers directly. Merit only charges advertising credits when a new student makes contact.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl bg-cream p-6">
              <item.icon className="h-8 w-8 text-navy" />
              <h3 className="mt-4 font-display text-2xl text-navy">{item.title}</h3>
              <p className="mt-2 text-navy/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
