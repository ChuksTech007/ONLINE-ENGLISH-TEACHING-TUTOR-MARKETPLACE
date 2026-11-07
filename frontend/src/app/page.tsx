"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Globe2, ShieldCheck, Sparkles, Video, Wallet } from "lucide-react";
import { api, type TeacherCard as Teacher } from "@/lib/api";
import { TeacherCard } from "@/components/TeacherCard";
import { Reveal } from "@/components/Reveal";
import { FAQ } from "@/components/FAQ";
import { CtaBand } from "@/components/CtaBand";
import { TrustStrip } from "@/components/TrustStrip";

const stats = [
  { value: "Approved teachers", label: "Every profile is reviewed before it goes live." },
  { value: "100% of lesson fees", label: "Teachers keep every dollar students pay them." },
  { value: "First contact only", label: "Advertising credit is never charged for views." },
  { value: "Zoom · Meet · Teams", label: "Lessons happen on tools teachers already use." },
];

export default function HomePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [level, setLevel] = useState("");
  const [specialization, setSpecialization] = useState("");

  useEffect(() => {
    api<{ teachers: Teacher[] }>("/teachers?pageSize=3")
      .then((data) => setTeachers(data.teachers))
      .catch(() => setTeachers([]));
  }, []);

  const search = `/teachers?${new URLSearchParams({
    ...(q ? { q } : {}),
    ...(country ? { country } : {}),
    ...(level ? { level } : {}),
    ...(specialization ? { specialization } : {}),
  }).toString()}`;

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-navy text-cream">
        <img src="/images/hero.jpg" alt="" className="kenburns absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/35" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-28">
          <div>
            <p className="reveal text-sm uppercase tracking-[0.22em] text-gold">Online English marketplace</p>
            <h1 className="reveal reveal-d1 mt-4 font-display text-4xl leading-[1.12] md:text-6xl">
              Learn English online with professional teachers from around the world.
            </h1>
            <p className="reveal reveal-d2 mt-5 max-w-xl text-lg leading-8 text-cream/78">
              Connect with experienced English teachers, arrange flexible online lessons and improve your English from anywhere. Students pay teachers directly. Merit never takes a lesson commission.
            </p>
            <form action={search} className="reveal reveal-d3 mt-8 rounded-[1.8rem] bg-white p-3 text-navy shadow-2xl shadow-black/20">
              <div className="grid gap-2 md:grid-cols-2">
                <input name="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, country or goal" className="field" />
                <input name="country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Teacher country" className="field" />
                <select name="level" value={level} onChange={(e) => setLevel(e.target.value)} className="field">
                  <option value="">Any level</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
                <select name="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="field">
                  <option value="">Any specialization</option>
                  <option>Conversational English</option>
                  <option>Business English</option>
                  <option>IELTS</option>
                  <option>Pronunciation</option>
                </select>
              </div>
              <button className="btn-gold mt-3 w-full">Find an English teacher</button>
            </form>
            <div className="reveal reveal-d4 mt-5 flex flex-wrap gap-5 text-sm">
              <Link href="/teachers" className="inline-flex items-center gap-2 text-gold">
                Browse the directory <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/become-a-teacher" className="text-cream/80">
                Are you a teacher?
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="floaty overflow-hidden rounded-[2rem] border border-white/15 bg-white/8 shadow-2xl backdrop-blur-sm">
              <img src="/images/student-study.jpg" alt="Student in an online English lesson" className="h-72 w-full object-cover" />
              <div className="p-6">
                <div className="text-gold">How Merit works</div>
                <ol className="mt-4 space-y-4 text-cream/88">
                  <li>1. Find a teacher who matches your goals and budget.</li>
                  <li>2. Contact them and arrange lessons on your terms.</li>
                  <li>3. Learn on Zoom or Google Meet. Pay the teacher directly.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-navy/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-4">
          {stats.map((item, i) => (
            <Reveal key={item.value} delay={i * 80}>
              <div className="gold-line" />
              <div className="mt-3 font-display text-xl text-navy">{item.value}</div>
              <p className="mt-1 text-sm text-navy/65">{item.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <TrustStrip />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-gold">Featured teachers</p>
              <h2 className="mt-2 font-display text-4xl text-navy">Professionals ready for class</h2>
              <p className="mt-2 max-w-xl text-navy/70">Approved profiles with clear prices, specializations and reviews. Contacting a teacher is free for students.</p>
            </div>
            <Link href="/teachers" className="text-sm text-navy-800">
              View full directory
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {teachers.map((teacher, i) => (
            <Reveal key={teacher.id} delay={i * 90}>
              <TeacherCard teacher={teacher} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
          <Reveal>
            <div className="img-zoom overflow-hidden rounded-[2rem]">
              <img src="/images/teachers-group.jpg" alt="Professional English teachers" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-sm uppercase tracking-[0.18em] text-gold">Why learn with Merit</p>
            <h2 className="mt-2 font-display text-4xl text-navy">A marketplace built for trust</h2>
            <div className="mt-6 space-y-5">
              {[
                { icon: Globe2, title: "Teachers worldwide", body: "Filter by country, experience, price, specialization, level and native-speaker status." },
                { icon: Video, title: "Lessons on Zoom or Meet", body: "Merit does not host video. Teachers share a meeting link. You join from your dashboard." },
                { icon: ShieldCheck, title: "Teachers keep 100%", body: "Students pay teachers directly. Merit only charges advertising credits when a new student makes contact." },
                { icon: Wallet, title: "Transparent advertising", body: "Organic directory visibility is separate from paid first-contact advertising. Views never cost money." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <item.icon className="mt-1 h-6 w-6 shrink-0 text-gold" />
                  <div>
                    <h3 className="font-medium text-navy">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-navy/70">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <p className="text-sm uppercase tracking-[0.18em] text-gold">For teachers</p>
          <h2 className="mt-2 font-display text-4xl text-navy">Grow a teaching practice without giving up your fees</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem]">
              <img src="/images/teacher-desk.jpg" alt="Teacher hosting an online lesson" className="h-80 w-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex h-full flex-col justify-center rounded-[2rem] bg-white p-8">
              <Sparkles className="h-8 w-8 text-gold" />
              <p className="mt-4 leading-8 text-navy/75">
                Create a professional profile, set your own prices, choose Zoom or Google Meet, and display PayPal, Wise or bank details. You buy advertising credits in advance. A new student contact uses one credit. Repeat students never cost extra.
              </p>
              <Link href="/become-a-teacher" className="btn-primary mt-6 w-fit">
                Become a teacher
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.18em] text-gold">Student stories</p>
            <h2 className="mt-2 font-display text-4xl text-navy">Trusted by learners preparing for real conversations</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { img: "/images/portrait-nina.jpg", name: "Nina Chen", place: "Taipei", quote: "I needed spoken English for work meetings. Filtering by Business English and price made it easy to find Amara. Lessons happen on Meet, and I pay her on PayPal." },
              { img: "/images/portrait-david.jpg", name: "David Mensah", place: "Accra", quote: "As a beginner I wanted someone patient. The profile showed qualifications, hours and reviews before I sent a single message. Contacting a teacher cost me nothing." },
              { img: "/images/portrait-lucia.jpg", name: "Lucia Ferreira", place: "São Paulo", quote: "IELTS writing was my weak point. I compared two teachers, booked a trial, and paid by bank transfer. Merit never sat in the middle of the money." },
            ].map((item, i) => (
              <Reveal key={item.name} delay={i * 90}>
                <figure className="h-full rounded-[1.6rem] bg-cream p-6">
                  <img src={item.img} alt={item.name} className="h-16 w-16 rounded-full object-cover" />
                  <blockquote className="mt-5 text-sm leading-7 text-navy/80">“{item.quote}”</blockquote>
                  <figcaption className="mt-4 text-sm font-medium text-navy">
                    {item.name} · {item.place}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.18em] text-gold">Money, plainly</p>
            <h2 className="mt-2 font-display text-4xl text-navy">Three wallets. One of them is ours.</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { title: "Student", body: "You never pay Merit. Contacting a teacher is free. Lesson fees go to the teacher you chose, on PayPal, Wise or bank transfer." },
              { title: "Teacher", body: "You keep 100% of lesson income. Advertising credits are a separate prepaid balance, used only when a new student contacts you." },
              { title: "Merit", body: "We earn from advertising credits and optional featured placement. We do not sit in the middle of a lesson payment." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <article className="h-full rounded-[1.6rem] bg-white p-6 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-gold">{item.title}</div>
                  <p className="mt-3 leading-7 text-navy/75">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-start gap-10 md:grid-cols-2">
          <Reveal>
            <p className="text-sm uppercase tracking-[0.18em] text-gold">Questions</p>
            <h2 className="mt-2 font-display text-4xl text-navy">Frequently asked</h2>
            <p className="mt-4 text-navy/70">The advertising model is simple on purpose. If you teach, you should know exactly when a credit is used. If you learn, contacting a teacher is always free.</p>
            <Link href="/faq" className="mt-6 inline-block text-sm text-navy-800">Read all FAQs</Link>
          </Reveal>
          <Reveal delay={80}>
            <FAQ />
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Find the teacher who fits your next chapter"
        body="Browse approved profiles, send an enquiry, and start learning on Zoom or Google Meet this week."
        primary={{ href: "/teachers", label: "Find an English teacher" }}
        secondary={{ href: "/become-a-teacher", label: "Become a teacher" }}
      />
    </div>
  );
}
