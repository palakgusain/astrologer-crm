"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Edit, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { parseTags, getTypeLabel } from "@/lib/constants";
import { formatDate, formatDateTime, formatTime } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { Badge, StatusBadge } from "@/components/Badge";
import { Input, Textarea } from "@/components/FormFields";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { Avatar } from "@/components/Avatar";

type Consultation = {
  id: string;
  scheduledAt: string;
  duration: number;
  type: string;
  status: string;
  sessionNotes: string | null;
};

type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  birthTime: string | null;
  birthPlace: string | null;
  tags: string | null;
  notes: string | null;
  consultations: Consultation[];
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
      {children}
    </h3>
  );
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [clientId, setClientId] = useState<string>("");
  const [client, setClient] = useState<Client | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setClientId(id);
      fetch(`/api/clients/${id}`)
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            setClient(data);
          } else {
            setClient(null);
          }
          setLoading(false);
        });
    });
  }, [params]);

  const handleDelete = async () => {
    if (!confirm("Delete this client and all their consultations?")) return;
    await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
    router.push("/clients");
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch(`/api/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setError("Failed to update client");
      setSaving(false);
      return;
    }

    const updated = await res.json();
    setClient((prev) => (prev ? { ...prev, ...updated } : prev));
    setEditing(false);
    setSaving(false);
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-500">Loading...</div>;
  }

  if (!client) {
    return <div className="py-12 text-center text-sm text-red-600">Client not found</div>;
  }

  return (
    <div>
      <PageHeader
        title={client.name}
        description="Client profile and consultation history"
        action={
          <div className="flex gap-2">
            <Button href={`/consultations/new?clientId=${client.id}`} variant="secondary">
              <Calendar className="h-4 w-4" />
              Schedule
            </Button>
            <Button variant="secondary" onClick={() => setEditing(!editing)}>
              <Edit className="h-4 w-4" />
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
        <div className="lg:col-span-1">
          {editing ? (
            <Card>
              <form onSubmit={handleUpdate}>
                <CardBody className="space-y-4">
                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  <Input label="Full name" name="name" defaultValue={client.name} required />
                  <Input label="Phone" name="phone" defaultValue={client.phone ?? ""} />
                  <Input label="Email" name="email" defaultValue={client.email ?? ""} />
                  <Input label="Birth date" name="birthDate" type="date" defaultValue={client.birthDate?.split("T")[0] ?? ""} />
                  <Input label="Birth time" name="birthTime" type="time" defaultValue={client.birthTime ?? ""} />
                  <Input label="Birth place" name="birthPlace" defaultValue={client.birthPlace ?? ""} />
                  <Input label="Tags" name="tags" defaultValue={client.tags ?? ""} />
                  <Textarea label="Notes" name="notes" rows={3} defaultValue={client.notes ?? ""} />
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </CardBody>
              </form>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-5">
                  <Avatar name={client.name} size="lg" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{client.name}</h2>
                    <p className="text-xs text-slate-500">Client profile</p>
                  </div>
                </div>

                <SectionLabel>Contact</SectionLabel>
                <dl className="space-y-3">
                  {client.phone && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      <Phone className="h-4 w-4 text-slate-400" />
                      {client.phone}
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2.5 text-sm text-slate-700">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {client.email}
                    </div>
                  )}
                </dl>

                <div className="mt-6 border-t border-slate-200 pt-5">
                  <SectionLabel>Birth details</SectionLabel>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Date</dt>
                      <dd className="font-medium text-slate-900">{formatDate(client.birthDate)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Time</dt>
                      <dd className="font-medium text-slate-900">{formatTime(client.birthTime)}</dd>
                    </div>
                    {client.birthPlace && (
                      <div className="flex items-start gap-2 pt-1">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <dd className="text-slate-700">{client.birthPlace}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {parseTags(client.tags).length > 0 && (
                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <SectionLabel>Tags</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {parseTags(client.tags).map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {client.notes && (
                  <div className="mt-6 border-t border-slate-200 pt-5">
                    <SectionLabel>Notes</SectionLabel>
                    <p className="rounded-md bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                      {client.notes}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader title={`Consultation history (${client.consultations.length})`} />
            {client.consultations.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No consultations yet.{" "}
                <Link href={`/consultations/new?clientId=${client.id}`} className="font-medium text-slate-900 underline">
                  Schedule one
                </Link>
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {client.consultations.map((consultation) => (
                  <Link
                    key={consultation.id}
                    href={`/consultations/${consultation.id}`}
                    className="table-row-hover block px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {getTypeLabel(consultation.type)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDateTime(consultation.scheduledAt)} · {consultation.duration} min
                        </p>
                        {consultation.sessionNotes && (
                          <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                            {consultation.sessionNotes}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={consultation.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
