"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CONSULTATION_STATUSES, CONSULTATION_TYPES, PAYMENT_METHODS, PAYMENT_STATUSES } from "@/lib/constants";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { Input, Select, Textarea } from "@/components/FormFields";
import { Card, CardBody } from "@/components/Card";

type Client = { id: string; name: string };

function NewConsultationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId") ?? "";

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(Array.isArray(data) ? data : []));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const scheduledDate = formData.get("scheduledDate") as string;
    const scheduledTime = formData.get("scheduledTime") as string;

    const data = {
      clientId: formData.get("clientId"),
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

    const res = await fetch("/api/consultations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Failed to create consultation");
      setLoading(false);
      return;
    }

    const consultation = await res.json();
    router.push(`/consultations/${consultation.id}`);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="mx-auto max-w-2xl">
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Select
            label="Client *"
            name="clientId"
            required
            defaultValue={preselectedClientId}
            options={[
              { value: "", label: "Select a client" },
              ...clients.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Date *" name="scheduledDate" type="date" required defaultValue={today} />
            <Input label="Time *" name="scheduledTime" type="time" required defaultValue="10:00" />
            <Select
              label="Consultation type"
              name="type"
              options={CONSULTATION_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />
            <Select
              label="Duration"
              name="duration"
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
              options={CONSULTATION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
            />
          </div>

          <div className="border-t border-slate-200 pt-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Payment</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Fee (₹)" name="fee" type="number" min="0" step="100" placeholder="2000" />
              <Select
                label="Payment status"
                name="paymentStatus"
                options={PAYMENT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              />
              <Select
                label="Payment method"
                name="paymentMethod"
                options={[
                  { value: "", label: "Not specified" },
                  ...PAYMENT_METHODS.map((m) => ({ value: m.value, label: m.label })),
                ]}
              />
              <Input label="Payment notes" name="paymentNotes" placeholder="Advance, discount, etc." />
            </div>
          </div>

          <Textarea
            label="Session notes"
            name="sessionNotes"
            rows={4}
            placeholder="Optional — can be added after the session"
          />

          <div className="flex gap-2 border-t border-slate-200 pt-5">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Schedule consultation"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardBody>
      </form>
    </Card>
  );
}

export default function NewConsultationPage() {
  return (
    <div>
      <PageHeader
        title="Schedule consultation"
        description="Book a new session with a client"
      />
      <Suspense fallback={<div className="py-12 text-center text-sm text-slate-500">Loading...</div>}>
        <NewConsultationForm />
      </Suspense>
    </div>
  );
}
