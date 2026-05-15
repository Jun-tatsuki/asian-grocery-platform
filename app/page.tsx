import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import PostCard from "@/components/PostCard";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "sale" ? "SALE" : "NEW_ARRIVAL";
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const posts = await prisma.post.findMany({
    where: {
      type: activeTab,
      isVisible: true,
      store: { isApproved: true },
    },
    include: {
      store: true,
      _count: { select: { likes: true } },
      likes: userId ? { where: { userId } } : false,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">Asian Grocery Hub</h1>
      <p className="text-center text-gray-500 mb-8">
        Discover sales and new arrivals at Asian grocery stores near you
      </p>

      <div className="flex gap-2 mb-6">
        <a
          href="/?tab=new"
          className={`px-4 py-2 rounded font-medium ${
            activeTab === "NEW_ARRIVAL"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          New Arrivals
        </a>
        <a
          href="/?tab=sale"
          className={`px-4 py-2 rounded font-medium ${
            activeTab === "SALE"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Sale
        </a>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400 mt-16">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                ...post,
                createdAt: post.createdAt.toISOString(),
                likeCount: post._count.likes,
                isLiked: (post.likes ?? []).length > 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
