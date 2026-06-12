"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { Input, Textarea } from "@/components/FormFields";
import { Card, CardBody } from "@/components/Card";

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Failed to create client");
      setLoading(false);
      return;
    }

    const client = await res.json();
    router.push(`/clients/${client.id}`);
  };

  return (
    <div>
      <PageHeader
        title="Add client"
        description="Enter client details and birth information"
      />

      <Card className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardBody className="space-y-6">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Full name *" name="name" required placeholder="Priya Sharma" />
              <Input label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" />
              <Input label="Email" name="email" type="email" placeholder="email@example.com" />
              <Input label="Tags" name="tags" placeholder="vip, repeat-client" />
            </div>

            <div className="border-t border-slate-200 pt-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Birth details</h3>
              <div className="grid gap-5 sm:grid-cols-3">
                <Input label="Birth date" name="birthDate" type="date" />
                <Input label="Birth time" name="birthTime" type="time" />
                <Input label="Birth place" name="birthPlace" placeholder="Mumbai, Maharashtra" />
              </div>
            </div>

            <Textarea
              label="Notes"
              name="notes"
              rows={4}
              placeholder="Client preferences, past readings, special requests..."
            />

            <div className="flex gap-2 border-t border-slate-200 pt-5">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save client"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </form>
      </Card>
    </div>
  );
}
