"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

type ChatMessage = {
  id: string;
  body: string;
  fromStaff: boolean;
  createdAt: string;
};

type Thread = {
  id: string;
  name: string;
  email: string;
  status: string;
  messages: ChatMessage[];
};

const VISITOR_KEY = "merit_support_visitor";

function visitorId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function LiveChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<Thread | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [unseen, setUnseen] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenCount = useRef(0);

  useEffect(() => {
    if (user) {
      setName(`${user.firstName} ${user.lastName}`.trim());
      setEmail(user.email);
    }
  }, [user]);

  async function load() {
    try {
      const data = await api<Thread | null>(`/support/me?visitorId=${encodeURIComponent(visitorId())}`);
      if (data?.id) {
        setThread(data);
        const extra = Math.max(0, data.messages.length - seenCount.current);
        if (!open) setUnseen(extra);
      }
    } catch {
      /* widget stays quiet if the API is asleep */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, open ? 4000 : 20000);
    return () => clearInterval(t);
  }, [open]);

  useEffect(() => {
    if (open && thread) {
      seenCount.current = thread.messages.length;
      setUnseen(0);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, thread?.messages.length]);

  if (user?.role === "ADMIN") return null;

  async function send(e: FormEvent) {
    e.preventDefault();
    setError("");
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      const next = thread
        ? await api<Thread>(`/support/${thread.id}/messages`, {
            method: "POST",
            body: JSON.stringify({ visitorId: visitorId(), body }),
          })
        : await api<Thread>("/support", {
            method: "POST",
            body: JSON.stringify({
              visitorId: visitorId(),
              name: name.trim(),
              email: email.trim(),
              body,
            }),
          });
      setThread(next);
      setDraft("");
      seenCount.current = next.messages.length;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[32rem] w-[min(100vw-1.5rem,22rem)] flex-col overflow-hidden rounded-[1.4rem] bg-white shadow-2xl">
          <div className="bg-navy px-4 py-3 text-cream">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-gold">Merit desk</p>
                <h2 className="font-display text-xl">Chat with us</h2>
                <p className="mt-1 text-xs text-cream/65">Account, approval and wallet questions. Lesson questions go to your teacher.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="text-cream/70 hover:text-cream">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="chat-scroll flex-1 space-y-3 overflow-y-auto bg-cream/40 px-4 py-4">
            {!thread && (
              <p className="rounded-2xl bg-white p-3 text-sm leading-6 text-navy/75">
                Hello — leave your name and a short question. An administrator will reply in this window.
              </p>
            )}
            {(thread?.messages || []).map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                  message.fromStaff ? "bg-white text-navy" : "ml-auto bg-navy text-cream"
                }`}
              >
                {message.body}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="space-y-2 border-t border-navy/10 p-3">
            {!thread && (
              <div className="grid grid-cols-2 gap-2">
                <input className="field py-2 text-sm" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <input className="field py-2 text-sm" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            )}
            <div className="flex gap-2">
              <input
                className="field py-2 text-sm"
                placeholder="Write a message"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                required
              />
              <button className="btn-primary px-3 py-2" disabled={sending} aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </div>
            {error && <p className="text-xs text-red-700">{error}</p>}
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-navy text-gold shadow-lg transition hover:bg-navy-800"
        aria-label={open ? "Close live chat" : "Open live chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unseen > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-medium text-navy">
            {unseen}
          </span>
        )}
      </button>
    </div>
  );
}
