"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { EmptyState } from "@/components/EmptyState";

type Conversation = {
  id: string;
  student: { firstName: string; lastName: string };
  teacher: { firstName: string; lastName: string };
  lastMessage?: { body: string; createdAt: string } | null;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Conversation[] | null>(null);
  useEffect(() => {
    api<Conversation[]>("/messages").then(setRows);
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Messages</h1>
      <p className="mt-2 text-sm text-navy/60">Repeat messages in an existing relationship never use advertising credit.</p>
      <div className="mt-6 space-y-3">
        {rows === null && <div className="skeleton h-28 rounded-[1.6rem]" />}
        {rows && rows.length === 0 && (
          <EmptyState
            title="No conversations yet"
            body="A thread opens when a student sends an enquiry. Keep lesson times, payment notes and meeting links in the thread so both of you have a record."
            href={user?.role === "STUDENT" ? "/teachers" : "/dashboard/enquiries"}
            action={user?.role === "STUDENT" ? "Find a teacher" : "Open enquiries"}
            image="/images/library.jpg"
          />
        )}
        {(rows || []).map((row) => {
          const name =
            user?.role === "TEACHER"
              ? `${row.student.firstName} ${row.student.lastName}`
              : `${row.teacher.firstName} ${row.teacher.lastName}`;
          return (
            <Link
              key={row.id}
              href={`/dashboard/messages/${row.id}`}
              className="card-lift flex items-center gap-4 rounded-[1.6rem] bg-white p-5 shadow-sm"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-navy font-display text-lg text-gold">
                {name[0]}
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-navy">{name}</span>
                <span className="mt-1 block truncate text-sm text-navy/60">
                  {row.lastMessage?.body || "No messages yet"}
                </span>
              </span>
              {row.lastMessage?.createdAt && (
                <span className="ml-auto shrink-0 text-xs text-navy/40">
                  {new Date(row.lastMessage.createdAt).toLocaleDateString()}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
