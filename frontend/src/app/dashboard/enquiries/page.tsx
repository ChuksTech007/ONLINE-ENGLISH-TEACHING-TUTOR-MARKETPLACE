"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

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

export default function EnquiriesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Enquiry[]>([]);

  useEffect(() => {
    api<Enquiry[]>("/enquiries").then(setRows);
  }, []);

  async function setStatus(id: string, status: string) {
    await api(`/enquiries/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Enquiries</h1>
      <div className="mt-6 space-y-4">
        {rows.map((row) => (
          <article key={row.id} className="rounded-3xl bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium text-navy">
                  {row.student
                    ? `${row.student.firstName} ${row.student.lastName} · ${row.student.country}`
                    : row.teacher
                      ? `${row.teacher.firstName} ${row.teacher.lastName}`
                      : "Enquiry"}
                </div>
                <div className="text-sm text-navy/50">{new Date(row.createdAt).toLocaleString()} · {row.status}</div>
              </div>
              {user?.role === "TEACHER" && row.charged && (
                <span className="rounded-full bg-cream px-3 py-1 text-xs">Charged ${row.chargeAmount}</span>
              )}
            </div>
            <p className="mt-3 text-navy/80">{row.learningObjectives}</p>
            <p className="mt-2 text-sm text-navy/70">{row.message}</p>
            {user?.role === "TEACHER" && (
              <div className="mt-3 flex flex-wrap gap-2">
                {["CONTACTED", "DISCUSSION", "TRIAL_SCHEDULED", "ENROLLED", "CLOSED"].map((status) => (
                  <button key={status} className="rounded-full border border-navy/10 px-3 py-1 text-xs" onClick={() => setStatus(row.id, status)}>
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
        {rows.length === 0 && <p>No enquiries yet.</p>}
      </div>
    </div>
  );
}
