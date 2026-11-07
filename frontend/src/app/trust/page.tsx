import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";
import { ShieldCheck, Eye, Wallet, Video, BadgeCheck, Lock } from "lucide-react";

export const metadata: Metadata = { title: "Trust and safety" };

const pillars = [
  {
    icon: BadgeCheck,
    title: "Every public teacher is reviewed",
    body: "New teacher profiles stay pending until an administrator checks the photograph, qualifications, price and lesson information. Only approved teachers appear in the directory.",
  },
  {
    icon: Eye,
    title: "Views never cost a teacher money",
    body: "Organic listing is free. A student can open a profile, read reviews and compare prices without triggering a charge. Advertising credit is used only on a first contact.",
  },
  {
    icon: Wallet,
    title: "Lesson money never sits with Merit",
    body: "Students pay teachers directly using PayPal, Wise, bank transfer or another method the teacher publishes. Merit’s only revenue is advertising credit.",
  },
  {
    icon: Video,
    title: "Classrooms stay on tools you trust",
    body: "Lessons happen on Zoom, Google Meet or Microsoft Teams. Merit stores the meeting link so both of you can join from the dashboard. We do not host the video call.",
  },
  {
    icon: ShieldCheck,
    title: "Every wallet move is on a ledger",
    body: "Purchases, first-contact deductions, refunds and administrator credits are recorded with a previous balance, a new balance and a reference. Teachers can audit their own advertising spend.",
  },
  {
    icon: Lock,
    title: "Private files stay private",
    body: "Certificate uploads are for the teacher and administrators. Payment instructions appear only because the teacher chose to publish them. Conversations are visible to the two people in the thread.",
  },
];

export default function TrustPage() {
  return (
    <div>
      <PageHero
        kicker="Trust and safety"
        title="A marketplace you can explain in one sentence."
        subtitle="Students contact teachers for free. Teachers keep 100% of lesson fees. Merit charges an advertising credit only when a new student makes first contact."
        image="/images/library.jpg"
      />
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map((item, i) => (
            <Reveal key={item.title} delay={i * 60}>
              <article className="h-full rounded-[1.6rem] bg-white p-7 shadow-sm">
                <item.icon className="h-7 w-7 text-gold" />
                <h2 className="mt-4 font-display text-2xl text-navy">{item.title}</h2>
                <p className="mt-3 leading-7 text-navy/70">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
          <Reveal>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/materials.jpg" alt="Lesson notes" className="h-80 w-full rounded-[2rem] object-cover" />
          </Reveal>
          <Reveal delay={80}>
            <p className="text-sm uppercase tracking-[0.18em] text-gold">What Merit is not</p>
            <h2 className="mt-2 font-display text-4xl text-navy">Not a school. Not an escrow. Not a video host.</h2>
            <p className="mt-4 leading-8 text-navy/75">
              We do not employ teachers, set their prices, collect their lesson fees or sit in the classroom. If a lesson payment is late, that conversation belongs to the student and the teacher. If a wallet deduction looks wrong, the teacher can open the ledger and an administrator can reverse it with a recorded credit.
            </p>
          </Reveal>
        </div>
      </section>
      <CtaBand
        title="Read a profile with that model in mind"
        body="Compare qualifications, reviews and payment methods. Contacting a teacher never costs the student."
        primary={{ href: "/teachers", label: "Browse teachers" }}
        secondary={{ href: "/faq", label: "Read the FAQ" }}
      />
    </div>
  );
}
