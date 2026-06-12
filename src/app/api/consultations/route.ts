import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function buildPaymentData(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  if (body.fee !== undefined) {
    const fee = body.fee === "" || body.fee === null ? null : Number(body.fee);
    data.fee = fee !== null && Number.isFinite(fee) ? fee : null;
  }
  if (body.paymentStatus) data.paymentStatus = body.paymentStatus;
  if (body.paymentMethod !== undefined) {
    data.paymentMethod = body.paymentMethod?.toString().trim() || null;
  }
  if (body.paymentNotes !== undefined) {
    data.paymentNotes = body.paymentNotes?.toString().trim() || null;
  }
  if (body.paidAt !== undefined) {
    data.paidAt = body.paidAt ? new Date(body.paidAt as string) : null;
  }

  if (body.paymentStatus === "paid" && !body.paidAt) {
    data.paidAt = new Date();
  }
  if (body.paymentStatus === "pending" || body.paymentStatus === "waived") {
    data.paidAt = null;
  }

  return data;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const status = request.nextUrl.searchParams.get("status")?.trim();
  const paymentStatus = request.nextUrl.searchParams.get("paymentStatus")?.trim();
  const clientId = request.nextUrl.searchParams.get("clientId")?.trim();
  const upcoming = request.nextUrl.searchParams.get("upcoming") === "true";

  const consultations = await prisma.consultation.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(clientId ? { clientId } : {}),
      ...(upcoming
        ? {
            scheduledAt: { gte: new Date() },
            status: "scheduled",
          }
        : {}),
    },
    include: { client: true },
    orderBy: { scheduledAt: upcoming ? "asc" : "desc" },
  });

  return NextResponse.json(consultations);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();

    if (!body.clientId) {
      return NextResponse.json({ error: "Client is required" }, { status: 400 });
    }

    if (!body.scheduledAt) {
      return NextResponse.json({ error: "Scheduled date is required" }, { status: 400 });
    }

    const paymentData = buildPaymentData(body);

    const consultation = await prisma.consultation.create({
      data: {
        clientId: body.clientId,
        scheduledAt: new Date(body.scheduledAt),
        duration: body.duration ? Number(body.duration) : 60,
        type: body.type || "general",
        status: body.status || "scheduled",
        sessionNotes: body.sessionNotes?.trim() || null,
        fee: paymentData.fee as number | null | undefined,
        paymentStatus: (paymentData.paymentStatus as string) || "pending",
        paymentMethod: paymentData.paymentMethod as string | null | undefined,
        paidAt: paymentData.paidAt as Date | null | undefined,
        paymentNotes: paymentData.paymentNotes as string | null | undefined,
      },
      include: { client: true },
    });

    return NextResponse.json(consultation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create consultation" }, { status: 500 });
  }
}
