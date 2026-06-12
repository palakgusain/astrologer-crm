"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { parseTags } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/FormFields";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";

type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  tags: string | null;
  _count: { consultations: number };
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const res = await fetch(`/api/clients?${params}`);
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
      setLoading(false);
    };

    const debounce = setTimeout(fetchClients, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage client profiles, birth details, and contact information"
        action={
          <Button href="/clients/new">
            <Plus className="h-4 w-4" />
            Add client
          </Button>
        }
      />

      <div className="mb-5 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by name, phone, email, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="surface-card py-16 text-center text-sm text-slate-500">
          Loading clients...
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description={
            search
              ? "Try adjusting your search terms"
              : "Get started by adding your first client"
          }
          action={
            !search ? (
              <Button href="/clients/new">
                <Plus className="h-4 w-4" />
                Add client
              </Button>
            ) : undefined
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
                  Contact
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Birth details
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Tags
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Sessions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="table-row-hover">
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <Link href={`/clients/${client.id}`} className="flex items-center gap-3">
                      <Avatar name={client.name} size="sm" />
                      <span className="text-sm font-medium text-slate-900 hover:underline">
                        {client.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm text-slate-900">{client.phone ?? "—"}</div>
                    <div className="text-xs text-slate-500">{client.email ?? ""}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">
                    {client.birthDate ? formatDate(client.birthDate) : "—"}
                    {client.birthPlace && (
                      <div className="text-xs text-slate-400">{client.birthPlace}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {parseTags(client.tags).map((tag) => (
                        <Badge key={tag} variant="default">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm tabular-nums text-slate-600">
                    {client._count.consultations}
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
