import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const likes = await prisma.like.findMany({
    where: { userId },
    include: {
      post: {
        include: {
          store: { select: { id: true, name: true } },
          _count: { select: { likes: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const posts = likes.map((like) => ({
    ...like.post,
    likeCount: like.post._count.likes,
    isLiked: true,
  }));

  return NextResponse.json(posts);
}
