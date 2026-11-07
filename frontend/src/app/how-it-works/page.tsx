import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = { title: "How it works" };

const studentSteps = [
  {
    title: "Find an English teacher",
    body: "Search the directory by price, country, experience, specialization and level. Open a profile to read qualifications, reviews, availability and how that teacher accepts payment.",
    image: "/images/teachers-group.jpg",
  },
  {
    title: "Contact the teacher and arrange lessons",
    body: "Send an enquiry. For you, contact is always free. The teacher is charged an advertising credit only if you are a new student for them. Repeat messages cost them nothing.",
    image: "/images/student-study.jpg",
  },
  {
    title: "Learn online through Zoom or Google Meet",
    body: "The teacher pastes a meeting link into the scheduled lesson. Join from your dashboard when class time arrives. Pay the teacher directly using the method on their profile.",
    image: "/images/materials.jpg",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <PageHero
        kicker="How it works"
        title="Three steps from search to a live lesson."
        subtitle="Merit matches students with independent English teachers. We do not collect lesson fees. We do not host the video classroom."
        image="/images/hero.jpg"
      />
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-20">
        {studentSteps.map((step, i) => (
          <Reveal key={step.title}>
            <article className={`grid items-center gap-10 md:grid-cols-2 ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
              <div className="img-zoom overflow-hidden rounded-[2rem]">
                <img src={step.image} alt="" className="h-80 w-full object-cover" />
              </div>
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-gold">Step {i + 1}</div>
                <h2 className="mt-3 font-display text-3xl text-navy">{step.title}</h2>
                <p className="mt-4 leading-8 text-navy/75">{step.body}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "For students", body: "Search is free. Contact is free. You pay the teacher for the hour you booked, using the method on their profile." },
            { title: "For teachers", body: "Complete a profile, wait for approval, then buy credits only if you want new students. Existing students message for free." },
            { title: "For administrators", body: "Review applications, set the contact fee, feature profiles, and audit every wallet movement on a ledger." },
          ].map((item) => (
            <div key={item.title} className="rounded-[1.6rem] bg-white p-6 shadow-sm">
              <h3 className="font-display text-2xl text-navy">{item.title}</h3>
              <p className="mt-3 leading-7 text-navy/70">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-3xl text-navy">Organic listing and paid promotion</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.6rem] bg-cream p-6">
              <h3 className="font-display text-2xl text-navy">Organic directory</h3>
              <p className="mt-3 leading-7 text-navy/75">Approved teachers can appear in search. A student viewing a profile never costs the teacher money. This is ordinary marketplace visibility.</p>
            </div>
            <div className="rounded-[1.6rem] bg-navy p-6 text-cream">
              <h3 className="font-display text-2xl">Paid first-contact advertising</h3>
              <p className="mt-3 leading-7 text-cream/80">When a new student contacts a teacher, one advertising credit is used. Featured placement can lift a profile in results. Repeat students are never charged again.</p>
            </div>
          </div>
        </div>
      </section>
      <CtaBand
        title="Ready to start?"
        body="Create a free student account, or apply as a teacher and keep 100% of your lesson fees."
        primary={{ href: "/teachers", label: "Find a teacher" }}
        secondary={{ href: "/become-a-teacher", label: "Teach on Merit" }}
      />
    </div>
  );
}
