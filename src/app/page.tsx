import Link from "next/link";
import { Calendar, CheckCircle, Clock, IndianRupee, Users } from "lucide-react";
import { getDashboardStats } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { getTypeLabel } from "@/lib/constants";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { StatusBadge, PaymentBadge } from "@/components/Badge";
import { Card, CardHeader } from "@/components/Card";
import { Avatar } from "@/components/Avatar";

export default async function DashboardPage() {
  const [stats, user] = await Promise.all([getDashboardStats(), getSessionUser()]);
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <PageHeader
        title={`Welcome${user?.name ? `, ${user.name.split(" ")[0]}` : ""}`}
        description={today}
        action={
          <div className="flex gap-2">
            <Button href="/clients/new" variant="secondary">
              Add client
            </Button>
            <Button href="/consultations/new">Schedule consultation</Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total clients"
          value={stats.totalClients}
          icon={<Users className="h-5 w-5" />}
          accent="slate"
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduledCount}
          subtitle="Upcoming sessions"
          icon={<Clock className="h-5 w-5" />}
          accent="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completedCount}
          subtitle="Finished sessions"
          icon={<CheckCircle className="h-5 w-5" />}
          accent="green"
        />
        <StatCard
          title="Today"
          value={stats.todayConsultations.length}
          subtitle="Sessions scheduled"
          icon={<Calendar className="h-5 w-5" />}
          accent="amber"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          subtitle="Paid consultations"
          icon={<IndianRupee className="h-5 w-5" />}
          accent="green"
        />
        <StatCard
          title="Pending payments"
          value={stats.pendingPaymentsCount}
          subtitle="Awaiting collection"
          icon={<IndianRupee className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Today's consultations" />
          <div className="divide-y divide-slate-100">
            {stats.todayConsultations.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No consultations scheduled for today
              </p>
            ) : (
              stats.todayConsultations.map((consultation) => (
                <Link
                  key={consultation.id}
                  href={`/consultations/${consultation.id}`}
                  className="table-row-hover flex items-center justify-between px-5 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={consultation.client.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {consultation.client.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {getTypeLabel(consultation.type)} · {formatCurrency(consultation.fee)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-700">
                      {formatDateTime(consultation.scheduledAt).split(",")[1]?.trim()}
                    </p>
                    <div className="mt-1 flex justify-end gap-1">
                      <StatusBadge status={consultation.status} />
                      <PaymentBadge status={consultation.paymentStatus} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Upcoming this week" />
          <div className="divide-y divide-slate-100">
            {stats.upcomingConsultations.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                No upcoming consultations this week
              </p>
            ) : (
              stats.upcomingConsultations.map((consultation) => (
                <Link
                  key={consultation.id}
                  href={`/consultations/${consultation.id}`}
                  className="table-row-hover flex items-center justify-between px-5 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={consultation.client.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {consultation.client.name}
                      </p>
                      <p className="text-xs text-slate-500">{getTypeLabel(consultation.type)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    {formatDateTime(consultation.scheduledAt)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent clients"
            action={
              <Link
                href="/clients"
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                View all
              </Link>
            }
          />
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.recentClients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center gap-3 rounded-md border border-slate-200 p-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <Avatar name={client.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{client.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {client.phone ?? client.email ?? "No contact"}
                  </p>
                  {client.birthDate && (
                    <p className="text-[11px] text-slate-400">Born {formatDate(client.birthDate)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
