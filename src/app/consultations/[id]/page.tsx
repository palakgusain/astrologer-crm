"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  CONSULTATION_STATUSES,
  CONSULTATION_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  getPaymentMethodLabel,
  getTypeLabel,
} from "@/lib/constants";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { StatusBadge, PaymentBadge } from "@/components/Badge";
import { Input, Select, Textarea } from "@/components/FormFields";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Avatar } from "@/components/Avatar";

type Consultation = {
  id: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  sessionNotes: string | null;
  fee: number | null;
  paymentStatus: string;
  paymentMethod: string | null;
  paidAt: string | null;
  paymentNotes: string | null;
  client: { id: string; name: string; phone: string | null };
};

export default function ConsultationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [consultationId, setConsultationId] = useState("");
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setConsultationId(id);
      fetch(`/api/consultations/${id}`).then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setConsultation(data);
        } else {
          setConsultation(null);
        }
        setLoading(false);
      });
    });
  }, [params]);

  const handleDelete = async () => {
    if (!confirm("Delete this consultation?")) return;
    await fetch(`/api/consultations/${consultationId}`, { method: "DELETE" });
    router.push("/consultations");
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const scheduledDate = formData.get("scheduledDate") as string;
    const scheduledTime = formData.get("scheduledTime") as string;

    const data = {
      scheduledAt: `${scheduledDate}T${scheduledTime}`,
      duration: formData.get("duration"),
      type: formData.get("type"),
      status: formData.get("status"),
      sessionNotes: formData.get("sessionNotes"),
      fee: formData.get("fee"),
      paymentStatus: formData.get("paymentStatus"),
      paymentMethod: formData.get("paymentMethod"),
      paymentNotes: formData.get("paymentNotes"),
    };

    const res = await fetch(`/api/consultations/${consultationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setError("Failed to update consultation");
      setSaving(false);
      return;
    }

    const updated = await res.json();
    setConsultation(updated);
    setEditing(false);
    setSaving(false);
  };

  const markCompleted = async () => {
    const res = await fetch(`/api/consultations/${consultationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    if (res.ok) {
      setConsultation(await res.json());
    }
  };

  const markPaid = async () => {
    const res = await fetch(`/api/consultations/${consultationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: "paid" }),
    });
    if (res.ok) {
      setConsultation(await res.json());
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading...</div>;
  }

  if (!consultation) {
    return <div className="py-12 text-center text-sm text-red-600">Consultation not found</div>;
  }

  const scheduledDate = new Date(consultation.scheduledAt);

  return (
    <div>
      <PageHeader
        title={getTypeLabel(consultation.type)}
        description={`Consultation with ${consultation.client.name}`}
        action={
          <div className="flex flex-wrap gap-2">
            {consultation.status === "scheduled" && (
              <Button variant="secondary" onClick={markCompleted}>
                Mark completed
              </Button>
            )}
            {consultation.paymentStatus !== "paid" && consultation.paymentStatus !== "waived" && (
              <Button variant="secondary" onClick={markPaid}>
                Mark paid
              </Button>
            )}
            <Button variant="secondary" onClick={() => setEditing(!editing)}>
              {editing ? "Cancel" : "Edit"}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardBody>
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Client</h2>
              <Link
                href={`/clients/${consultation.client.id}`}
                className="flex items-center gap-3 rounded-md border border-slate-200 p-3 transition-colors hover:bg-slate-50"
              >
                <Avatar name={consultation.client.name} size="md" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{consultation.client.name}</p>
                  {consultation.client.phone && (
                    <p className="text-xs text-slate-500">{consultation.client.phone}</p>
                  )}
                </div>
              </Link>

              <dl className="mt-5 space-y-3 border-t border-slate-200 pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Scheduled</dt>
                  <dd className="font-medium text-slate-900">
                    {formatDateTime(consultation.scheduledAt)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Duration</dt>
                  <dd className="font-medium text-slate-900">{consultation.duration} min</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    <StatusBadge status={consultation.status} />
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Payment" />
            <CardBody className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Fee</span>
                <span className="font-semibold text-slate-900">{formatCurrency(consultation.fee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <PaymentBadge status={consultation.paymentStatus} />
              </div>
              {consultation.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Method</span>
                  <span className="text-slate-900">
                    {getPaymentMethodLabel(consultation.paymentMethod)}
                  </span>
                </div>
              )}
              {consultation.paidAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Paid on</span>
                  <span className="text-slate-900">{formatDate(consultation.paidAt)}</span>
                </div>
              )}
              {consultation.paymentNotes && (
                <p className="rounded-md bg-slate-50 p-3 text-slate-600">{consultation.paymentNotes}</p>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {editing ? (
            <Card>
              <form onSubmit={handleUpdate}>
                <CardBody className="space-y-4">
                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Date"
                      name="scheduledDate"
                      type="date"
                      defaultValue={scheduledDate.toISOString().split("T")[0]}
                      required
                    />
                    <Input
                      label="Time"
                      name="scheduledTime"
                      type="time"
                      defaultValue={scheduledDate.toTimeString().slice(0, 5)}
                      required
                    />
                    <Select
                      label="Type"
                      name="type"
                      defaultValue={consultation.type}
                      options={CONSULTATION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
                    />
                    <Select
                      label="Duration"
                      name="duration"
                      defaultValue={String(consultation.duration)}
                      options={[
                        { value: "30", label: "30 minutes" },
                        { value: "45", label: "45 minutes" },
                        { value: "60", label: "60 minutes" },
                        { value: "90", label: "90 minutes" },
                      ]}
                    />
                    <Select
                      label="Status"
                      name="status"
                      defaultValue={consultation.status}
                      options={CONSULTATION_STATUSES.map((s) => ({
                        value: s.value,
                        label: s.label,
                      }))}
                    />
                    <Input
                      label="Fee (₹)"
                      name="fee"
                      type="number"
                      min="0"
                      step="100"
                      defaultValue={consultation.fee ?? ""}
                    />
                    <Select
                      label="Payment status"
                      name="paymentStatus"
                      defaultValue={consultation.paymentStatus}
                      options={PAYMENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
                    />
                    <Select
                      label="Payment method"
                      name="paymentMethod"
                      defaultValue={consultation.paymentMethod ?? ""}
                      options={[
                        { value: "", label: "Not specified" },
                        ...PAYMENT_METHODS.map((m) => ({ value: m.value, label: m.label })),
                      ]}
                    />
                  </div>
                  <Input
                    label="Payment notes"
                    name="paymentNotes"
                    defaultValue={consultation.paymentNotes ?? ""}
                  />
                  <Textarea
                    label="Session notes"
                    name="sessionNotes"
                    rows={6}
                    defaultValue={consultation.sessionNotes ?? ""}
                    placeholder="Record findings, recommendations, remedies..."
                  />
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </CardBody>
              </form>
            </Card>
          ) : (
            <Card>
              <CardHeader title="Session notes" />
              <CardBody>
                {consultation.sessionNotes ? (
                  <p className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                    {consultation.sessionNotes}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    No notes recorded yet. Click Edit to add session notes.
                  </p>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
