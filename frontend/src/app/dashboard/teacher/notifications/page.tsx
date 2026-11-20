"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";

type Note = {
  id: string;
  title: string;
  body: string;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export default function TeacherNotificationsPage() {
  const [rows, setRows] = useState<Note[] | null>(null);

  async function load() {
    setRows(await api<Note[]>("/notifications"));
  }
  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    await api("/notifications/read-all", { method: "PATCH" });
    await load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-navy">Notifications</h1>
          <p className="mt-2 text-sm text-navy/60">Profile decisions, new enquiries, low-credit warnings and wallet activity appear here.</p>
        </div>
        <button className="btn-soft" onClick={markAll}>
          Mark all read
        </button>
      </div>
      <div className="mt-6 space-y-3">
        {rows === null && <div className="skeleton h-28 rounded-[1.6rem]" />}
        {rows && rows.length === 0 && (
          <EmptyState title="No notifications yet" body="Approvals, student contacts and credit alerts will land here." image="/images/library.jpg" />
        )}
        {(rows || []).map((row) => (
          <article key={row.id} className={`rounded-[1.4rem] p-5 shadow-sm ${row.readAt ? "bg-white" : "bg-gold-soft/40"}`}>
            <div className="text-xs text-navy/45">{new Date(row.createdAt).toLocaleString()}</div>
            <h2 className="mt-1 font-medium text-navy">{row.title}</h2>
            <p className="mt-1 text-sm text-navy/70">{row.body}</p>
            {row.link && (
              <Link href={row.link} className="mt-2 inline-block text-sm text-navy underline">
                Open
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
