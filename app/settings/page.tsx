"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";

type Post = {
  id: string;
  title: string;
  description: string | null;
  imageUrls: string[];
  type: "NEW_ARRIVAL" | "SALE";
  createdAt: string;
  store: { id: string; name: string };
  likeCount: number;
  isLiked: boolean;
};

type Store = {
  id: string;
  name: string;
  address: string;
  description: string | null;
  isApproved: boolean;
};

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const role = (session?.user as any)?.role;

  // --- Profile state ---
  const [name, setName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState("");

  // --- Password state ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState("");

  // --- Liked posts state ---
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [likesLoading, setLikesLoading] = useState(true);

  // --- Store state (OWNER only) ---
  const [store, setStore] = useState<Store | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeMsg, setStoreMsg] = useState("");

  // --- Delete account state ---
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    setName(session.user?.name ?? "");

    // いいね一覧を取得
    fetch("/api/account/likes")
      .then((r) => r.json())
      .then((data) => {
        setLikedPosts(Array.isArray(data) ? data : []);
        setLikesLoading(false);
      });

    // OWNERならストア情報を取得
    if (role === "OWNER") {
      fetch("/api/stores")
        .then((r) => r.json())
        .then((data) => {
          if (data && data.id) {
            setStore(data);
            setStoreName(data.name);
            setStoreAddress(data.address);
            setStoreDescription(data.description ?? "");
          }
        });
    }
  }, [session, role]);

  async function handleNameChange(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setNameLoading(true);
    setNameMsg("");
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      await updateSession({ name }); // セッションの表示名をすぐ更新
      setNameMsg("Name updated successfully.");
    } else {
      setNameMsg("Failed to update name.");
    }
    setNameLoading(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPassMsg("");
    if (newPassword !== confirmPassword) {
      setPassMsg("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPassMsg("Password must be at least 6 characters.");
      return;
    }
    setPassLoading(true);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setPassMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPassMsg(data.error || "Failed to update password.");
    }
    setPassLoading(false);
  }

  async function handleStoreUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!store) return;
    setStoreLoading(true);
    setStoreMsg("");
    const res = await fetch(`/api/stores/${store.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: storeName,
        address: storeAddress,
        description: storeDescription,
      }),
    });
    if (res.ok) {
      setStoreMsg("Store information updated.");
    } else {
      setStoreMsg("Failed to update store.");
    }
    setStoreLoading(false);
  }

  async function handleDeleteAccount() {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    )
      return;
    setDeleteLoading(true);
    await fetch("/api/account", { method: "DELETE" });
    await signOut({ redirect: false });
    router.push("/");
  }

  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <p className="text-sm text-gray-500 mb-1">{session.user?.email}</p>
        <form onSubmit={handleNameChange} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          {nameMsg && (
            <p className={`text-sm ${nameMsg.includes("successfully") ? "text-green-600" : "text-red-500"}`}>
              {nameMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={nameLoading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {nameLoading ? "Saving..." : "Save Name"}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          {passMsg && (
            <p className={`text-sm ${passMsg.includes("successfully") ? "text-green-600" : "text-red-500"}`}>
              {passMsg}
            </p>
          )}
          <button
            type="submit"
            disabled={passLoading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {passLoading ? "Saving..." : "Update Password"}
          </button>
        </form>
      </section>

      {/* Store Info (OWNER only) */}
      {role === "OWNER" && store && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-1">Store Information</h2>
          {!store.isApproved && (
            <p className="text-sm text-yellow-600 mb-4">
              Your store is pending admin approval.
            </p>
          )}
          <form onSubmit={handleStoreUpdate} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {storeMsg && (
              <p className={`text-sm ${storeMsg.includes("updated") ? "text-green-600" : "text-red-500"}`}>
                {storeMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={storeLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm"
            >
              {storeLoading ? "Saving..." : "Save Store Info"}
            </button>
          </form>
        </section>
      )}

      {/* Liked Posts */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Liked Posts</h2>
        {likesLoading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : likedPosts.length === 0 ? (
          <p className="text-sm text-gray-400">You have not liked any posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {likedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete your account, all your data will be permanently removed.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={deleteLoading}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 text-sm"
        >
          {deleteLoading ? "Deleting..." : "Delete Account"}
        </button>
      </section>
    </div>
  );
}
