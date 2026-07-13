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

  const [loadingKakao] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "",
    libraries: ["services"],
  });

  useEffect(() => {
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
              radius: 3000,
            },
          );
        },
        () => resolve([]),
        { enableHighAccuracy: true },
      );
    });
  };

  const fetchNearbyDogs = async () => {
    setIsLoading(true);
    const parkIds = await getNearbyParkIds();

    if (parkIds.length === 0) {
      setTotalPosts(0);
      setDogs([]);
      setIsLoading(false);
      return;
    }

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let countQuery = supabase
      .from("dogs")
      .select("*", { count: "exact", head: true })
      .in("location_id", parkIds);

    if (selectedSize !== "전체") {
      countQuery = countQuery.eq("dog_size", selectedSize);
    }

    const { count } = await countQuery;
    setTotalPosts(count || 0);

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
    <div className="max-w-6xl mx-auto px-4 pb-20">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md pt-4 pb-2">
        <ToolBar
          onFilterChange={(val) => {
            setSelectedSize(val);
            setCurrentPage(1);
          }}
          selectedSize={selectedSize}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 font-medium">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          내 주변 산책 친구를 찾는 중...
        </div>
      ) : (
        <>
          {dogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {dogs.map((item) => (
                <Link
                  key={item.id}
                  href={`/dogs/${item.id}`}
                  className="w-full transform transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <DogCard dog={item} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              주변에 등록된 산책 친구가 없어요.
            </div>
          )}

          <div className="flex justify-center items-center gap-6 py-12">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage((prev) => prev - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-6 py-2 border-2 border-gray-100 rounded-xl font-bold text-gray-600 disabled:opacity-30 hover:border-primary hover:text-primary transition"
            >
              이전
            </button>
            <span className="text-sm font-bold text-gray-400">
              {currentPage} / {Math.max(1, Math.ceil(totalPosts / pageSize))}
            </span>
            <button
              disabled={currentPage >= Math.ceil(totalPosts / pageSize)}
              onClick={() => {
                setCurrentPage((prev) => prev + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-6 py-2 border-2 border-gray-100 rounded-xl font-bold text-gray-600 disabled:opacity-30 hover:border-primary hover:text-primary transition"
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
}
