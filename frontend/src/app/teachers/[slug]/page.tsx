"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { api, mediaUrl, type TeacherCard } from "@/lib/api";
import { useAuth } from "@/lib/auth";

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

  if (error) return <div className="mx-auto max-w-4xl px-4 py-16">{error}</div>;
  if (!teacher) return <div className="mx-auto max-w-4xl px-4 py-16">Loading profile…</div>;

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
    if (!user || !lessonAt) return;
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl bg-white">
          <div className="h-80 bg-navy/5">
            {teacher.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(teacher.photoUrl)} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-display text-4xl text-navy">
                  {teacher.firstName} {teacher.lastName}
                </h1>
                <p className="mt-1 text-navy/60">
                  {teacher.city ? `${teacher.city}, ` : ""}
                  {teacher.country} · {teacher.isNativeSpeaker ? "Native speaker" : "Non-native speaker"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl text-navy">
                  {teacher.currency} {Number(teacher.hourlyRate).toFixed(0)}
                </div>
                <div className="text-sm text-navy/50">per hour</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-navy/80">
              <Star className="h-4 w-4 fill-gold text-gold" />
              {Number(teacher.averageRating).toFixed(1)} · {teacher.reviewCount} reviews · {teacher.experienceYears} years experience
            </div>
            <p className="mt-6 leading-7 text-navy/80">{teacher.bio}</p>
            <h2 className="mt-8 font-display text-2xl text-navy">Qualifications</h2>
            <p className="mt-2 text-navy/75">{teacher.qualifications}</p>
            <h2 className="mt-8 font-display text-2xl text-navy">Teaching method</h2>
            <p className="mt-2 text-navy/75">{teacher.methodology}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {teacher.specializations.map((item) => (
                <span key={item} className="rounded-full bg-cream px-3 py-1 text-sm">{item}</span>
              ))}
            </div>
            <h2 className="mt-8 font-display text-2xl text-navy">Availability</h2>
            <ul className="mt-3 space-y-1 text-sm text-navy/75">
              {(teacher.availability || []).map((slot, i) => (
                <li key={i}>
                  {DAYS[slot.dayOfWeek]} {minutesLabel(slot.startMinute)}–{minutesLabel(slot.endMinute)} ({teacher.timezone})
                </li>
              ))}
            </ul>
            <h2 className="mt-8 font-display text-2xl text-navy">How to pay this teacher</h2>
            <p className="mt-2 text-sm text-navy/60">
              Lesson payments go directly to the teacher. Merit does not collect lesson fees.
            </p>
            <ul className="mt-3 space-y-2 text-navy/80">
              {(teacher.paymentMethods || []).map((method) => (
                <li key={method.type}>
                  <span className="font-medium">{method.type}:</span> {method.details}
                </li>
              ))}
            </ul>
            <h2 className="mt-8 font-display text-2xl text-navy">Reviews</h2>
            <div className="mt-3 space-y-4">
              {(teacher.reviews || []).length === 0 && <p className="text-navy/60">No reviews yet.</p>}
              {(teacher.reviews || []).map((review) => (
                <div key={review.id} className="rounded-2xl bg-cream p-4">
                  <div className="text-sm font-medium">{review.studentName} · {review.rating}/5</div>
                  <p className="mt-1 text-navy/75">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="h-fit rounded-3xl bg-white p-6" id="contact">
          <h2 className="font-display text-2xl text-navy">Contact teacher</h2>
          {!teacher.acceptingNewEnquiries && (
            <p className="mt-3 rounded-2xl bg-gold-soft/50 p-3 text-sm">
              This teacher is not accepting new student enquiries right now. You can still message them if you already have a relationship.
            </p>
          )}
          <form onSubmit={contact} className="mt-4 space-y-3">
            <select className="w-full rounded-2xl border border-navy/10 px-4 py-3" value={form.proficiencyLevel} onChange={(e) => setForm({ ...form, proficiencyLevel: e.target.value })}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
            <input className="w-full rounded-2xl border border-navy/10 px-4 py-3" placeholder="What do you want to learn?" value={form.learningObjectives} onChange={(e) => setForm({ ...form, learningObjectives: e.target.value })} required />
            <input className="w-full rounded-2xl border border-navy/10 px-4 py-3" placeholder="Preferred schedule" value={form.preferredSchedule} onChange={(e) => setForm({ ...form, preferredSchedule: e.target.value })} />
            <textarea className="h-28 w-full rounded-2xl border border-navy/10 px-4 py-3" placeholder="Introduce yourself" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            <button className="w-full rounded-full bg-navy py-3 text-cream">Send enquiry</button>
          </form>
          <form onSubmit={requestLesson} className="mt-6 border-t border-navy/10 pt-6">
            <h3 className="font-medium text-navy">Request a lesson</h3>
            <input type="datetime-local" className="mt-3 w-full rounded-2xl border border-navy/10 px-4 py-3" value={lessonAt} onChange={(e) => setLessonAt(e.target.value)} />
            <button className="mt-3 w-full rounded-full border border-navy/15 py-3">Request 60-minute lesson</button>
          </form>
          {sent && <p className="mt-4 text-sm text-navy-800">{sent}</p>}
        </aside>
      </div>
    </div>
  );
}
