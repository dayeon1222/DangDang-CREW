"use client";

import { Map, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
);

export default function MapPage() {
  // 카카오맵 SDK 로더 사용
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "",
    libraries: ["clusterer", "drawing", "services"],
  });

  const [myLoc, setMyLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 1. 현재 위치 가져오기
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setMyLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMyLoc({ lat: 37.5665, lng: 126.978 }),
    );

    // 2. 현재 로그인한 사용자 정보 및 프로필 정보 가져오기
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // auth.users 외에 DB의 profiles 테이블에서 추가 정보 조회
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url, nickname")
          .eq("id", user.id)
          .single();

        setCurrentUser({
          id: user.id,
          avatar_url:
            profile?.avatar_url ||
            user.user_metadata?.avatar_url ||
            "/my-profile.jpg",
          username:
            profile?.nickname || user.user_metadata?.full_name || "사용자",
        });
      }
    };
    fetchUser();
  }, []);

  // SDK 로딩 중이거나 위치 확인 중이면 표시
  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center font-bold text-lg">
          지도를 불러오는 중...
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center font-bold text-lg">
          지도로드 실패: {error.message}
        </div>
      </div>
    );
  }
  if (!myLoc) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center font-bold text-lg">
          현재 위치를 확인 중입니다...
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-50">
      <div style={{ width: "80%", height: "80%" }}>
        <Map center={myLoc} style={{ width: "100%", height: "100%" }} level={4}>
          <CustomOverlayMap position={myLoc}>
            <div
              className="cursor-pointer border-2 border-white rounded-full overflow-hidden w-12 h-12 shadow-lg"
              onClick={() => router.push(`/profile/${currentUser?.id || "me"}`)}
            >
              <img
                src={currentUser?.avatar_url || "/my-profile.jpg"}
                alt={currentUser?.username || "내 프로필"}
                className="w-full h-full object-cover"
              />
            </div>
          </CustomOverlayMap>
        </Map>
      </div>

      {/* AI 추천 버튼 */}
      <button
        onClick={() => setIsAiOpen(!isAiOpen)}
        className="fixed bottom-8 right-8 z-10 bg-primary text-white px-6 py-3 rounded-full shadow-xl"
      >
        AI 댕댕크루 추천
      </button>

      {/* AI 추천 목록 패널 */}
      {isAiOpen && (
        <div className="fixed bottom-24 right-8 z-10 w-80 bg-white p-4 rounded-2xl shadow-2xl border">
          <h3 className="font-bold mb-2">AI 산책 글 추천</h3>
          <div className="p-2 border rounded cursor-pointer hover:bg-gray-50">
            댕댕이 산책 친구 구해요!
          </div>
        </div>
      )}
    </div>
  );
}
