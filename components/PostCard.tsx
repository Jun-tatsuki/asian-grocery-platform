import Image from "next/image";
import Link from "next/link";
import LikeButton from "./LikeButton";

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
      <div className="relative h-48 w-full">
        <Image
          src={post.imageUrls[0]}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        {post.imageUrls.length > 1 && (
          <span className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            +{post.imageUrls.length - 1}
          </span>
        )}
      </div>
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
