"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { DAYS } from "@/lib/specializations";

type Slot = { dayOfWeek: number; startMinute: number; endMinute: number };

function timeValue(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

export default function AvailabilityPage() {
  const { user, refresh } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [timezone, setTimezone] = useState(user?.timezone || "UTC");
  const [duration, setDuration] = useState("60");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    api<{ availability?: Slot[]; timezone?: string }>("/teachers/me").then((data) => {
      setSlots(data.availability || []);
      if (data.timezone) setTimezone(data.timezone);
    });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api("/teachers/me/availability", { method: "PUT", body: JSON.stringify({ slots }) });
    await api("/teachers/me", { method: "PATCH", body: JSON.stringify({ timezone }) });
    await refresh();
    setSaved("Availability saved. Students see your days and hours, not private meeting links.");
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-navy">Teaching availability</h1>
        <p className="mt-2 text-sm text-navy/60">Set the days, hours and timezone you can teach. Preferred lesson duration helps students book the right length.</p>
      </div>
      <section className="space-y-3 rounded-[1.6rem] bg-white p-6 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="label">Time zone</label>
            <input className="field" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Africa/Lagos" />
          </div>
          <div>
            <label className="label">Preferred lesson duration (minutes)</label>
            <input className="field" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>
        {slots.map((slot, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <select
              className="field py-2"
              value={slot.dayOfWeek}
              onChange={(e) => {
                const next = [...slots];
                next[i] = { ...slot, dayOfWeek: Number(e.target.value) };
                setSlots(next);
              }}
            >
              {DAYS.map((d, idx) => (
                <option key={d} value={idx}>
                  {d}
                </option>
              ))}
            </select>
            <input
              className="field py-2"
              type="time"
              value={timeValue(slot.startMinute)}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                const next = [...slots];
                next[i] = { ...slot, startMinute: h * 60 + m };
                setSlots(next);
              }}
            />
            <input
              className="field py-2"
              type="time"
              value={timeValue(slot.endMinute)}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":").map(Number);
                const next = [...slots];
                next[i] = { ...slot, endMinute: h * 60 + m };
                setSlots(next);
              }}
            />
            <button type="button" className="text-sm text-navy/50" onClick={() => setSlots(slots.filter((_, idx) => idx !== i))}>
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-sm text-navy underline"
          onClick={() => setSlots([...slots, { dayOfWeek: 1, startMinute: 540, endMinute: 720 }])}
        >
          Add availability slot
        </button>
      </section>
      <button className="btn-primary">Save availability</button>
      {saved && <p className="rounded-2xl bg-gold-soft/60 px-4 py-3 text-sm text-navy">{saved}</p>}
    </form>
  );
}
