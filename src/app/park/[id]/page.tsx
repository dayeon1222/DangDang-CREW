"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Profile, KakaoPlaceResult } from "@/types/dog";

export default function ParkDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const parkId = params.id as string;
  const parkName = searchParams.get("name") || ""; // URL에서 공원 이름 가져오기
  const router = useRouter();

  const [park, setPark] = useState<KakaoPlaceResult | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 카카오 API로 공원 상세 정보 가져오기
    if (typeof window !== "undefined" && window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        const ps = new window.kakao.maps.services.Places();

        // 이름이 있으면 이름으로, 없으면 ID로 검색 (이름 검색이 훨씬 정확함)
        const query = parkName || parkId;

        ps.keywordSearch(query, (data, status) => {
          if (
            status === window.kakao.maps.services.Status.OK &&
            data.length > 0
          ) {
            // ID가 일치하는 결과를 찾거나 첫 번째 결과 사용
            const found = data.find((p) => p.id === parkId) || data[0];
            setPark({
              id: found.id,
              place_name: found.place_name,
              address_name:
                found.road_address_name ||
                found.address_name ||
                "주소 정보 없음",
            });
          }
          // 데이터 로딩 완료 처리
          setLoading(false);
        });
      });
    } else {
      setLoading(false);
    }

    // 2. 해당 공원에 체크인한 유저 목록 가져오기
    const fetchUsersInPark = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, nickname, avatar_url, favorite_park_id")
        .eq("favorite_park_id", String(parkId));

      if (data) {
        setUsers(data as Profile[]);
      }
    };

    fetchUsersInPark();
  }, [parkId, parkName]);

  const handleCheckIn = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ favorite_park_id: parkId })
      .eq("id", user.id);
    if (error) {
      alert("체크인 실패: " + error.message);
    } else {
      alert("산책을 시작합니다! 이제 친구들에게 내가 보입니다.");
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center font-bold text-lg text-gray-700">
          공원 정보 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white min-h-screen">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-gray-500"
      >
        ← 뒤로가기
      </button>
      <h1 className="text-2xl font-bold mb-1">
        {park?.place_name || "공원 정보 없음"}
      </h1>
      <p className="text-gray-500 mb-6">
        {park?.address_name || "주소 정보 없음"}
      </p>
      <button
        onClick={handleCheckIn}
        className="w-full bg-primary text-white py-4 rounded-2xl font-bold mb-10 hover:bg-primary-dark shadow-lg transition-all"
      >
        이 공원에서 산책 시작하기
      </button>
      <h2 className="font-bold text-lg mb-4">
        현재 산책 중인 친구들 ({users.length}명)
      </h2>
      <div className="space-y-4">
        {users.length > 0 ? (
          users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-4 p-3 border rounded-2xl"
            >
              <img
                src={u.avatar_url || "/my-profile.jpg"}
                className="w-12 h-12 rounded-full object-cover border"
                alt="avatar"
              />
              <span className="font-semibold text-gray-800">
                {u.nickname || "댕댕친구"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-10">
            아직 산책 중인 친구가 없어요.
          </p>
        )}
      </div>
    </div>
  );
}
