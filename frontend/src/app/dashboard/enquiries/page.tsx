"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";

type Enquiry = {
  id: string;
  status: string;
  proficiencyLevel: string;
  learningObjectives: string;
  preferredSchedule: string;
  message: string;
  createdAt: string;
  charged?: boolean;
  chargeAmount?: string;
  student?: { firstName: string; lastName: string; country: string };
  teacher?: { firstName: string; lastName: string; slug: string };
};

const STATUSES = ["CONTACTED", "DISCUSSION", "TRIAL_SCHEDULED", "ENROLLED", "CLOSED"];

export default function EnquiriesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Enquiry[] | null>(null);

  useEffect(() => {
    api<Enquiry[]>("/enquiries").then(setRows);
  }, []);

  async function setStatus(id: string, status: string) {
    await api(`/enquiries/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    setRows((current) => (current || []).map((row) => (row.id === id ? { ...row, status } : row)));
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Enquiries</h1>
      <p className="mt-2 text-sm text-navy/60">
        {user?.role === "TEACHER"
          ? "A first contact from a new student uses one advertising credit. Follow-up in this thread is free."
          : "These are the teachers you have contacted. Messaging them again never costs you anything."}
      </p>
      <div className="mt-6 space-y-4">
        {rows === null && <div className="skeleton h-40 rounded-[1.6rem]" />}
        {rows && rows.length === 0 && (
          <EmptyState
            title="No enquiries yet"
            body={
              user?.role === "TEACHER"
                ? "When a new student writes, the first contact appears here and the advertising wallet records the deduction."
                : "Browse the directory and send a short introduction. Contacting a teacher is free for students."
            }
            href={user?.role === "STUDENT" ? "/teachers" : "/dashboard/profile"}
            action={user?.role === "STUDENT" ? "Find a teacher" : "Polish your profile"}
            image="/images/student-study.jpg"
          />
        )}
        {(rows || []).map((row) => (
          <article key={row.id} className="rounded-[1.6rem] bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium text-navy">
                  {row.student
                    ? `${row.student.firstName} ${row.student.lastName} · ${row.student.country}`
                    : row.teacher
                      ? `${row.teacher.firstName} ${row.teacher.lastName}`
                      : "Enquiry"}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-navy/50">
                  {new Date(row.createdAt).toLocaleString()}
                  <StatusBadge value={row.status} />
                  <span>{row.proficiencyLevel}</span>
                </div>
              </div>
              {user?.role === "TEACHER" && row.charged && (
                <span className="rounded-full bg-gold-soft px-3 py-1 text-xs text-navy">
                  Charged ${row.chargeAmount}
                </span>
              )}
            </div>
            <p className="mt-3 font-medium text-navy/80">{row.learningObjectives}</p>
            <p className="mt-2 text-sm leading-6 text-navy/70">{row.message}</p>
            {row.preferredSchedule && (
              <p className="mt-2 text-xs text-navy/45">Preferred schedule: {row.preferredSchedule}</p>
            )}
            {user?.role === "TEACHER" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    className={`btn-soft ${row.status === status ? "bg-navy text-cream" : ""}`}
                    onClick={() => setStatus(row.id, status)}
                  >
                    {status.replaceAll("_", " ").toLowerCase()}
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
