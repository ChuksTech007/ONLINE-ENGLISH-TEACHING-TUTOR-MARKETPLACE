"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Lesson = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
  platform: string;
  meetingUrl?: string | null;
  canJoin: boolean;
  hasReview: boolean;
  student: { firstName: string; lastName: string };
  teacher: { firstName: string; lastName: string };
};

export default function LessonsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Lesson[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});

  async function load() {
    setRows(await api<Lesson[]>("/lessons"));
  }
  useEffect(() => {
    load();
  }, []);

  async function update(id: string, body: Record<string, unknown>) {
    await api(`/lessons/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    await load();
  }

  async function review(lessonId: string) {
    const comment = prompt("Write a short review");
    if (!comment) return;
    await api("/reviews", {
      method: "POST",
      body: JSON.stringify({
        lessonId,
        rating: 5,
        teachingQuality: 5,
        communication: 5,
        punctuality: 5,
        comment,
      }),
    });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Lessons</h1>
      <div className="mt-6 space-y-4">
        {rows.map((lesson) => (
          <article key={lesson.id} className="rounded-3xl bg-white p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <div className="font-medium text-navy">{lesson.title}</div>
                <div className="text-sm text-navy/60">
                  {lesson.student.firstName} / {lesson.teacher.firstName} · {new Date(lesson.startAt).toLocaleString()} · {lesson.status}
                </div>
              </div>
              {lesson.canJoin && lesson.meetingUrl && (
                <a href={lesson.meetingUrl} target="_blank" className="rounded-full bg-gold px-4 py-2 text-sm text-navy">
                  Join class
                </a>
              )}
            </div>
            {user?.role === "TEACHER" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <input
                  className="min-w-64 flex-1 rounded-full border border-navy/10 px-4 py-2 text-sm"
                  placeholder="Paste Zoom or Google Meet link"
                  value={urls[lesson.id] ?? lesson.meetingUrl ?? ""}
                  onChange={(e) => setUrls({ ...urls, [lesson.id]: e.target.value })}
                />
                <button className="rounded-full border px-3 py-2 text-sm" onClick={() => update(lesson.id, { meetingUrl: urls[lesson.id], status: "SCHEDULED" })}>
                  Save link & schedule
                </button>
                <button className="rounded-full border px-3 py-2 text-sm" onClick={() => update(lesson.id, { status: "COMPLETED" })}>
                  Mark completed
                </button>
                <button className="rounded-full border px-3 py-2 text-sm" onClick={() => update(lesson.id, { status: "CANCELLED" })}>
                  Cancel
                </button>
              </div>
            )}
            {user?.role === "STUDENT" && lesson.status === "COMPLETED" && !lesson.hasReview && (
              <button className="mt-3 text-sm text-navy" onClick={() => review(lesson.id)}>
                Leave a review
              </button>
            )}
          </article>
        ))}
        {rows.length === 0 && <p>No lessons yet.</p>}
      </div>
    </div>
  );
}
