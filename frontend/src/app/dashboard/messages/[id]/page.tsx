"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  const endRef = useRef<HTMLDivElement>(null);

  async function load() {
    setThread(await api<Thread>(`/messages/${id}`));
  }

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    await api(`/messages/${id}`, { method: "POST", body: JSON.stringify({ body }) });
    setBody("");
    await load();
  }

  if (!thread) {
    return <div className="skeleton h-[28rem] rounded-[1.6rem]" />;
  }

  return (
    <div className="flex min-h-[32rem] flex-col rounded-[1.6rem] bg-white p-5 shadow-sm">
      <div className="border-b border-navy/10 pb-4">
        <Link href="/dashboard/messages" className="text-xs text-navy/50">
          All conversations
        </Link>
        <h1 className="mt-1 font-display text-2xl text-navy">
          {thread.student.user.firstName} {thread.student.user.lastName} · {thread.teacher.user.firstName}{" "}
          {thread.teacher.user.lastName}
        </h1>
      </div>
      <div className="chat-scroll mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
        {thread.messages.length === 0 && (
          <p className="text-sm text-navy/50">Start the conversation with a clear goal and a suggested time.</p>
        )}
        {thread.messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              message.senderId === user?.id ? "ml-auto bg-navy text-cream" : "bg-cream text-navy"
            }`}
          >
            <p>{message.body}</p>
            <p className={`mt-1 text-[10px] ${message.senderId === user?.id ? "text-cream/55" : "text-navy/40"}`}>
              {new Date(message.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="mt-5 flex gap-2">
        <input
          className="field flex-1"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message"
        />
        <button className="btn-primary">Send</button>
      </form>
    </div>
  );
}
