import Link from "next/link";
import LikeButton from "./LikeButton";
import ImageCarousel from "./ImageCarousel";

type Post = {
  id: string;
  title: string;
  description: string | null;
  imageUrls: string[];
  type: string;
  createdAt: string;
  store: { id: string; name: string };
  likeCount: number;
  isLiked: boolean;
};

export default function PostCard({ post }: { post: Post }) {
  return (
    <div
      className={`border-gray-300 rounded-lg overflow-hidden border transition duration-200 ${post.type === "NEW_ARRIVAL" ? "hover:border-emerald-400" : "hover:border-pink-500"}`}
    >
      <ImageCarousel imageUrls={post.imageUrls} />
      <div className="p-4">
        <h2 className="font-semibold mt-1">{post.title}</h2>
        {post.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {post.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div>
            <Link
              href={`/stores/${post.store.id}`}
              className="text-xs text-gray-400 hover:underline block"
            >
              {post.store.name}
            </Link>
            <span className="text-xs text-gray-300">
              {new Date(post.createdAt).toLocaleDateString("en-CA")}
            </span>
          </div>
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
