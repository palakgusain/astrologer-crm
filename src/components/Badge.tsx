import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "blue" | "green" | "red" | "amber" | "purple";
  className?: string;
}

const variants = {
  default: "bg-slate-100 text-slate-700",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
  amber: "bg-amber-50 text-amber-800",
  purple: "bg-indigo-50 text-indigo-700",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    scheduled: "blue",
    completed: "green",
    cancelled: "red",
  };

  return (
    <Badge variant={variantMap[status] ?? "default"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function PaymentBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeProps["variant"]> = {
    pending: "amber",
    paid: "green",
    partial: "blue",
    waived: "default",
  };

  const labels: Record<string, string> = {
    pending: "Pending",
    paid: "Paid",
    partial: "Partial",
    waived: "Waived",
  };

  return (
    <Badge variant={variantMap[status] ?? "default"}>
      {labels[status] ?? status}
    </Badge>
  );
}
