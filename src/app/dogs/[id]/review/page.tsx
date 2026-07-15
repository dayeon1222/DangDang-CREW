"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { PawPrint, Dog } from "lucide-react";
import { Participant, ReviewData } from "@/types/user";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [reviews, setReviews] = useState<{ [key: string]: ReviewData }>({});

  // 참여자 목록 및 작성자 정보 페칭
  const { data: reviewTargets = [], isLoading } = useQuery({
    queryKey: ["review-targets", id],
    queryFn: async () => {
      const numericId = parseInt(id);
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("로그인이 필요합니다.");

      // 작성자 정보와 참여자 목록을 한 번에 효율적으로 가져오기 위해 병렬 처리
      const [dogPostRes, participantsRes] = await Promise.all([
        supabase.from("dogs").select("user_id").eq("id", numericId).single(),
        supabase
          .from("participants")
          .select("user_id, profiles(nickname)")
          .eq("post_id", numericId),
      ]);

      const authorId = dogPostRes.data?.user_id;
      let authorProfile = null;
      if (authorId) {
        const { data } = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", authorId)
          .single();
        authorProfile = data;
      }

      const allMembers = [
        authorId && authorProfile
          ? { user_id: authorId, profiles: authorProfile }
          : null,
        ...(participantsRes.data?.map((p) => ({
          user_id: p.user_id,
          profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
        })) || []),
      ].filter(Boolean) as Participant[];

      return allMembers.filter(
        (member, index, self) =>
          member.user_id !== currentUser.id &&
          index === self.findIndex((t) => t.user_id === member.user_id),
      );
    },
  });

  //  후기 제출 뮤테이션
  const submitMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const reviewsToInsert = Object.entries(reviews).map(
        ([targetUserId, data]) => ({
          post_id: parseInt(id),
          reviewer_id: user.id,
          target_user_id: targetUserId,
          rating: data.rating || 0,
          content: data.content || "",
        }),
      );

      const { error } = await supabase.from("reviews").insert(reviewsToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      alert("후기가 등록되었습니다!");
      router.push(`/dogs/${id}`);
    },
    onError: (error: any) => {
      alert("저장 실패: " + error.message);
    },
  });

  if (isLoading)
    return <div className="p-10 text-center text-gray-500">불러오는 중...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-center text-gray-900">
        함께 산책한 친구들
      </h1>

      <div className="space-y-6">
        {reviewTargets.map((p) => (
          <div
            key={p.user_id}
            className="p-5 sm:p-6 border border-gray-100 rounded-2xl shadow-sm bg-gray-50/50"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
              <Dog size={24} className="text-primary" />
              {p.profiles?.nickname || "익명의 친구"}
            </h2>

            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() =>
                    setReviews((prev) => ({
                      ...prev,
                      [p.user_id]: {
                        ...(prev[p.user_id] || { content: "" }),
                        rating: num,
                      },
                    }))
                  }
                  className="hover:scale-110 transition-transform"
                >
                  <PawPrint
                    className={`w-10 h-10 transition-colors ${(reviews[p.user_id]?.rating || 0) >= num ? "text-primary fill-primary" : "text-gray-300"}`}
                  />
                </button>
              ))}
            </div>

            <textarea
              className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary outline-none text-base resize-none"
              placeholder="이 친구와 산책은 어땠나요?"
              rows={3}
              onChange={(e) =>
                setReviews((prev) => ({
                  ...prev,
                  [p.user_id]: {
                    ...(prev[p.user_id] || { rating: 0 }),
                    content: e.target.value,
                  },
                }))
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg disabled:bg-gray-300"
        >
          {submitMutation.isPending ? "저장 중..." : "모든 후기 저장하기"}
        </button>
      </div>
    </div>
  );
}
