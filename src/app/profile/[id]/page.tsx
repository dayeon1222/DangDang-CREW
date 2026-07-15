"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { PawPrint, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Profile, Review } from "@/types/user";
import { Post } from "@/types/community";
import { useQuery } from "@tanstack/react-query";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [page, setPage] = useState(0);

  // 프로필 및 리뷰, 게시글 데이터를 병렬로 페칭
  const { data, isLoading } = useQuery({
    queryKey: ["profile-data", userId, page],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const [profileRes, reviewsRes, allReviewsRes, postsRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id, nickname, bio, avatar_url")
            .eq("id", userId)
            .maybeSingle(),
          supabase
            .from("reviews")
            .select("id, rating, content, profiles(nickname)")
            .eq("target_user_id", userId)
            .range(page * 5, (page + 1) * 5 - 1),
          supabase
            .from("reviews")
            .select("rating")
            .eq("target_user_id", userId),
          supabase
            .from("dogs")
            .select("id, title, content, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false }),
        ]);

      const avgRating =
        allReviewsRes.data && allReviewsRes.data.length > 0
          ? allReviewsRes.data.reduce((acc, r) => acc + r.rating, 0) /
            allReviewsRes.data.length
          : 0;

      return {
        profile: profileRes.data as Profile | null,
        reviews: (reviewsRes.data as Review[]) || [],
        posts: (postsRes.data as Post[]) || [],
        avgRating,
        isOwner: user?.id === userId,
      };
    },
    enabled: !!userId,
  });

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500 font-bold">로딩 중...</div>
    );

  const { profile, reviews, posts, avgRating, isOwner } = data!;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-6 sm:p-8 border border-gray-100 rounded-[32px] bg-white shadow-sm">
        <img
          src={profile?.avatar_url || "https://via.placeholder.com/150"}
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-gray-50"
          alt="프로필 이미지"
        />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.nickname || "이름 없음"}
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {profile?.bio || "자기소개가 없습니다."}
          </p>
          {isOwner && (
            <button
              onClick={() => router.push("/profile/edit")}
              className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-gray-700 transition"
            >
              프로필 수정
            </button>
          )}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center justify-center gap-2 mb-10 p-4 bg-amber-50 rounded-2xl">
        <span className="font-bold text-amber-900 text-sm">
          댕댕발자국 평균
        </span>
        <div className="flex text-amber-500">
          {[...Array(Math.round(avgRating || 0))].map((_, i) => (
            <PawPrint key={i} size={20} fill="currentColor" />
          ))}
        </div>
        <span className="font-bold text-amber-900">
          {avgRating.toFixed(1)}점
        </span>
      </div>

      {/* Posts */}
      <h2 className="text-xl font-bold mb-4 px-1">내가 쓴 글</h2>
      <div className="mb-10 space-y-3">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() => router.push(`/dogs/${post.id}`)}
              className="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm cursor-pointer hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <FileText className="text-amber-500" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{post.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-2xl">
            작성한 글이 없습니다.
          </div>
        )}
      </div>

      {/* Reviews */}
      <h2 className="text-xl font-bold mb-4 px-1">받은 리뷰</h2>
      <div className="space-y-4 mb-8">
        {reviews
          .filter((r) => r.content && r.content.trim() !== "")
          .map((r) => (
            <div
              key={r.id}
              className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50"
            >
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed">
                {r.content}
              </p>
            </div>
          ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-6 py-6 border-t border-gray-100">
        <button
          disabled={page === 0}
          onClick={() => setPage((prev) => prev - 1)}
          className="p-3 rounded-full hover:bg-gray-100 disabled:opacity-30 transition"
        >
          <ChevronLeft />
        </button>
        <span className="text-sm font-bold text-gray-500">
          {page + 1} 페이지
        </span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={reviews.length < 5}
          className="p-3 rounded-full hover:bg-gray-100 disabled:opacity-30 transition"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
