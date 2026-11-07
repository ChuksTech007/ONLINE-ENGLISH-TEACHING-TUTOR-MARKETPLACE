"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Award,
  Calendar,
  Clock,
  Globe2,
  MapPin,
  ShieldCheck,
  Star,
  Video,
  Wallet,
} from "lucide-react";
import { api, type TeacherCard } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { teacherPhotoOrFallback, youtubeEmbed } from "@/lib/photos";

type TeacherProfile = TeacherCard & {
  methodology?: string;
  paymentMethods?: { type: string; details: string }[];
  certificates?: { id: string; title: string }[];
  reviews?: {
    id: string;
    rating: number;
    comment: string;
    studentName: string;
    createdAt: string;
  }[];
  introVideoUrl?: string | null;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function minutesLabel(value: number) {
  const h = Math.floor(value / 60);
  const m = value % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function TeacherProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    proficiencyLevel: "Intermediate",
    learningObjectives: "",
    preferredSchedule: "",
    message: "",
  });
  const [sent, setSent] = useState("");
  const [lessonAt, setLessonAt] = useState("");

  useEffect(() => {
    api<TeacherProfile>(`/teachers/${slug}`)
      .then(setTeacher)
      .catch(() => setError("Teacher not found"));
  }, [slug]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl text-navy">We could not find that teacher</h1>
        <p className="mt-3 text-navy/65">The profile may be pending review or the link is out of date.</p>
        <Link href="/teachers" className="btn-primary mt-8 inline-flex">
          Back to the directory
        </Link>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="skeleton h-80 w-full rounded-[2rem]" />
        <div className="mt-8 grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <div className="skeleton h-[32rem]" />
          <div className="skeleton h-96" />
        </div>
      </div>
    );
  }

  async function contact(e: React.FormEvent) {
    e.preventDefault();
    setSent("");
    if (!user) {
      router.push(`/login?next=/teachers/${slug}`);
      return;
    }
    try {
      await api("/enquiries", {
        method: "POST",
        body: JSON.stringify({ slug, ...form }),
      });
      setSent("Your enquiry was sent. The teacher will reply in Messages.");
    } catch (err) {
      setSent(err instanceof Error ? err.message : "Could not send enquiry");
    }
  }

  async function requestLesson(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !lessonAt || !teacher) return;
    try {
      await api("/lessons", {
        method: "POST",
        body: JSON.stringify({
          teacherId: teacher.id,
          startAt: new Date(lessonAt).toISOString(),
          durationMinutes: 60,
        }),
      });
      setSent("Lesson request sent. Check your dashboard for the teacher’s response.");
    } catch (err) {
      setSent(err instanceof Error ? err.message : "Could not request lesson");
    }
  }

  const photo = teacherPhotoOrFallback(teacher.slug, teacher.photoUrl);
  const embed = youtubeEmbed(teacher.introVideoUrl);
  const availabilityByDay = DAYS.map((day, index) => ({
    day,
    slots: (teacher.availability || []).filter((slot) => slot.dayOfWeek === index),
  }));

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-navy text-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt="" className="kenburns absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40" />
        <div className="relative mx-auto grid max-w-6xl items-end gap-8 px-4 py-16 md:grid-cols-[auto_1fr_auto] md:py-20">
          <div className="overflow-hidden rounded-[1.6rem] border-4 border-white/20 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt={`${teacher.firstName} ${teacher.lastName}`}
              className="h-48 w-40 object-cover md:h-56 md:w-44"
            />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-gold">
              {teacher.isNativeSpeaker ? "Native speaker" : "English teacher"} · {teacher.experienceYears} years
            </p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">
              {teacher.firstName} {teacher.lastName}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-cream/80">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {teacher.city ? `${teacher.city}, ` : ""}
                {teacher.country}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-gold text-gold" />
                {Number(teacher.averageRating).toFixed(1)} · {teacher.reviewCount} reviews
              </span>
              <span className="inline-flex items-center gap-1">
                <Video className="h-4 w-4" />
                {teacher.preferredPlatform.replaceAll("_", " ")}
              </span>
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {teacher.specializations.map((item) => (
                <span key={item} className="rounded-full bg-white/10 px-3 py-1 text-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-[1.4rem] bg-white/10 p-5 text-right backdrop-blur-sm">
            <div className="text-sm text-gold">Hourly rate</div>
            <div className="mt-1 font-display text-4xl">
              {teacher.currency} {Number(teacher.hourlyRate).toFixed(0)}
            </div>
            <div className="text-sm text-cream/60">paid directly to the teacher</div>
            <a href="#contact" className="btn-gold mt-4 inline-flex">
              Contact {teacher.firstName}
            </a>
          </div>
        </div>
      </section>

      <div className="border-b border-navy/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 text-sm text-navy/70 md:grid-cols-3">
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            Approved profile. Students contact this teacher for free.
          </p>
          <p className="flex items-start gap-2">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            Lesson fees go to {teacher.firstName}. Merit never takes a commission.
          </p>
          <p className="flex items-start gap-2">
            <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            Class on {teacher.preferredPlatform.replaceAll("_", " ")} · timezone {teacher.timezone || "set by teacher"}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <article className="rounded-[1.6rem] bg-white p-8 shadow-sm">
            <h2 className="font-display text-3xl text-navy">About {teacher.firstName}</h2>
            <p className="mt-4 leading-8 text-navy/80">{teacher.bio}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {(teacher.levels || []).map((level) => (
                <span key={level} className="rounded-full bg-cream px-3 py-1 text-sm text-navy/80">
                  {level}
                </span>
              ))}
              {(teacher.languages || []).map((lang) => (
                <span key={lang} className="rounded-full border border-navy/10 px-3 py-1 text-sm text-navy/70">
                  {lang}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[1.6rem] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-gold" />
              <h2 className="font-display text-2xl text-navy">Qualifications</h2>
            </div>
            <p className="mt-3 leading-7 text-navy/75">{teacher.qualifications}</p>
            {(teacher.certificates || []).length > 0 && (
              <ul className="mt-4 space-y-2 text-sm text-navy/70">
                {teacher.certificates!.map((cert) => (
                  <li key={cert.id} className="rounded-2xl bg-cream px-4 py-3">
                    {cert.title}
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="rounded-[1.6rem] bg-white p-8 shadow-sm">
            <h2 className="font-display text-2xl text-navy">Teaching method</h2>
            <p className="mt-3 leading-7 text-navy/75">
              {teacher.methodology || `${teacher.firstName} will confirm the lesson plan after your first message.`}
            </p>
          </article>

          {(embed || teacher.introVideoUrl) && (
            <article className="overflow-hidden rounded-[1.6rem] bg-white shadow-sm">
              {embed ? (
                <iframe
                  title={`${teacher.firstName} introduction`}
                  src={embed}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="p-8">
                  <h2 className="font-display text-2xl text-navy">Introduction video</h2>
                  <a href={teacher.introVideoUrl!} target="_blank" rel="noreferrer" className="mt-3 inline-block text-navy-800">
                    Watch {teacher.firstName}’s introduction
                  </a>
                </div>
              )}
            </article>
          )}

          <article className="rounded-[1.6rem] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gold" />
              <h2 className="font-display text-2xl text-navy">Weekly availability</h2>
            </div>
            <p className="mt-2 text-sm text-navy/55">Times shown in {teacher.timezone || "the teacher’s timezone"}.</p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {availabilityByDay.map((item) => (
                <div key={item.day} className="rounded-2xl bg-cream px-3 py-3 text-center">
                  <div className="text-xs uppercase tracking-wide text-navy/45">{item.day}</div>
                  {item.slots.length === 0 ? (
                    <div className="mt-2 text-xs text-navy/35">-</div>
                  ) : (
                    item.slots.map((slot, i) => (
                      <div key={i} className="mt-2 text-xs text-navy">
                        {minutesLabel(slot.startMinute)}–{minutesLabel(slot.endMinute)}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.6rem] bg-white p-8 shadow-sm">
            <h2 className="font-display text-2xl text-navy">How to pay {teacher.firstName}</h2>
            <p className="mt-2 text-sm text-navy/60">
              Lesson payments go directly to the teacher. Merit does not collect lesson fees and does not hold escrow.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {(teacher.paymentMethods || []).length === 0 && (
                <li className="rounded-2xl bg-cream p-4 text-sm text-navy/60">Payment details will be confirmed in messages.</li>
              )}
              {(teacher.paymentMethods || []).map((method) => (
                <li key={method.type} className="rounded-2xl bg-cream p-4">
                  <div className="text-xs uppercase tracking-wide text-navy/45">{method.type}</div>
                  <div className="mt-1 text-navy">{method.details}</div>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-[1.6rem] bg-white p-8 shadow-sm">
            <h2 className="font-display text-2xl text-navy">Student reviews</h2>
            <div className="mt-5 space-y-4">
              {(teacher.reviews || []).length === 0 && (
                <p className="text-navy/60">No reviews yet. Be the first student to leave one after a completed lesson.</p>
              )}
              {(teacher.reviews || []).map((review) => (
                <figure key={review.id} className="rounded-2xl bg-cream p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-navy">{review.studentName}</div>
                    <div className="flex items-center gap-1 text-sm text-navy/70">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < review.rating ? "fill-gold text-gold" : "text-navy/20"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <blockquote className="mt-2 leading-7 text-navy/75">{review.comment}</blockquote>
                  <figcaption className="mt-2 text-xs text-navy/45">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </figcaption>
                </figure>
              ))}
            </div>
          </article>
        </div>

        <aside className="h-fit lg:sticky lg:top-24" id="contact">
          <div className="rounded-[1.6rem] bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl text-navy">Contact {teacher.firstName}</h2>
            <p className="mt-2 text-sm text-navy/60">
              Contact is free for students. If this is your first message to {teacher.firstName}, the teacher uses one advertising credit.
            </p>
            {!teacher.acceptingNewEnquiries && (
              <p className="mt-3 rounded-2xl bg-gold-soft/50 p-3 text-sm">
                This teacher is not accepting new student enquiries right now. You can still message them if you already have a relationship.
              </p>
            )}
            <form onSubmit={contact} className="mt-5 space-y-3">
              <label className="label">Your level</label>
              <select
                className="field"
                value={form.proficiencyLevel}
                onChange={(e) => setForm({ ...form, proficiencyLevel: e.target.value })}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <label className="label">What do you want to learn?</label>
              <input
                className="field"
                placeholder="Business meetings, IELTS writing, daily conversation…"
                value={form.learningObjectives}
                onChange={(e) => setForm({ ...form, learningObjectives: e.target.value })}
                required
              />
              <label className="label">Preferred schedule</label>
              <input
                className="field"
                placeholder="Weekday evenings, Sunday mornings…"
                value={form.preferredSchedule}
                onChange={(e) => setForm({ ...form, preferredSchedule: e.target.value })}
              />
              <label className="label">Introduce yourself</label>
              <textarea
                className="field h-28"
                placeholder="A few lines about your goal and current English"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
              <button className="btn-primary w-full pulse-gold">Send enquiry</button>
            </form>
            <form onSubmit={requestLesson} className="mt-6 border-t border-navy/10 pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold" />
                <h3 className="font-medium text-navy">Request a 60-minute lesson</h3>
              </div>
              <input
                type="datetime-local"
                className="field mt-3"
                value={lessonAt}
                onChange={(e) => setLessonAt(e.target.value)}
              />
              <button className="btn-ghost mt-3 w-full">Request lesson</button>
            </form>
            {sent && <p className="mt-4 rounded-2xl bg-cream px-4 py-3 text-sm text-navy-800">{sent}</p>}
            <button
              type="button"
              className="mt-4 text-xs text-navy/50"
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Profile link copied" : "Copy profile link"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
