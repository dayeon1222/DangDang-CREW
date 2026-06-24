"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { PawPrint, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Profile, Review } from "@/types/dog";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsOwner(user?.id === userId);

      // 1. 프로필 정보
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, nickname, bio, avatar_url")
        .eq("id", userId)
        .maybeSingle();

      // 2. 리뷰 데이터
      const { data: allReviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("target_user_id", userId);

      if (allReviews && allReviews.length > 0) {
        const avg =
          allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
        setAvgRating(avg);
      }

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`id, rating, content, profiles(nickname)`)
        .eq("target_user_id", userId)
        .range(page * 5, (page + 1) * 5 - 1);

      // 3. dog 테이블에서 글 조회 (status 컬럼 추가 조회)
      const { data: postsData } = await supabase
        .from("dogs")
        .select("id, title, content, created_at, status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      setProfile(profileData);
      setReviews((reviewsData as Review[]) || []);
      setPosts(postsData || []);
      setLoading(false);
    };

    fetchProfileData();
  }, [userId, page]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-6 mb-8 p-6 border rounded-2xl bg-white shadow-sm">
        <img
          src={profile?.avatar_url || "https://via.placeholder.com/100"}
          className="w-24 h-24 rounded-full object-cover"
          alt="프로필 이미지"
        />
        <div>
          <h1 className="text-2xl font-bold">
            {profile?.nickname || "이름 없음"}
          </h1>
          <p className="text-gray-600 mt-2">
            {profile?.bio || "자기소개가 없습니다."}
          </p>
          {isOwner && (
            <button
              onClick={() => router.push("/profile/edit")}
              className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
            >
              프로필 수정하기
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8 p-4 bg-amber-50 rounded-xl">
        <span className="font-bold text-amber-800">댕댕발자국 평균</span>
        <div className="flex text-amber-500">
          {[...Array(Math.round(avgRating || 0))].map((_, i) => (
            <PawPrint key={i} size={20} fill="currentColor" />
          ))}
        </div>
        <span className="font-bold text-amber-800">
          {avgRating.toFixed(1)}점
        </span>
      </div>

      <h2 className="text-xl font-bold mb-4">내가 쓴 글</h2>
      <div className="mb-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() => router.push(`/dogs/${post.id}`)}
              className="mb-3 p-4 border rounded-xl bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <FileText className="text-amber-500 mt-1" size={20} />
                  <div>
                    <h3 className="font-bold text-gray-800">{post.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {/* 모집 상태 표시 */}
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${post.status === "completed" ? "bg-gray-200 text-gray-600" : "bg-amber-100 text-amber-700"}`}
                >
                  {post.status === "completed" ? "완료" : "모집 중"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">
            작성한 글이 없습니다.
          </p>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">받은 리뷰</h2>
      {reviews
        .filter((r) => r.content && r.content.trim() !== "")
        .map((r) => (
          <div key={r.id} className="mb-4 p-4 border rounded-xl bg-gray-50">
            <p className="text-gray-800">{r.content}</p>
          </div>
        ))}

      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronLeft />
        </button>
        <span className="text-sm font-medium">{page + 1} 페이지</span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={reviews.length < 5}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
