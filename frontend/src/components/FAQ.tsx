"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { defaultFaqs } from "@/lib/faqs";

export { defaultFaqs };

export function FAQ({ items = defaultFaqs }: { items?: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-navy/10 rounded-3xl bg-white">
      {items.map((item, i) => (
        <button
          key={item.q}
          type="button"
          onClick={() => setOpen(open === i ? -1 : i)}
          className="w-full px-6 py-5 text-left"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="font-medium text-navy">{item.q}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 text-navy/50 transition ${open === i ? "rotate-180" : ""}`} />
          </div>
          <div
            className={`grid transition-all duration-300 ${open === i ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          >
            <p className="overflow-hidden text-sm leading-7 text-navy/70">{item.a}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
