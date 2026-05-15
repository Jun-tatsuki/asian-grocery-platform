import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();

  if (!session || (session.user as any).role !== "OWNER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, imageUrls, type, storeId } = await request.json();

  const post = await prisma.post.create({
    data: {
      title,
      description,
      imageUrls,
      type,
      storeId,
    },
  });

  return NextResponse.json(post);
}
