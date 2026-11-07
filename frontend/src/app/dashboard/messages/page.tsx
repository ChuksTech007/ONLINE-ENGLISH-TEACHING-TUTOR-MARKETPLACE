"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Conversation = {
  id: string;
  student: { firstName: string; lastName: string };
  teacher: { firstName: string; lastName: string };
  lastMessage?: { body: string; createdAt: string } | null;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Conversation[]>([]);
  useEffect(() => {
    api<Conversation[]>("/messages").then(setRows);
  }, []);
  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Messages</h1>
      <div className="mt-6 space-y-3">
        {rows.map((row) => {
          const name =
            user?.role === "TEACHER"
              ? `${row.student.firstName} ${row.student.lastName}`
              : `${row.teacher.firstName} ${row.teacher.lastName}`;
          return (
            <Link key={row.id} href={`/dashboard/messages/${row.id}`} className="block rounded-3xl bg-white p-5">
              <div className="font-medium text-navy">{name}</div>
              <div className="mt-1 text-sm text-navy/60">{row.lastMessage?.body || "No messages yet"}</div>
            </Link>
          );
        })}
        {rows.length === 0 && <p>No conversations yet.</p>}
      </div>
    </div>
  );
}
