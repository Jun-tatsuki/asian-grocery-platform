import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const store = await prisma.store.findUnique({
    where: { id, isApproved: true },
    include: {
      posts: {
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as any).id;

  const store = await prisma.store.findUnique({ where: { id } });
  if (!store || store.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, address, description } = await request.json();
  const updated = await prisma.store.update({
    where: { id },
    data: { name, address, description },
  });

  return NextResponse.json(updated);
}
