import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";

export default async function StorePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab = tab === "sale" ? "SALE" : "NEW_ARRIVAL";

  const store = await prisma.store.findUnique({
    where: { id, isApproved: true },
    include: {
      posts: {
        where: { isVisible: true, type: activeTab },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!store) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{store.name}</h1>
        <p className="text-gray-500 mt-1">{store.address}</p>
        {store.description && (
          <p className="text-gray-600 mt-2">{store.description}</p>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <a
          href={`/stores/${id}?tab=new`}
          className={`px-4 py-2 rounded font-medium ${
            activeTab === "NEW_ARRIVAL"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          New Arrivals
        </a>
        <a
          href={`/stores/${id}?tab=sale`}
          className={`px-4 py-2 rounded font-medium ${
            activeTab === "SALE"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Sale
        </a>
      </div>

      {store.posts.length === 0 ? (
        <p className="text-center text-gray-400 mt-16">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {store.posts.map((post) => (
            <PostCard
              key={post.id}
              post={{ ...post, store: { id: store.id, name: store.name } }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
