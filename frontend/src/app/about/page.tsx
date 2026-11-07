import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: "About us" };

export default function AboutPage() {
  return (
    <div>
      <PageHero
        kicker="About Merit"
        title="A marketplace, not a school that keeps a cut."
        subtitle="Merit exists so independent English teachers can be discovered internationally without surrendering their lesson income."
        image="/images/library.jpg"
      />
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-4xl text-navy">Why we built this</h2>
          <p className="mt-5 leading-8 text-navy/75">
            Too many platforms sit between the teacher and the student, taking a percentage of every hour taught. Merit is an advertising marketplace. We help students discover qualified teachers. We help teachers attract new students. Lessons are taught on Zoom or Google Meet. Payment for those lessons is a private arrangement between the two of you.
          </p>
          <p className="mt-4 leading-8 text-navy/75">
            Profiles are reviewed before they go live. The advertising wallet is automated, auditable and designed so a teacher can trace every deduction to a specific first contact.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <img src="/images/teachers-group.jpg" alt="Merit teachers" className="h-full w-full rounded-[2rem] object-cover" />
        </Reveal>
      </section>
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
          {[
            { title: "For students", body: "Search, compare, contact and learn. You are never charged by Merit. You pay the teacher you choose." },
            { title: "For teachers", body: "Own your prices, your calendar and your payment methods. Buy credits only for new student acquisition." },
            { title: "For the platform", body: "Revenue comes from advertising credits. That is the entire commercial model. It does not change after launch." },
          ].map((item) => (
            <div key={item.title} className="rounded-[1.6rem] bg-cream p-6">
              <h3 className="font-display text-2xl text-navy">{item.title}</h3>
              <p className="mt-3 leading-7 text-navy/75">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
      <CtaBand
        title="Meet the teachers"
        body="Every public profile has been approved. Open one, read the reviews, and send an enquiry if it fits."
        primary={{ href: "/teachers", label: "Browse teachers" }}
        secondary={{ href: "/contact", label: "Contact Merit" }}
      />
    </div>
  );
}
