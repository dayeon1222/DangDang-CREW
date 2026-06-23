"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Dog } from "@/types/dog";

export default function DogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [dog, setDog] = useState<Dog | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [isParticipating, setIsParticipating] = useState(false);

  const router = useRouter();
  const { id } = use(params);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInMinutes < 60) {
      if (diffInMinutes < 1) return "방금 전";
      return `${diffInMinutes}분 전`;
    }
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 3) return `${diffInDays}일 전`;

    return date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\.$/, "");
  };

  useEffect(() => {
    const fetchData = async () => {
      const numericId = parseInt(id);

      const { data: dogData } = await supabase
        .from("dogs")
        .select("*")
        .eq("id", numericId)
        .single();
      setDog(dogData);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      const { count } = await supabase
        .from("participants")
        .select("post_id", { count: "exact", head: true })
        .eq("post_id", numericId);
      setParticipantsCount(count || 0);

      if (user) {
        const { data: pData } = await supabase
          .from("participants")
          .select("id")
          .eq("post_id", numericId)
          .eq("user_id", user.id)
          .maybeSingle();
        setIsParticipating(!!pData);
      }
    };
    fetchData();
  }, [id]);

  const handleStatusChange = async (newStatus: "완료" | "마감") => {
    const { error } = await supabase
      .from("dogs")
      .update({ status: newStatus })
      .eq("id", parseInt(id));
    if (!error) {
      setDog((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const isOwner = user?.id === dog?.user_id;

  if (!dog) return <div className="p-10 text-center">로딩중...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{dog.title}</h1>
      <div className="text-sm text-gray-400 mb-4">
        {formatDate(dog.created_at)}
      </div>
      <div className="mb-4 inline-block px-3 py-1 bg-blue-100 rounded-full text-sm font-bold text-blue-600">
        상태: {dog.status}
      </div>

      {isOwner && (
        <div className="flex justify-end gap-2 mb-4">
          <Link
            href={`/edit/${id}`}
            className="px-4 py-2 bg-gray-300 rounded-xl text-sm font-bold"
          >
            수정
          </Link>
          <button
            onClick={async () => {
              if (confirm("정말 삭제하시겠습니까?")) {
                await supabase.from("dogs").delete().eq("id", parseInt(id));
                router.push("/");
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold"
          >
            삭제
          </button>
        </div>
      )}

      <img
        src={dog.image_url}
        className="w-full h-80 object-cover rounded-2xl mb-6 shadow-md"
      />

      <div className="flex justify-between items-center mb-6 bg-white p-4 border rounded-xl shadow-sm">
        <span className="font-bold text-lg text-primary">
          마감: {dog.deadline} 까지
        </span>
        <span className="font-bold text-lg text-gray-700">
          {participantsCount}/{dog.people}명
        </span>
      </div>

      <p className="text-gray-700 bg-gray-50 p-4 rounded-xl mb-6 whitespace-pre-line">
        {dog.content}
      </p>

      {/* 액션 버튼 영역 */}
      {dog.status === "완료" ? (
        (isOwner || isParticipating) && (
          <Link
            href={`/dogs/${id}/review`}
            className="block w-full p-4 bg-primary text-white rounded-xl text-center font-bold"
          >
            산책 후기 남기러 가기
          </Link>
        )
      ) : isOwner ? (
        <button
          onClick={() => handleStatusChange("완료")}
          className="w-full p-4 bg-emerald-600 text-white rounded-xl font-bold"
        >
          산책 완료하기
        </button>
      ) : (
        dog.status.replace(/'/g, "").trim() === "모집중" &&
        user && (
          <button
            onClick={async () => {
              const numericId = parseInt(id);
              if (isParticipating) {
                const { error } = await supabase
                  .from("participants")
                  .delete()
                  .eq("post_id", numericId)
                  .eq("user_id", user.id);

                if (error) {
                  console.error("취소 실패:", error);
                  alert("취소에 실패했습니다.");
                } else {
                  setParticipantsCount((prev) => prev - 1);
                  setIsParticipating(false);
                  alert("참여가 취소되었습니다.");
                }
              } else {
                const { error } = await supabase
                  .from("participants")
                  .insert([{ post_id: numericId, user_id: user.id }]);

                if (error) {
                  console.error("참여 실패:", error);
                  alert("참여에 실패했습니다.");
                } else {
                  setParticipantsCount((prev) => prev + 1);
                  setIsParticipating(true);
                  alert("참여 완료!");
                }
              }
            }}
            className={`w-full p-4 rounded-xl font-bold transition-colors ${
              isParticipating
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            {isParticipating ? "참여 취소하기" : "참여하기"}
          </button>
        )
      )}
    </div>
  );
}
