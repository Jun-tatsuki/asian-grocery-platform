import { NextResponse } from "next/server";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { name, currentPassword, newPassword } = await request.json();

  // 名前変更
  if (name) {
    await prisma.user.update({ where: { id: userId }, data: { name } });
  }

  // パスワード変更
  if (currentPassword && newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
  }

  return NextResponse.json({ message: "Updated" });
}

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
