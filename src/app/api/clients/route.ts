import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const tag = request.nextUrl.searchParams.get("tag")?.trim() ?? "";

  const clients = await prisma.client.findMany({
    where: {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search } },
                { phone: { contains: search } },
                { email: { contains: search } },
                { birthPlace: { contains: search } },
                { tags: { contains: search } },
              ],
            }
          : {},
        tag ? { tags: { contains: tag } } : {},
      ],
    },
    include: {
      _count: { select: { consultations: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
        email: body.email?.trim() || null,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        birthTime: body.birthTime?.trim() || null,
        birthPlace: body.birthPlace?.trim() || null,
        tags: body.tags?.trim() || null,
        notes: body.notes?.trim() || null,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
