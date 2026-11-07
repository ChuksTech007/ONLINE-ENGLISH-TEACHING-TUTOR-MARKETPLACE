const tones: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-800",
  PENDING: "bg-gold-soft text-navy",
  PENDING_REVIEW: "bg-gold-soft text-navy",
  REJECTED: "bg-red-50 text-red-800",
  SUSPENDED: "bg-red-50 text-red-800",
  SCHEDULED: "bg-sky-50 text-sky-900",
  COMPLETED: "bg-emerald-50 text-emerald-800",
  CANCELLED: "bg-navy/10 text-navy/60",
  REQUESTED: "bg-gold-soft text-navy",
  CONTACTED: "bg-navy/8 text-navy",
  DISCUSSION: "bg-sky-50 text-sky-900",
  TRIAL_SCHEDULED: "bg-gold-soft text-navy",
  ENROLLED: "bg-emerald-50 text-emerald-800",
  CLOSED: "bg-navy/10 text-navy/60",
  PURCHASE: "bg-emerald-50 text-emerald-800",
  DEDUCTION: "bg-gold-soft text-navy",
  ADMIN_CREDIT: "bg-sky-50 text-sky-900",
  REFUND: "bg-emerald-50 text-emerald-800",
  FEATURED: "bg-gold text-navy",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
        tones[value] || "bg-cream text-navy"
      }`}
    >
      {value.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}
