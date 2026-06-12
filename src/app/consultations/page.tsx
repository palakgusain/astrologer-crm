"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getTypeLabel, PAYMENT_STATUSES, CONSULTATION_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { StatusBadge, PaymentBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Select } from "@/components/FormFields";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";

type Consultation = {
  id: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  fee: number | null;
  paymentStatus: string;
  client: { id: string; name: string };
};

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (paymentFilter) params.set("paymentStatus", paymentFilter);

      const res = await fetch(`/api/consultations?${params}`);
      const data = await res.json();
      setConsultations(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    fetchConsultations();
  }, [statusFilter, paymentFilter]);

  return (
    <div>
      <PageHeader
        title="Consultations"
        description="Schedule and manage astrology sessions with payment tracking"
        action={
          <Button href="/consultations/new">
            <Plus className="h-4 w-4" />
            Schedule consultation
          </Button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 max-w-lg">
        <Select
          label="Session status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "", label: "All statuses" },
            ...CONSULTATION_STATUSES.map((s) => ({ value: s.value, label: s.label })),
          ]}
        />
        <Select
          label="Payment status"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          options={[
            { value: "", label: "All payments" },
            ...PAYMENT_STATUSES.map((s) => ({ value: s.value, label: s.label })),
          ]}
        />
      </div>

      {loading ? (
        <div className="surface-card py-16 text-center text-sm text-slate-500">
          Loading consultations...
        </div>
      ) : consultations.length === 0 ? (
        <EmptyState
          title="No consultations found"
          description="Schedule your first consultation with a client"
          action={
            <Button href="/consultations/new">
              <Plus className="h-4 w-4" />
              Schedule consultation
            </Button>
          }
        />
      ) : (
        <Card>
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Client
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Scheduled
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Fee
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Session
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Payment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consultations.map((consultation) => (
                <tr key={consultation.id} className="table-row-hover">
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <Link
                      href={`/consultations/${consultation.id}`}
                      className="flex items-center gap-3"
                    >
                      <Avatar name={consultation.client.name} size="sm" />
                      <span className="text-sm font-medium text-slate-900 hover:underline">
                        {consultation.client.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {getTypeLabel(consultation.type)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {formatDateTime(consultation.scheduledAt)}
                  </td>
                  <td className="px-5 py-3.5 text-sm tabular-nums text-slate-900">
                    {formatCurrency(consultation.fee)}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={consultation.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <PaymentBadge status={consultation.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
