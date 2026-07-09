"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DogCard from "@/components/common/DogCard";
import { supabase } from "@/lib/supabaseClient";
import { Dog } from "@/types/dog";
import { useKakaoLoader } from "react-kakao-maps-sdk";
import ToolBar from "@/components/common/ToolBar";

export default function HomePage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const pageSize = 6;
  const [isLoading, setIsLoading] = useState(true);

  // 카카오 SDK 로드
  const [loadingKakao] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "",
    libraries: ["services"],
  });

  useEffect(() => {
    // 카카오 로딩이 끝나면 데이터 호출 시작
    if (!loadingKakao) {
      fetchNearbyDogs();
    }
  }, [currentPage, loadingKakao, selectedSize]);

  const getNearbyParkIds = async (): Promise<string[]> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve([]);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const ps = new kakao.maps.services.Places();

          ps.keywordSearch(
            "공원",
            (data, status) => {
              if (status === kakao.maps.services.Status.OK) {
                resolve(data.map((p) => p.id));
              } else {
                resolve([]);
              }
            },
            {
              location: new kakao.maps.LatLng(latitude, longitude),
              radius: 3000, // 3km 반경
            },
          );
        },
        () => resolve([]),
      );
    });
  };

  const fetchNearbyDogs = async () => {
    setIsLoading(true);
    const parkIds = await getNearbyParkIds();

    // 주변에 공원이 없는 경우 처리
    if (parkIds.length === 0) {
      setTotalPosts(0);
      setDogs([]);
      setIsLoading(false);
      return;
    }

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    // 반경 내 총 게시물 개수
    let countQuery = supabase
      .from("dogs")
      .select("*", { count: "exact", head: true })
      .in("location_id", parkIds);

    if (selectedSize !== "전체") {
      countQuery = countQuery.eq("dog_size", selectedSize);
    }

    const { count } = await countQuery;
    setTotalPosts(count || 0);

    // 데이터 조회
    let query = supabase
      .from("dogs")
      .select("*")
      .in("location_id", parkIds)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (selectedSize !== "전체") {
      query = query.eq("dog_size", selectedSize);
    }

    const { data } = await query;
    setDogs((data as Dog[]) || []);
    setIsLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-0 md:pt-6">
      <ToolBar
        onFilterChange={(val) => {
          setSelectedSize(val);
          setCurrentPage(1);
        }}
        selectedSize={selectedSize}
      />

      {isLoading ? (
        <div className="text-center py-10">내 주변 산책 친구를 찾는 중...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {dogs.map((item) => (
              <Link key={item.id} href={`/dogs/${item.id}`} className="w-full">
                <DogCard dog={item} />
              </Link>
            ))}
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-center items-center gap-4 py-8">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((prev) => prev - 1);
                window.scrollTo(0, 0);
              }}
              className="px-4 py-2 border rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
            >
              이전
            </button>
            <span className="text-sm font-medium">
              {currentPage} / {Math.max(1, Math.ceil(totalPosts / pageSize))}
            </span>
            <button
              disabled={currentPage >= Math.ceil(totalPosts / pageSize)}
              onClick={() => {
                setCurrentPage((prev) => prev + 1);
                window.scrollTo(0, 0);
              }}
              className="px-4 py-2 border rounded-lg disabled:opacity-30 hover:bg-gray-50 transition"
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
}
