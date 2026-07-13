"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { Dog } from "@/types/dog";
import { MapPin } from "lucide-react";

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
  const normalizedStatus = dog?.status?.trim() || "";

  if (!dog)
    return <div className="p-10 text-center text-gray-500">불러오는 중...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 bg-white min-h-screen">
      {/* Title & Meta */}
      <h1 className="text-2xl md:text-3xl font-bold mb-3">{dog.title}</h1>
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-400">
          {formatDate(dog.created_at)}
        </span>
        <div className="flex gap-2">
          {isOwner && (
            <>
              <Link
                href={`/edit/${id}`}
                className="px-4 py-1.5 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-200"
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
                className="px-4 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 text-primary font-bold">
        <MapPin size={18} />
        <span>{dog.location_name || "위치 정보 없음"}</span>
      </div>

      <div className="mb-6 inline-block px-3 py-1 bg-blue-50 rounded-lg text-sm font-bold text-blue-600">
        상태: {dog.status}
      </div>

      {/* Image */}
      <img
        src={dog.image_url}
        className="w-full aspect-video object-cover rounded-2xl mb-8 shadow-sm"
        alt="산책 이미지"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-xs text-gray-500 font-bold mb-1">모집 마감</p>
          <p className="font-bold text-gray-900">{dog.deadline}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-xs text-gray-500 font-bold mb-1">참여 인원</p>
          <p className="font-bold text-gray-900">
            {participantsCount}/{dog.people}명
          </p>
        </div>
      </div>

      <div className="mb-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
        <span className="text-emerald-800 font-bold text-sm">댕댕이 크기</span>
        <span className="px-3 py-1 bg-white text-emerald-600 rounded-lg font-bold text-sm border border-emerald-200">
          {dog.dog_size || "정보 없음"}
        </span>
      </div>

      <p className="text-gray-700 leading-relaxed text-base mb-8 whitespace-pre-line">
        {dog.content}
      </p>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:relative md:border-none md:p-0">
        {normalizedStatus === "완료" ? (
          (isOwner || isParticipating) && (
            <Link
              href={`/dogs/${id}/review`}
              className="block w-full py-4 bg-primary text-white rounded-xl text-center font-bold hover:opacity-90 transition-all"
            >
              산책 후기 남기러 가기
            </Link>
          )
        ) : isOwner ? (
          <button
            onClick={() => handleStatusChange("완료")}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
          >
            산책 완료하기
          </button>
        ) : (
          normalizedStatus === "모집중" &&
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

                  if (!error) {
                    setParticipantsCount((prev) => prev - 1);
                    setIsParticipating(false);
                  }
                } else {
                  const { error } = await supabase
                    .from("participants")
                    .insert([{ post_id: numericId, user_id: user.id }]);

                  if (!error) {
                    setParticipantsCount((prev) => prev + 1);
                    setIsParticipating(true);
                  }
                }
              }}
              className={`w-full py-4 rounded-xl font-bold transition-all ${
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
    </div>
  );
}
