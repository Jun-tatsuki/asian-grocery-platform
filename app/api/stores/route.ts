import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();

  if (!session || (session.user as any).role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, address } = await request.json();

  const store = await prisma.store.create({
    data: {
      name,
      description,
      address,
      ownerId: session.user?.id as string,
    },
  });

  return NextResponse.json(store);
}

export async function GET() {
  const session = await auth();

  if (!session || (session.user as any).role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.store.findFirst({
    where: { ownerId: session.user?.id as string },
  });

  return NextResponse.json(store);
}
