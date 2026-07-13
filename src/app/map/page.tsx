"use client";

import { Map, CustomOverlayMap, useKakaoLoader } from "react-kakao-maps-sdk";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Location, ParkPlace } from "@/types/common";
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

  const handleAiRecommend = async (size: string) => {
    setIsAiOpen(true);
    setAiResult(`${size} 친구들의 산책 모집글을 찾는 중입니다...`);

    try {
      const { data, error } = await supabase
        .from("dogs")
        .select("title, location_name")
        .eq("dog_size", size)
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
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">
        지도를 불러오는 중...
      </div>
    );
  }

  if (!myLoc) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">
        위치 확인 중입니다...
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-60px)] md:h-screen flex flex-col">
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
                className="bg-white border-2 border-primary p-2 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition-transform"
                onClick={() =>
                  router.push(
                    `/park/${park.id}?name=${encodeURIComponent(park.place_name)}`,
                  )
                }
              >
                <div className="text-sm font-bold text-gray-800 whitespace-nowrap px-1">
                  {park.place_name}
                </div>
                <div className="text-[10px] sm:text-xs text-primary font-bold mt-1 flex items-center justify-center gap-1">
                  {count && count > 0 ? (
                    <>
                      <Dog size={12} />
                      <span>{count}건 모집중</span>
                    </>
                  ) : (
                    "산책 친구 없음"
                  )}
                </div>
              </div>
            </CustomOverlayMap>
          );
        })}
      </Map>

      {/* Floating Action Buttons */}
      <button
        onClick={() => setIsAiOpen(!isAiOpen)}
        className="fixed bottom-6 right-6 z-20 bg-primary text-white p-4 rounded-full shadow-2xl hover:bg-primary/90 transition-all active:scale-95"
      >
        <Dog size={24} />
      </button>

      {isAiOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-20 w-[calc(100vw-32px)] sm:w-80 bg-white p-5 rounded-3xl shadow-2xl border border-gray-100">
          <h3 className="font-bold text-lg mb-3">어떤 친구와 산책할까요?</h3>
          <div className="flex gap-2 mb-4">
            {["소형견", "중형견", "대형견"].map((dog_size) => (
              <button
                key={dog_size}
                onClick={() => handleAiRecommend(dog_size)}
                className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all"
              >
                {dog_size}
              </button>
            ))}
          </div>
          <div className="p-3 bg-gray-50 rounded-2xl text-sm text-gray-600 max-h-48 overflow-y-auto whitespace-pre-line leading-relaxed">
            {aiResult}
          </div>
        </div>
      )}
    </div>
  );
}
