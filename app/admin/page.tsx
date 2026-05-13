"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"stores" | "posts" | "users">("stores");
  const [stores, setStores] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      if ((session.user as any).role !== "ADMIN") router.push("/");
      else fetchAll();
    }
  }, [status]);

  async function fetchAll() {
    const [s, p, u] = await Promise.all([
      fetch("/api/admin/stores").then((r) => r.json()),
      fetch("/api/admin/posts").then((r) => r.json()),
      fetch("/api/admin/users").then((r) => r.json()),
    ]);
    setStores(s);
    setPosts(p);
    setUsers(u);
  }

  async function updateStore(id: string, isApproved: boolean) {
    await fetch(`/api/admin/stores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved }),
    });
    fetchAll();
  }

  async function updatePost(id: string, isVisible: boolean) {
    await fetch(`/api/admin/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible }),
    });
    fetchAll();
  }

  async function updateUser(id: string, isActive: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    fetchAll();
  }

  if (status === "loading") return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="flex gap-2 mb-6">
        {(["stores", "posts", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded font-medium capitalize ${
              tab === t
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "stores" && (
        <div className="space-y-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{store.name}</p>
                <p className="text-sm text-gray-500">{store.address}</p>
                <span
                  className={`text-xs font-medium ${store.isApproved ? "text-green-600" : "text-yellow-600"}`}
                >
                  {store.isApproved ? "Approved" : "Pending"}
                </span>
              </div>
              <div className="flex gap-2">
                {!store.isApproved ? (
                  <button
                    onClick={() => updateStore(store.id, true)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    onClick={() => updateStore(store.id, false)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "posts" && (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="text-sm text-gray-500">{post.type}</p>
                <span
                  className={`text-xs font-medium ${post.isVisible ? "text-green-600" : "text-red-500"}`}
                >
                  {post.isVisible ? "Visible" : "Hidden"}
                </span>
              </div>
              <button
                onClick={() => updatePost(post.id, !post.isVisible)}
                className={`px-3 py-1 rounded text-sm text-white ${
                  post.isVisible
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {post.isVisible ? "Hide" : "Show"}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className="text-xs text-gray-400">{user.role}</span>
              </div>
              {user.role !== "ADMIN" && (
                <button
                  onClick={() => updateUser(user.id, !user.isActive)}
                  className={`px-3 py-1 rounded text-sm text-white ${
                    user.isActive
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {user.isActive ? "Ban" : "Unban"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
