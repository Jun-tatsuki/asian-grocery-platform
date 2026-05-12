"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-green-700">
        Asian Grocery Hub
      </Link>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="text-sm text-gray-600">{session.user?.name}</span>
            {(session.user as any)?.role === "OWNER" && (
              <Link
                href="/dashboard"
                className="text-sm text-green-700 hover:underline"
              >
                My Store
              </Link>
            )}
            {(session.user as any)?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-sm text-red-600 hover:underline"
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
            >
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm hover:underline">
              Log In
            </Link>
            <Link
              href="/register"
              className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
