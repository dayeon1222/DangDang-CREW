"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { PostWithStats } from "@/types/community";
import { useQuery } from "@tanstack/react-query";

export default function CommunityPage() {
  const [filter, setFilter] = useState<"전체" | "자랑하기" | "고민상담">(
    "전체",
  );

  // TanStack Query로 게시글 데이터 페칭
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id,
          title,
          content,
          category,
          created_at,
          image_url,
          user_id,
          profiles:user_id (nickname),
          post_likes (count),
          comments (count)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as unknown as PostWithStats[]) || [];
    },
    staleTime: 1000 * 60, // 1분 동안 캐시 유지
  });

  const filteredPosts = useMemo(() => {
    if (filter === "전체") return posts;
    return posts.filter((p) => p.category === filter);
  }, [posts, filter]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return "방금 전";
    if (mins < 60) return `${mins}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 365)
      return date.toLocaleDateString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
      });
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
        <Link
          href="/community/write"
          className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-lg"
        >
          글쓰기
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {(["전체", "자랑하기", "고민상담"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              filter === cat
                ? "bg-primary text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="block group"
            >
              <div className="p-4 sm:p-5 border border-gray-100 rounded-2xl shadow-sm group-hover:border-primary/50 transition-all bg-white flex gap-4">
                {post.image_url && (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                    <img
                      src={post.image_url}
                      alt="post"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">
                        {formatTime(post.created_at)}
                      </span>
                    </div>
                    <h2 className="font-bold text-gray-900 truncate mb-1">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm truncate">
                      {post.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[11px] text-gray-400 font-medium">
                    <span>{post.profiles?.nickname || "익명"}</span>
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1">
                        <Heart size={12} /> {post.post_likes?.[0]?.count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={12} />{" "}
                        {post.comments?.[0]?.count || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
