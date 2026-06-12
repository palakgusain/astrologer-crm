import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [
    totalClients,
    totalConsultations,
    scheduledCount,
    completedCount,
    pendingPaymentsCount,
    paidConsultations,
    todayConsultations,
    upcomingConsultations,
    recentClients,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.consultation.count(),
    prisma.consultation.count({ where: { status: "scheduled" } }),
    prisma.consultation.count({ where: { status: "completed" } }),
    prisma.consultation.count({ where: { paymentStatus: "pending" } }),
    prisma.consultation.findMany({
      where: { paymentStatus: "paid" },
      select: { fee: true },
    }),
    prisma.consultation.findMany({
      where: {
        scheduledAt: { gte: startOfToday, lt: endOfToday },
        status: { not: "cancelled" },
      },
      include: { client: true },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.consultation.findMany({
      where: {
        scheduledAt: { gte: now, lte: nextWeek },
        status: "scheduled",
      },
      include: { client: true },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalRevenue = paidConsultations.reduce((sum, c) => sum + (c.fee ?? 0), 0);

  return {
    totalClients,
    totalConsultations,
    scheduledCount,
    completedCount,
    pendingPaymentsCount,
    totalRevenue,
    todayConsultations,
    upcomingConsultations,
    recentClients,
  };
}
