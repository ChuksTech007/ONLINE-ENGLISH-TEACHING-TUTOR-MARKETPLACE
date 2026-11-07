"use client";

import { useState } from "react";
import { PageHero } from "@/components/PageHero";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <PageHero
        kicker="Contact"
        title="We are here for the platform. Your teacher is here for the lesson."
        subtitle="For lesson questions, message your teacher inside Merit. For account, advertising or approval questions, write to us."
        image="/images/library.jpg"
      />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl text-navy">Write to the team</h2>
          <p className="mt-3 text-navy/70">Typical replies cover teacher approval, wallet deductions and account access. We do not mediate lesson payments between you and a teacher.</p>
          <div className="mt-8 space-y-4 text-navy/80">
            <p><span className="text-navy/50">Email</span><br />support@merit.local</p>
            <p><span className="text-navy/50">Hours</span><br />Monday–Friday, replies within one working day</p>
          </div>
        </div>
        {sent ? (
          <div className="rounded-[1.6rem] bg-white p-8">
            <h3 className="font-display text-2xl text-navy">Message received</h3>
            <p className="mt-3 text-navy/70">Thank you. If this is about a lesson, please also check Messages in your dashboard - your teacher may already have replied.</p>
          </div>
        ) : (
          <form
            className="space-y-3 rounded-[1.6rem] bg-white p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <input className="field" placeholder="Full name" required />
            <input className="field" type="email" placeholder="Email" required />
            <select className="field" defaultValue="">
              <option value="" disabled>Topic</option>
              <option>Teacher approval</option>
              <option>Advertising wallet</option>
              <option>Student account</option>
              <option>Something else</option>
            </select>
            <textarea className="field h-32" placeholder="How can we help?" required />
            <button className="btn-primary w-full">Send message</button>
          </form>
        )}
      </div>
    </div>
  );
}
