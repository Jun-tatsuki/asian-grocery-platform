"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDeleteAccount() {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    )
      return;

    setLoading(true);
    await fetch("/api/account", { method: "DELETE" });
    await signOut({ redirect: false });
    router.push("/");
  }

  if (!session) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-1">Account</h2>
        <p className="text-sm text-gray-500 mb-1">{session.user?.name}</p>
        <p className="text-sm text-gray-500 mb-6">{session.user?.email}</p>

        <div className="border-t pt-6">
          <h3 className="font-medium text-red-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-4">
            Once you delete your account, all your data will be permanently
            removed.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
