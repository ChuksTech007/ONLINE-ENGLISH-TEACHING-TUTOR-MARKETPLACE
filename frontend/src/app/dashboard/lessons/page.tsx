"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";

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
  const [rows, setRows] = useState<Lesson[] | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [comment, setComment] = useState("");

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
    if (!comment.trim()) return;
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
    setReviewing(null);
    setComment("");
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Lessons</h1>
      <p className="mt-2 text-sm text-navy/60">
        Classes happen on Zoom, Google Meet or Teams. The teacher pastes a meeting link. Pay the teacher directly using the method on their profile.
      </p>
      <div className="mt-6 space-y-4">
        {rows === null && <div className="skeleton h-40 rounded-[1.6rem]" />}
        {rows && rows.length === 0 && (
          <EmptyState
            title="No lessons scheduled"
            body={
              user?.role === "TEACHER"
                ? "When a student requests a time, accept it, paste a Zoom or Meet link, and they can join from this page."
                : "Request a 60-minute lesson from a teacher profile, or wait for your teacher to confirm a time."
            }
            href={user?.role === "STUDENT" ? "/teachers" : "/dashboard/enquiries"}
            action={user?.role === "STUDENT" ? "Find a teacher" : "Open enquiries"}
            image="/images/hero.jpg"
          />
        )}
        {(rows || []).map((lesson) => (
          <article key={lesson.id} className="rounded-[1.6rem] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <div className="font-medium text-navy">{lesson.title || "English lesson"}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-navy/60">
                  <span>
                    {lesson.student.firstName} / {lesson.teacher.firstName}
                  </span>
                  <span>· {new Date(lesson.startAt).toLocaleString()}</span>
                  <StatusBadge value={lesson.status} />
                  <span className="text-navy/40">{lesson.platform.replaceAll("_", " ")}</span>
                </div>
              </div>
              {lesson.canJoin && lesson.meetingUrl && (
                <a href={lesson.meetingUrl} target="_blank" rel="noreferrer" className="btn-gold py-2">
                  Join class
                </a>
              )}
            </div>
            {user?.role === "TEACHER" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <input
                  className="field min-w-64 flex-1 py-2"
                  placeholder="Paste Zoom or Google Meet link"
                  value={urls[lesson.id] ?? lesson.meetingUrl ?? ""}
                  onChange={(e) => setUrls({ ...urls, [lesson.id]: e.target.value })}
                />
                <button
                  className="btn-ghost py-2 text-sm"
                  onClick={() => update(lesson.id, { meetingUrl: urls[lesson.id], status: "SCHEDULED" })}
                >
                  Save link & schedule
                </button>
                <button className="btn-soft" onClick={() => update(lesson.id, { status: "COMPLETED" })}>
                  Mark completed
                </button>
                <button className="btn-soft" onClick={() => update(lesson.id, { status: "CANCELLED" })}>
                  Cancel
                </button>
              </div>
            )}
            {user?.role === "STUDENT" && lesson.status === "COMPLETED" && !lesson.hasReview && (
              <div className="mt-4">
                {reviewing === lesson.id ? (
                  <div className="space-y-2">
                    <textarea
                      className="field h-24"
                      placeholder="How was the lesson?"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn-primary py-2 text-sm" onClick={() => review(lesson.id)}>
                      Publish review
                    </button>
                  </div>
                ) : (
                  <button className="text-sm text-navy underline" onClick={() => setReviewing(lesson.id)}>
                    Leave a review
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
