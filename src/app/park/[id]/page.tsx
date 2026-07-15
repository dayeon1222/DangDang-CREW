"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WalkingUser, DogData } from "@/types/dog";

export default function ParkDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const locationId = params.id as string;
  const locationName = searchParams.get("name") || "알 수 없는 공원";

  // 산책 중인 유저 데이터 쿼리
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["walkingUsers", locationId],
    queryFn: async () => {
      if (!locationId) return [];

      const { data: dogData } = await supabase
        .from("dogs")
        .select("user_id, status")
        .eq("location_id", locationId)
        .neq("status", "완료");

      if (!dogData || dogData.length === 0) return [];

      const userIds = Array.from(
        new Set(dogData.map((d: DogData) => d.user_id)),
      );

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url")
        .in("id", userIds);

      return (profileData || []).map((p) => ({
        user_id: p.id,
        nickname: p.nickname || "이름 없음",
        avatar_url: p.avatar_url || "/default-avatar.png",
      })) as WalkingUser[];
    },
    enabled: !!locationId,
  });

  // 현재 로그인 유저 정보 쿼리
  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
    staleTime: Infinity,
  });

  // 산책 상태 토글 뮤테이션
  const toggleWalkMutation = useMutation({
    mutationFn: async (isCheckingIn: boolean) => {
      if (!currentUser) throw new Error("로그인이 필요합니다.");

      const { error } = await supabase
        .from("dogs")
        .update({
          location_id: isCheckingIn ? locationId : null,
          location_name: isCheckingIn ? locationName : null,
          status: isCheckingIn ? "산책중" : "완료",
        })
        .eq("user_id", currentUser.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walkingUsers", locationId] });
    },
    onError: () => {
      alert("잠시 후 다시 시도해주세요.");
    },
  });

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-500 font-bold">로딩중...</div>
    );
  }

  const isAlreadyWalking = users.some((u) => u.user_id === currentUser?.id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-secondary">
        {locationName}
      </h1>

      <button
        onClick={() => toggleWalkMutation.mutate(!isAlreadyWalking)}
        disabled={toggleWalkMutation.isPending}
        className={`w-full py-5 rounded-3xl font-bold mb-10 transition-all active:scale-95 shadow-lg ${
          isAlreadyWalking
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-primary text-white hover:bg-primary/90"
        } disabled:opacity-50`}
      >
        {toggleWalkMutation.isPending
          ? "처리중..."
          : isAlreadyWalking
            ? "산책 종료하기 (체크아웃)"
            : "이 공원에서 산책 시작하기"}
      </button>

      <h2 className="font-bold text-lg mb-6 flex items-center gap-2">
        현재 산책 중인 친구들
        <span className="text-primary bg-primary/10 px-3 py-1 rounded-full text-sm">
          {users.length}명
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {users.map((u) => (
          <div
            key={u.user_id}
            className="flex items-center gap-4 p-4 border border-gray-100 rounded-3xl bg-white shadow-sm hover:border-primary/20 transition-all"
          >
            <img
              src={u.avatar_url}
              className="w-14 h-14 rounded-full object-cover border-2 border-gray-50"
              alt="avatar"
            />
            <div>
              <p className="font-bold text-gray-800">{u.nickname}</p>
              <p className="text-xs text-gray-400">산책 중</p>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-3xl">
          현재 산책 중인 친구가 없어요.
          <br />첫 번째로 산책을 시작해보세요!
        </div>
      )}
    </div>
  );
}
