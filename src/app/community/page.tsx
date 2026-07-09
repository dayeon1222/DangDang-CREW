"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { Profile, CountData } from "@/types/dog";

export interface PostWithStats {
  id: string;
  title: string;
  content: string;
  category: "자랑하기" | "고민상담";
  created_at: string;
  image_url: string | null;
  user_id: string;
  profiles: Profile | null;
  post_likes: CountData[];
  comments: CountData[];
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"전체" | "자랑하기" | "고민상담">(
    "전체",
  );

  useEffect(() => {
    const fetchPosts = async () => {
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

      if (error) {
        console.error("조회 에러:", error);
      } else {
        setPosts((data as unknown as PostWithStats[]) || []);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    if (filter === "전체") return posts;
    return posts.filter((p) => p.category === filter);
  }, [posts, filter]);

  // 상세 시간 포맷팅
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
    <div className="max-w-2xl mx-auto px-4 py-6 bg-white min-h-screen pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
        <Link
          href="/community/write"
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-colors shadow-md"
        >
          글쓰기
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {(["전체", "자랑하기", "고민상담"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${filter === cat ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
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
              className="block"
            >
              <div className="p-5 border border-gray-100 rounded-2xl shadow-sm hover:border-primary transition-all bg-white flex gap-4">
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="post"
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {formatTime(post.created_at)}
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-800 truncate">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm truncate mb-2">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="font-medium">
                      작성자: {post.profiles?.nickname || "익명"}
                    </span>
                    <div className="flex gap-2 ml-auto">
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
