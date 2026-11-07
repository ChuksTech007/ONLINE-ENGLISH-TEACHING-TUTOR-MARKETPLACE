export default function HowItWorksPage() {
  const steps = [
    {
      title: "Find an English teacher",
      body: "Search the directory by price, country, experience, specialization and availability. Open a profile to read qualifications, reviews and payment methods.",
    },
    {
      title: "Contact the teacher and arrange lessons",
      body: "Send an enquiry. The first new student contact deducts an advertising credit from the teacher’s wallet. Repeat messages from the same student are free. You and the teacher then agree times inside Merit.",
    },
    {
      title: "Learn online through Zoom or Google Meet",
      body: "The teacher pastes a meeting link into the scheduled lesson. Join from your dashboard when class time arrives. Pay the teacher directly using the method on their profile.",
    },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-4xl text-navy">How it works</h1>
      <div className="mt-10 space-y-8">
        {steps.map((step, i) => (
          <div key={step.title} className="rounded-3xl bg-white p-6">
            <div className="text-sm uppercase tracking-wide text-gold">Step {i + 1}</div>
            <h2 className="mt-2 font-display text-2xl text-navy">{step.title}</h2>
            <p className="mt-3 leading-7 text-navy/75">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
