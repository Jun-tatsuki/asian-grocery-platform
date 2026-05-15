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
  const [posts, setPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchStore();
  }, [status]);

  async function fetchStore() {
    const res = await fetch("/api/stores");
    const data = await res.json();
    setStore(data);
    setLoading(false);
    if (data?.id) fetchPosts(data.id);
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
    const files = formData.getAll("images") as File[];

    // Upload all images to Cloudinary
    const imageUrls: string[] = [];
    for (const file of files) {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      const { url } = await uploadRes.json();
      imageUrls.push(url);
    }

    // Save post to DB with all image URLs
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        type: formData.get("type"),
        imageUrls,
        storeId: store.id,
      }),
    });

    setMessage("Post created successfully!");
    setPostLoading(false);
    fetchPosts(store.id);
    (e.target as HTMLFormElement).reset();
  }

  async function fetchPosts(storeId: string) {
    const res = await fetch(`/api/stores/${storeId}`);
    const data = await res.json();
    setPosts(data.posts || []);
  }

  async function handleDelete(postId: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    fetchPosts(store.id);
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await fetch(`/api/posts/${editingPost.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        type: formData.get("type"),
      }),
    });
    setEditingPost(null);
    fetchPosts(store.id);
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
              <label className="block text-sm font-medium mb-1">
                Photos (up to 5)
              </label>
              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
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
          <div className="mt-8">
            <h3 className="font-medium mb-4">My Posts</h3>
            {posts.length === 0 ? (
              <p className="text-gray-400 text-sm">No posts yet.</p>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="border rounded-lg p-4">
                    {editingPost?.id === post.id ? (
                      <form onSubmit={handleEdit} className="space-y-3">
                        <input
                          name="title"
                          defaultValue={post.title}
                          required
                          className="w-full border rounded px-3 py-2 text-sm"
                        />
                        <textarea
                          name="description"
                          defaultValue={post.description || ""}
                          className="w-full border rounded px-3 py-2 text-sm"
                          rows={2}
                        />
                        <select
                          name="type"
                          defaultValue={post.type}
                          className="w-full border rounded px-3 py-2 text-sm"
                        >
                          <option value="NEW_ARRIVAL">New Arrival</option>
                          <option value="SALE">Sale</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPost(null)}
                            className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{post.title}</p>
                          <p className="text-xs text-gray-500">
                            {post.type === "NEW_ARRIVAL"
                              ? "New Arrival"
                              : "Sale"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingPost(post)}
                            className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
