"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [storeLoading, setStoreLoading] = useState(false);
  const [postLoading, setPostLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchStore();
  }, [status]);

  async function fetchStore() {
    const res = await fetch("/api/stores");
    const data = await res.json();
    setStore(data);
    setLoading(false);
  }

  async function handleCreateStore(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStoreLoading(true);
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description"),
        address: formData.get("address"),
      }),
    });

    const data = await res.json();
    setStore(data);
    setStoreLoading(false);
    setMessage("Store registered! Waiting for admin approval.");
  }

  async function handleCreatePost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPostLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const file = formData.get("image") as File;

    // 1 Upload image to Cloudinary
    const uploadData = new FormData();
    uploadData.append("file", file);
    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: uploadData,
    });
    const { url } = await uploadRes.json();

    // 2 Save post to DB with the image URL
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        type: formData.get("type"),
        imageUrl: url,
        storeId: store.id,
      }),
    });

    setMessage("Post created successfully!");
    setPostLoading(false);
    (e.target as HTMLFormElement).reset();
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {!store ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Register Your Store</h2>
          <form onSubmit={handleCreateStore} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Store Name
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                name="address"
                type="text"
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description (optional)
              </label>
              <textarea
                name="description"
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={storeLoading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {storeLoading ? "Registering..." : "Register Store"}
            </button>
          </form>
          {message && <p className="text-green-600 text-sm mt-4">{message}</p>}
        </div>
      ) : !store.isApproved ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-yellow-800">
            Pending Approval
          </h2>
          <p className="text-yellow-700 mt-2">
            Your store <strong>{store.name}</strong> is waiting for admin
            approval.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-1">{store.name}</h2>
          <p className="text-sm text-gray-500 mb-6">{store.address}</p>
          <h3 className="font-medium mb-4">Create New Post</h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                name="title"
                type="text"
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description (optional)
              </label>
              <textarea
                name="description"
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Post Type
              </label>
              <select name="type" className="w-full border rounded px-3 py-2">
                <option value="NEW_ARRIVAL">New Arrival</option>
                <option value="SALE">Sale</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photo</label>
              <input
                name="image"
                type="file"
                accept="image/*"
                required
                className="w-full"
              />
            </div>
            {message && <p className="text-green-600 text-sm">{message}</p>}
            <button
              type="submit"
              disabled={postLoading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {postLoading ? "Posting..." : "Create Post"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
