import { NextResponse } from "next/server";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  // Delete posts → stores → user in order
  const stores = await prisma.store.findMany({ where: { ownerId: userId } });
  for (const store of stores) {
    await prisma.post.deleteMany({ where: { storeId: store.id } });
  }
  await prisma.store.deleteMany({ where: { ownerId: userId } });
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ message: "Account deleted" });
}
