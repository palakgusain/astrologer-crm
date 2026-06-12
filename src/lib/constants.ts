export const CONSULTATION_TYPES = [
  { value: "general", label: "General Reading" },
  { value: "horoscope", label: "Horoscope Analysis" },
  { value: "marriage", label: "Marriage Compatibility" },
  { value: "career", label: "Career Guidance" },
  { value: "gemstone", label: "Gemstone Recommendation" },
  { value: "remedial", label: "Remedial Measures" },
] as const;

export const CONSULTATION_STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "blue" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "cancelled", label: "Cancelled", color: "red" },
] as const;

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "waived", label: "Waived" },
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
] as const;

export type ConsultationStatus = (typeof CONSULTATION_STATUSES)[number]["value"];
export type ConsultationType = (typeof CONSULTATION_TYPES)[number]["value"];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]["value"];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export function getStatusLabel(status: string) {
  return CONSULTATION_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function getTypeLabel(type: string) {
  return CONSULTATION_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function getPaymentStatusLabel(status: string) {
  return PAYMENT_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function getPaymentMethodLabel(method: string) {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label ?? method;
}

export function parseTags(tags?: string | null): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function formatTags(tags: string[]): string {
  return tags.filter(Boolean).join(", ");
}
