import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { id: postId } = await params;
  const userId = (session.user as any).id;

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  if (existing) {
    await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.like.create({ data: { userId, postId } });
    return NextResponse.json({ liked: true });
  }
}
