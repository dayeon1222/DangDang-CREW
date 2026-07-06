"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { WalkingUser, DogData, Profile } from "@/types/dog";

export default function ParkDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const locationId = params.id as string;
  const locationName = searchParams.get("name") || "알 수 없는 공원";

  const [users, setUsers] = useState<WalkingUser[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (!locationId) {
        setLoading(false);
        return;
      }

      const { data: dogData, error: dogError } = await supabase
        .from("dogs")
        .select("user_id, status")
        .eq("location_id", locationId)
        .neq("status", "완료");

      if (dogError) {
        console.error("Dogs 조회 에러:", dogError);
      }

      if (dogData && dogData.length > 0) {
        const userIds = Array.from(
          new Set(dogData.map((d: DogData) => d.user_id)),
        );

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, nickname, avatar_url")
          .in("id", userIds);

        if (profileError) {
          console.error("Profiles 조회 에러:", profileError);
        }

        if (profileData) {
          // 데이터 병합
          const formattedUsers: WalkingUser[] = profileData.map(
            (p: { id: string } & Profile) => ({
              user_id: p.id,
              nickname: p.nickname || "이름 없음",
              avatar_url: p.avatar_url || "/default-avatar.png",
            }),
          );
          setUsers(formattedUsers);
        }
      }
      setLoading(false);
    };
    init();
  }, [locationId]);

  // 산책 시작/종료 로직
  const toggleWalk = async (isCheckingIn: boolean) => {
    if (!currentUser) return;

    const { error } = await supabase
      .from("dogs")
      .update({
        location_id: isCheckingIn ? locationId : null,
        location_name: isCheckingIn ? locationName : null,
        status: isCheckingIn ? "산책중" : "완료",
      })
      .eq("user_id", currentUser.id);

    if (error) alert("실패했습니다.");
    else window.location.reload();
  };

  if (loading) return <div>로딩중...</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">{locationName}</h1>

      <button
        onClick={() =>
          toggleWalk(!users.find((u) => u.user_id === currentUser?.id))
        }
        className="w-full py-4 rounded-2xl font-bold mb-10 bg-primary text-white"
      >
        {users.find((u) => u.user_id === currentUser?.id)
          ? "산책 종료하기 (체크아웃)"
          : "이 공원에서 산책 시작하기"}
      </button>

      <h2 className="font-bold text-lg mb-4">
        현재 산책 중인 친구들 ({users.length}명)
      </h2>

      <div className="space-y-4">
        {users.map((u) => (
          <div
            key={u.user_id}
            className="flex items-center gap-4 p-3 border rounded-2xl"
          >
            <img
              src={u.avatar_url}
              className="w-12 h-12 rounded-full object-cover"
              alt="avatar"
            />
            <div className="font-semibold">{u.nickname}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
