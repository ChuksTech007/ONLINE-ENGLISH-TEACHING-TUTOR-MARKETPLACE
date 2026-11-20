"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { api } from "@/lib/api";
import { FAQ } from "@/components/FAQ";
import { teacherFaqs } from "@/lib/faqs";
import { Reveal } from "@/components/Reveal";

const reasons = [
  {
    title: "Keep 100% of your teaching fees",
    body: "You set your own lesson prices and receive teaching payments directly from your students. Merit English does not take a commission from lessons arranged and paid for directly between you and your students.",
  },
  {
    title: "Pay only for student enquiries",
    body: "Instead of charging a commission on every lesson, we use a prepaid student-contact credit system. You add credits, and a small amount is deducted whenever a new student contacts you through the platform.",
  },
  {
    title: "Set your own teaching rates",
    body: "Whether you offer individual lessons, group classes, conversational English or specialised English training, you remain in control of your pricing.",
  },
  {
    title: "Teach your way",
    body: "Choose how to conduct your lessons. Set up Zoom, Google Meet or Microsoft Teams and arrange lessons with interested students.",
  },
  {
    title: "Connect with students worldwide",
    body: "Showcase your teaching experience, qualifications, specialisations and availability to students searching for English teachers.",
  },
];

const steps = [
  { title: "Create your teacher account", body: "Register on Merit English and provide the information needed to establish your teacher account." },
  { title: "Add advertising credits", body: "Purchase prepaid credits to activate student-contact opportunities. The minimum top-up is $5. You can add more whenever you need to." },
  { title: "Create your teacher profile", body: "Add your photograph, qualifications, specialisations, lesson prices, languages, availability and a short introduction." },
  { title: "Set up online teaching details", body: "Provide your preferred online teaching arrangements, including Zoom, Google Meet or Microsoft Teams details." },
  { title: "Get discovered by students", body: "Your approved profile becomes visible to students searching for English teachers on Merit English." },
  { title: "Receive student enquiries", body: "When a student is interested, they contact you through messaging. A small contact fee is deducted from your prepaid credits for each new student enquiry." },
  { title: "Arrange your lessons and earn", body: "Discuss lessons, agree on schedule and payment, and teach. When students pay you directly, you keep 100% of your teaching fees." },
];

export default function BecomeTeacherPage() {
  const [fee, setFee] = useState("2.00");
  useEffect(() => {
    api<{ contactFee: string }>("/settings/public")
      .then((d) => setFee(d.contactFee))
      .catch(() => undefined);
  }, []);

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-navy text-cream">
        <img src="/images/teacher-walk.jpg" alt="" className="kenburns absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-navy/40" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="text-sm uppercase tracking-[0.22em] text-gold">Teach on Merit English</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl leading-tight md:text-6xl">
            Find students. Teach independently. Keep 100% of your earnings.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-cream/80">
            Your teaching skills deserve to be rewarded. Merit English lets you showcase your services, connect with students worldwide, and manage your lessons independently. No commission on teaching fees. No compulsory revenue sharing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register/teacher" className="btn-gold">
              Get started — join as a teacher
            </Link>
            <Link href="/login/teacher" className="rounded-full border border-cream/30 px-5 py-3 text-cream">
              Login — existing teachers
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal>
          <h2 className="font-display text-4xl text-navy">Why teach on Merit English?</h2>
          <p className="mt-4 max-w-3xl leading-8 text-navy/75">
            Unlike traditional teaching platforms that take a percentage of your lesson payments, Merit English helps you connect with students while you manage your teaching business independently.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {reasons.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <article className="rounded-[1.6rem] bg-white p-6 shadow-sm">
                <div className="text-sm text-gold">0{i + 1}</div>
                <h3 className="mt-2 font-display text-2xl text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-navy/70">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-4xl text-navy">How does it work?</h2>
          <p className="mt-3 text-navy/70">Getting started is straightforward.</p>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {steps.map((step, i) => (
              <div key={step.title} className="rounded-[1.4rem] border border-navy/10 p-5">
                <div className="text-xs uppercase tracking-[0.16em] text-gold">Step {i + 1}</div>
                <h3 className="mt-2 font-display text-2xl text-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-navy/70">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl text-navy">Understanding our pricing model</h2>
          <p className="mt-4 leading-8 text-navy/75">We believe teachers should keep what they earn from teaching. That is why Merit English uses a different approach.</p>
        </div>
        <div className="space-y-4">
          <article className="rounded-[1.6rem] bg-navy p-6 text-cream">
            <h3 className="font-display text-2xl">Option 1: Direct student payments</h3>
            <p className="mt-2 text-sm text-gold">No teaching commission.</p>
            <ul className="mt-4 space-y-2 text-sm text-cream/80">
              {[
                "Minimum advertising credit purchase: $5.",
                "Add as much credit as you wish.",
                `A small fee (currently $${fee}) is deducted when a new student contacts you.`,
                "No commission on lessons.",
                "Students pay you directly using your preferred payment method.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm">Your teaching income belongs to you.</p>
          </article>
          <article className="rounded-[1.6rem] bg-white p-6 shadow-sm">
            <h3 className="font-display text-2xl text-navy">Option 2: Use Merit English as your payment processor</h3>
            <p className="mt-3 text-sm leading-7 text-navy/70">
              Prefer Merit to facilitate collection of payments from your students? You can process student payments through Merit English. A 10% processing fee applies to payments processed through our platform. This is separate from prepaid student-contact credits. You can continue using direct payments if you prefer.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-cream py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-4xl text-navy">Your teaching business. Your rules.</h2>
          <p className="mt-4 max-w-2xl text-navy/75">With Merit English, you remain in control of your rates, schedules, methods, students, online teaching tools and direct payment arrangements. We provide the platform that helps students discover and contact you.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Your teaching rates", "Your lesson schedules", "Your teaching methods", "Your students", "Your online teaching tools", "Your direct payment arrangements"].map((item) => (
              <div key={item} className="rounded-full bg-white px-4 py-3 text-sm text-navy shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="font-display text-4xl text-navy">Who can join?</h2>
        <p className="mt-4 max-w-2xl text-navy/75">We welcome English teachers who are passionate about helping others improve their English language skills.</p>
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {[
            "A qualified English teacher",
            "An experienced language instructor",
            "A conversational English tutor",
            "A business English specialist",
            "An IELTS or examination preparation tutor",
            "A beginner-level English instructor",
            "An independent online English teacher",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-navy/80">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-4xl text-navy">Frequently asked questions</h2>
          <div className="mt-8">
            <FAQ items={teacherFaqs} />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy text-cream">
        <img src="/images/teachers-group.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-navy/80" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="font-display text-3xl md:text-4xl">Ready to grow your teaching business?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-cream/75">
            Your knowledge has value. Your teaching experience has value. And your earnings should reflect your effort. Join Merit English, create your professional teaching profile and start connecting with students looking for the skills you offer.
          </p>
          <p className="mt-3 text-sm text-gold">No lesson commissions. No compulsory revenue sharing.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register/teacher" className="btn-gold">
              Create your teacher account
            </Link>
            <Link href="/login/teacher" className="rounded-full border border-cream/30 px-5 py-3 text-cream">
              Already have an account? Log in
            </Link>
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.2em] text-cream/40">Merit English · Connecting English teachers with students worldwide</p>
        </div>
      </section>
    </div>
  );
}
