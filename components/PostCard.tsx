import Link from "next/link";
import LikeButton from "./LikeButton";
import ImageCarousel from "./ImageCarousel";

type Post = {
  id: string;
  title: string;
  description: string | null;
  imageUrls: string[];
  type: string;
  createdAt: Date;
  store: { id: string; name: string };
  likeCount: number;
  isLiked: boolean;
};

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <ImageCarousel imageUrls={post.imageUrls} />
      <div className="p-4">
        <span className="text-xs font-medium text-green-700 uppercase">
          {post.type === "NEW_ARRIVAL" ? "New Arrival" : "Sale"}
        </span>
        <h2 className="font-semibold mt-1">{post.title}</h2>
        {post.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {post.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <Link
            href={`/stores/${post.store.id}`}
            className="text-xs text-gray-400 hover:underline"
          >
            {post.store.name}
          </Link>
          <LikeButton
            postId={post.id}
            initialLiked={post.isLiked}
            initialCount={post.likeCount}
          />
        </div>
      </div>
    </div>
  );
}
