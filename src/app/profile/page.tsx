"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { PawPrint, ChevronLeft, ChevronRight } from "lucide-react"; // Footprints 대신 Dog 사용
import { Profile, Review } from "@/types/dog";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchProfileData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, nickname, bio, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      const { data: allReviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("target_user_id", user.id);

      if (allReviews && allReviews.length > 0) {
        const avg =
          allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
        setAvgRating(avg);
      }

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`id, rating, content, profiles(nickname)`)
        .eq("target_user_id", user.id)
        .range(page * 5, (page + 1) * 5 - 1);

      setProfile(profileData);
      setReviews((reviewsData as Review[]) || []);
      setLoading(false);
    };

    fetchProfileData();
  }, [router, page]);

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
          <button
            onClick={() => router.push("/profile/edit")}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
          >
            프로필 수정하기
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 p-4 bg-amber-50 rounded-xl">
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

      <h2 className="text-xl font-bold mb-4">받은 리뷰</h2>
      {reviews
        .filter((r) => r.content && r.content.trim() !== "") // 내용이 있는 리뷰만 필터링
        .map((r) => (
          <div key={r.id} className="mb-4 p-4 border rounded-xl bg-gray-50">
            <p className="text-gray-800">{r.content}</p>
          </div>
        ))}

      {/* 리뷰가 없을 경우 처리 */}
      {reviews.filter((r) => r.content && r.content.trim() !== "").length ===
        0 && (
        <p className="text-gray-400 text-center py-4">
          아직 받은 리뷰가 없습니다.
        </p>
      )}

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
