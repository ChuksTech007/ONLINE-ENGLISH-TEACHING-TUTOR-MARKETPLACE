"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";

type Message = { id: string; body: string; fromStaff: boolean; createdAt: string };
type Thread = {
  id: string;
  name: string;
  email: string;
  status: string;
  lastMessageAt: string;
  messages: Message[];
};

export default function AdminSupportPage() {
  const [rows, setRows] = useState<Thread[] | null>(null);
  const [active, setActive] = useState<Thread | null>(null);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const activeId = useRef<string | null>(null);

  async function loadList() {
    const data = await api<Thread[]>("/admin/support");
    setRows(data);
    if (activeId.current) {
      setActive(await api<Thread>(`/admin/support/${activeId.current}`));
    }
  }

  useEffect(() => {
    loadList();
    const t = setInterval(loadList, 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length]);

  async function openThread(id: string) {
    activeId.current = id;
    setActive(await api<Thread>(`/admin/support/${id}`));
  }

  async function reply(e: FormEvent) {
    e.preventDefault();
    if (!active || !draft.trim()) return;
    const next = await api<Thread>(`/admin/support/${active.id}/messages`, {
      method: "POST",
      body: JSON.stringify({ body: draft }),
    });
    setDraft("");
    setActive(next);
    await loadList();
  }

  async function setStatus(status: string) {
    if (!active) return;
    const next = await api<Thread>(`/admin/support/${active.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setActive(next);
    await loadList();
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-navy">Customer chat</h1>
      <p className="mt-2 text-sm text-navy/60">
        Visitors write from the live-chat bubble. This is platform support, not a lesson classroom.
      </p>
      {rows && rows.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title="No customer chats yet"
            body="When a visitor uses the chat bubble, the thread appears here so you can reply."
            image="/images/library.jpg"
          />
        </div>
      )}
      {rows && rows.length > 0 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-2">
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => openThread(row.id)}
                className={`w-full rounded-[1.4rem] p-4 text-left shadow-sm ${
                  active?.id === row.id ? "bg-navy text-cream" : "bg-white text-navy"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{row.name}</span>
                  <StatusBadge value={row.status} />
                </div>
                <p className={`mt-1 truncate text-sm ${active?.id === row.id ? "text-cream/70" : "text-navy/55"}`}>
                  {row.messages[0]?.body || "No messages"}
                </p>
                <p className={`mt-1 text-xs ${active?.id === row.id ? "text-cream/45" : "text-navy/40"}`}>
                  {row.email} · {new Date(row.lastMessageAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
          <div className="flex min-h-[28rem] flex-col rounded-[1.6rem] bg-white p-5 shadow-sm">
            {!active ? (
              <p className="m-auto text-sm text-navy/50">Select a conversation.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-navy/10 pb-4">
                  <div>
                    <h2 className="font-display text-2xl text-navy">{active.name}</h2>
                    <p className="text-sm text-navy/55">{active.email}</p>
                  </div>
                  <button
                    className="btn-soft"
                    onClick={() => setStatus(active.status === "OPEN" ? "CLOSED" : "OPEN")}
                  >
                    {active.status === "OPEN" ? "Close chat" : "Reopen"}
                  </button>
                </div>
                <div className="chat-scroll mt-4 flex-1 space-y-3 overflow-y-auto">
                  {active.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        message.fromStaff ? "ml-auto bg-navy text-cream" : "bg-cream text-navy"
                      }`}
                    >
                      <p>{message.body}</p>
                      <p className={`mt-1 text-[10px] ${message.fromStaff ? "text-cream/55" : "text-navy/40"}`}>
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <form onSubmit={reply} className="mt-4 flex gap-2">
                  <input
                    className="field flex-1"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Reply as Merit"
                  />
                  <button className="btn-primary">Send</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
