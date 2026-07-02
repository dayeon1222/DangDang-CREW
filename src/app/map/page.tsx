"use client";

import { Map, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Location, ParkPlace } from "@/types/dog";

export default function MapPage() {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "",
    libraries: ["clusterer", "drawing", "services"],
  });

  const [myLoc, setMyLoc] = useState<Location | null>(null);
  const [parks, setParks] = useState<ParkPlace[]>([]);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    //  현재 위치 가져오기
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setMyLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMyLoc({ lat: 37.5665, lng: 126.978 }),
    );
  }, []);

  useEffect(() => {
    if (!myLoc || !window.kakao) return;

    // 카카오 장소 검색 API를 사용해 주변 공원 검색
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
        radius: 3000, // 3km 반경
      },
    );
  }, [myLoc]);

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
          {/* 주변 공원 마커 표시 */}
          {parks.map((park) => (
            <CustomOverlayMap
              key={park.id}
              position={{ lat: parseFloat(park.y), lng: parseFloat(park.x) }}
            >
              <div
                className="bg-white border-2 border-primary p-2 rounded-2xl shadow-lg cursor-pointer hover:border-primary hover:shadow-[0_8px_16px_rgba(109,152,134,0.2)] hover:-translate-y-1"
                onClick={() =>
                  router.push(
                    `/park/${park.id}?name=${encodeURIComponent(park.place_name)}`,
                  )
                }
              >
                <div className="text-sm font-bold text-gray-800">
                  {park.place_name}
                </div>
                <div className="text-xs text-primary-dark">
                  산책 중인 친구들 확인
                </div>
              </div>
            </CustomOverlayMap>
          ))}
        </Map>
      </div>

      {/* AI 추천 버튼 */}
      <button
        onClick={() => setIsAiOpen(!isAiOpen)}
        className="fixed bottom-8 right-8 z-10 bg-primary text-white px-6 py-3 rounded-full shadow-xl hover:bg-primary-dark"
      >
        AI 댕댕크루 추천
      </button>

      {/* AI 추천 목록 패널 */}
      {isAiOpen && (
        <div className="fixed bottom-24 right-8 z-10 w-80 bg-white p-4 rounded-2xl shadow-2xl border">
          <h3 className="font-bold mb-2">AI 산책 장소 추천</h3>
          <div className="p-2 border rounded cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
            AI가 현재 인기 있는 주변 산책로를 분석 중입니다...
          </div>
        </div>
      )}
    </div>
  );
}
