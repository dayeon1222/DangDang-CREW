"use client";

import { Map, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Location, ParkPlace } from "@/types/dog";
import { Dog } from "lucide-react";

export default function MapPage() {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "",
    libraries: ["clusterer", "drawing", "services"],
  });

  const [myLoc, setMyLoc] = useState<Location | null>(null);
  const [parks, setParks] = useState<ParkPlace[]>([]);
  const [walkingCounts, setWalkingCounts] = useState<Record<string, number>>(
    {},
  );
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiResult, setAiResult] = useState<string>(
    "강아지 크기를 선택하면 해당 크기의 친구들이 모집 중인 산책 글을 보여드립니다.",
  );
  const router = useRouter();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setMyLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMyLoc({ lat: 37.5665, lng: 126.978 }),
    );
  }, []);

  // 공원 정보 가져오기
  useEffect(() => {
    if (!myLoc || !window.kakao) return;

    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(
      "공원",
      (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          const formattedParks: ParkPlace[] = data.map((item) => ({
            id: item.id,
            place_name: item.place_name,
            x: item.x,
            y: item.y,
          }));
          setParks(formattedParks);
        }
      },
      {
        location: new kakao.maps.LatLng(myLoc.lat, myLoc.lng),
        radius: 3000,
      },
    );
  }, [myLoc]);

  // 산책 중인 게시글 전체 집계 (지도 마커용)
  useEffect(() => {
    const fetchWalkingData = async () => {
      const { data } = await supabase
        .from("dogs")
        .select("location_id")
        .neq("status", "완료");

      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((dog) => {
          if (dog.location_id) {
            const locId = String(dog.location_id).trim();
            counts[locId] = (counts[locId] || 0) + 1;
          }
        });
        setWalkingCounts(counts);
      }
    };

    fetchWalkingData();
    const interval = setInterval(fetchWalkingData, 10000);
    return () => clearInterval(interval);
  }, []);

  // 선택한 강아지 크기별 산책 모집글 검색 로직
  const handleAiRecommend = async (size: string) => {
    setIsAiOpen(true);
    setAiResult(`${size} 친구들의 산책 모집글을 찾는 중입니다...`);

    try {
      const { data, error } = await supabase
        .from("dogs")
        .select("title, location_name")
        .eq("dog_size", size) // 테이블의 dog_size 컬럼과 비교
        .neq("status", "완료");

      if (error) throw error;

      if (!data || data.length === 0) {
        setAiResult(
          `현재 ${size} 친구와 함께할 수 있는 산책 모집글이 없습니다.`,
        );
      } else {
        const resultText = data
          .map((d, index) => `${index + 1}. [${d.location_name}] ${d.title}`)
          .join("\n");
        setAiResult(`[${size} 산책 모집 현황]\n\n${resultText}`);
      }
    } catch (err) {
      setAiResult("모집글을 불러오는 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center font-bold text-lg text-gray-700">
          지도를 불러오는 중...
        </div>
      </div>
    );
  }

  if (!myLoc) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center font-bold text-lg text-gray-700">
          위치 확인 중입니다...
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-50">
      <div style={{ width: "100%", height: "100%" }}>
        <Map center={myLoc} style={{ width: "100%", height: "100%" }} level={5}>
          {parks.map((park) => {
            const parkId = String(park.id).trim();
            const count = walkingCounts[parkId];

            return (
              <CustomOverlayMap
                key={park.id}
                position={{ lat: parseFloat(park.y), lng: parseFloat(park.x) }}
              >
                <div
                  className="bg-white border-2 border-primary p-2 rounded-2xl shadow-lg cursor-pointer hover:border-primary hover:shadow-[0_8px_16px_rgba(109,152,134,0.2)] hover:-translate-y-1 transition-all"
                  onClick={() =>
                    router.push(
                      `/park/${park.id}?name=${encodeURIComponent(park.place_name)}`,
                    )
                  }
                >
                  <div className="text-sm font-bold text-gray-800">
                    {park.place_name}
                  </div>
                  <div className="text-xs text-primary font-bold mt-1 flex items-center gap-1">
                    {count && count > 0 ? (
                      <>
                        <Dog size={14} />
                        <span>{count}건의 산책 모집중</span>
                      </>
                    ) : (
                      "산책 중인 친구 없음"
                    )}
                  </div>
                </div>
              </CustomOverlayMap>
            );
          })}
        </Map>
      </div>

      <button
        onClick={() => setIsAiOpen(!isAiOpen)}
        className="fixed bottom-8 right-8 z-10 bg-primary text-white px-6 py-3 rounded-full shadow-xl hover:bg-primary-dark transition-all"
      >
        댕댕크루 찾기
      </button>

      {isAiOpen && (
        <div className="fixed bottom-24 right-8 z-10 w-80 bg-white p-4 rounded-2xl shadow-2xl border">
          <h3 className="font-bold mb-2">어떤 친구와 산책할까요?</h3>
          <div className="flex gap-2 mb-4">
            {["소형견", "중형견", "대형견"].map((dog_size) => (
              <button
                key={dog_size}
                onClick={() => handleAiRecommend(dog_size)}
                className="px-3 py-1 bg-primary text-white text-xs rounded-full hover:bg-primary-dark transition-all"
              >
                {dog_size}
              </button>
            ))}
          </div>
          <div className="p-2 border rounded text-sm text-gray-600 max-h-60 overflow-y-auto whitespace-pre-line">
            {aiResult}
          </div>
        </div>
      )}
    </div>
  );
}
