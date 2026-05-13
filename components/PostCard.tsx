import Image from "next/image";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  type: string;
  createdAt: Date;
  store: { id: string; name: string };
};

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className="object-cover"
        />
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
        <Link
          href={`/stores/${post.store.id}`}
          className="text-xs text-gray-400 mt-2 hover:underline"
        >
          {post.store.name}
        </Link>
      </div>
    </div>
  );
}
