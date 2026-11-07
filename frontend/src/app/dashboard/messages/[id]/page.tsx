"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type Thread = {
  id: string;
  student: { user: { firstName: string; lastName: string } };
  teacher: { user: { firstName: string; lastName: string } };
  messages: { id: string; body: string; senderId: string; createdAt: string }[];
};

export default function ThreadPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [thread, setThread] = useState<Thread | null>(null);
  const [body, setBody] = useState("");

  async function load() {
    setThread(await api<Thread>(`/messages/${id}`));
  }

  useEffect(() => {
    load();
  }, [id]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    await api(`/messages/${id}`, { method: "POST", body: JSON.stringify({ body }) });
    setBody("");
    await load();
  }

  if (!thread) return <p>Loading conversation…</p>;

  return (
    <div className="rounded-3xl bg-white p-5">
      <h1 className="font-display text-2xl text-navy">
        {thread.student.user.firstName} & {thread.teacher.user.firstName}
      </h1>
      <div className="mt-6 space-y-3">
        {thread.messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.senderId === user?.id ? "ml-auto bg-navy text-cream" : "bg-cream text-navy"}`}
          >
            {message.body}
          </div>
        ))}
      </div>
      <form onSubmit={send} className="mt-6 flex gap-2">
        <input className="flex-1 rounded-full border border-navy/10 px-4 py-3" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message" />
        <button className="rounded-full bg-navy px-5 text-cream">Send</button>
      </form>
    </div>
  );
}
