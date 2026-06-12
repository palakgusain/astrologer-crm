import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

function buildPaymentUpdate(body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  if (body.fee !== undefined) {
    const fee = body.fee === "" || body.fee === null ? null : Number(body.fee);
    data.fee = fee !== null && Number.isFinite(fee) ? fee : null;
  }
  if (body.paymentStatus) {
    data.paymentStatus = body.paymentStatus;
    if (body.paymentStatus === "paid" && body.paidAt === undefined) {
      data.paidAt = new Date();
    }
    if (body.paymentStatus === "pending" || body.paymentStatus === "waived") {
      data.paidAt = null;
    }
  }
  if (body.paymentMethod !== undefined) {
    data.paymentMethod = body.paymentMethod?.toString().trim() || null;
  }
  if (body.paymentNotes !== undefined) {
    data.paymentNotes = body.paymentNotes?.toString().trim() || null;
  }
  if (body.paidAt !== undefined) {
    data.paidAt = body.paidAt ? new Date(body.paidAt as string) : null;
  }

  return data;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  const consultation = await prisma.consultation.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!consultation) {
    return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  }

  return NextResponse.json(consultation);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    const body = await request.json();
    const paymentUpdate = buildPaymentUpdate(body);

    const consultation = await prisma.consultation.update({
      where: { id },
      data: {
        ...(body.scheduledAt ? { scheduledAt: new Date(body.scheduledAt) } : {}),
        ...(body.duration !== undefined ? { duration: Number(body.duration) } : {}),
        ...(body.type ? { type: body.type } : {}),
        ...(body.status ? { status: body.status } : {}),
        ...(body.sessionNotes !== undefined
          ? { sessionNotes: body.sessionNotes?.trim() || null }
          : {}),
        ...paymentUpdate,
      },
      include: { client: true },
    });

    return NextResponse.json(consultation);
  } catch {
    return NextResponse.json({ error: "Failed to update consultation" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    await prisma.consultation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete consultation" }, { status: 500 });
  }
}
