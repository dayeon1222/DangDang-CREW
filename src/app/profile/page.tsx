"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Profile, Review } from "@/types/dog";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      // 프로필 정보 가져오기
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, nickname, bio, avatar_url")
        .eq("id", user.id)
        .single();

      //  받은 리뷰 가져오기 (타입 명시)
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(
          `
          id, rating, content,
          profiles:reviewer_id (nickname)
        `,
        )
        .eq("target_user_id", user.id);

      setProfile(profileData);
      setReviews((reviewsData as Review[]) || []);
      setLoading(false);
    };

    fetchProfileData();
  }, [router]);

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-6 mb-8 p-6 border rounded-2xl bg-white shadow-sm">
        <img
          src={profile?.avatar_url || "https://via.placeholder.com/100"} // 값이 없으면 기본 이미지
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

      <h2 className="text-xl font-bold mb-4">받은 리뷰</h2>
      {reviews.map((r) => (
        <div key={r.id} className="mb-4 p-4 border rounded-xl bg-gray-50">
          <p className="font-bold text-sm text-gray-500">
            작성자:{" "}
            {Array.isArray(r.profiles)
              ? r.profiles[0]?.nickname
              : r.profiles?.nickname || "익명의 친구"}
          </p>
          <p className="my-1">별점: {r.rating}점</p>
          <p>{r.content}</p>
        </div>
      ))}
    </div>
  );
}
