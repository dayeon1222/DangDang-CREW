"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { PawPrint } from "lucide-react";
import { Participant, ReviewData } from "@/types/dog";

export default function ReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [reviews, setReviews] = useState<{ [key: string]: ReviewData }>({});

  useEffect(() => {
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from("participants")
        .select(`user_id, profiles(nickname)`)
        .eq("post_id", parseInt(id));

      if (!error && data) {
        setParticipants(data as unknown as Participant[]);
      }
    };
    fetchParticipants();
  }, [id]);

  const submitReviews = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

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

    if (error) {
      alert("저장 실패: " + error.message);
    } else {
      alert("후기가 등록되었습니다!");
      router.push(`/dogs/${id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        함께 산책한 친구들
      </h1>
      {participants.map((p) => (
        <div
          key={p.user_id}
          className="mb-8 p-6 border rounded-2xl shadow-sm bg-white"
        >
          <h2 className="text-lg font-bold mb-3">
            🐾 {p.profiles?.nickname || "익명의 친구"}
          </h2>

          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() =>
                  setReviews((prev) => ({
                    ...prev,
                    [p.user_id]: {
                      ...(prev[p.user_id] || { content: "" }),
                      rating: num,
                    },
                  }))
                }
              >
                <PawPrint
                  className={`w-10 h-10 transition-colors ${
                    (reviews[p.user_id]?.rating || 0) >= num
                      ? "text-orange-500 fill-orange-500"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            className="w-full p-3 border rounded-xl bg-gray-50"
            placeholder="이 친구와 산책은 어땠나요?"
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
      <button
        onClick={submitReviews}
        className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg"
      >
        모든 후기 저장하기
      </button>
    </div>
  );
}
