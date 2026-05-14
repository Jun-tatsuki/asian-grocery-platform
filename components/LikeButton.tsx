"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleLike() {
    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    const data = await res.json();
    setLiked(data.liked);
    setCount((prev) => (data.liked ? prev + 1 : prev - 1));
    setLoading(false);
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1 text-sm transition-colors ${
        liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
      }`}
    >
      ♥ {count}
    </button>
  );
}
