"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DogCard from "@/components/common/DogCard";
import { supabase } from "@/lib/supabaseClient";
import { Dog } from "@/types/dog";
import { useKakaoLoader } from "react-kakao-maps-sdk";
import ToolBar from "@/components/common/ToolBar";
import { useQuery } from "@tanstack/react-query";
import { Dog as DogIcon, LogIn, MapPinOff } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<string>("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [loadingKakao] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "",
    libraries: ["services"],
  });

  //  현재 사용자 로그인 상태 확인
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    queryKey: ["user-session-home"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 1000 * 60 * 5,
  });

  const isLoggedIn = !!sessionData?.user;

  // 위치 기반 근처 공원 ID 목록 조회
  const getNearbyParkIds = async (): Promise<string[] | null> => {
    return new Promise((resolve) => {
      // 위치 권한을 지원하지 않거나, 거부될 경우 null 반환
      if (typeof window === "undefined" || !navigator.geolocation) {
        return resolve(null);
      }

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
        () => resolve(null), // 위치 권한 거부 시 null 반환
        { enableHighAccuracy: true },
      );
    });
  };

  // TanStack Query로 데이터 조회 (비로그인/위치거부 분기 처리)
  const { data, isLoading } = useQuery({
    queryKey: [
      "nearbyDogs",
      currentPage,
      selectedSize,
      loadingKakao,
      isLoggedIn,
    ],
    queryFn: async () => {
      if (loadingKakao)
        return { dogs: [], totalPosts: 0, isDefaultView: false };

      let parkIds: string[] | null = null;
      let isDefaultView = false; // 기본(전국) 화면인지, 내 주변 화면인지 구분하는 상태

      // 로그인한 유저만 위치 정보를 가져옴
      if (isLoggedIn) {
        parkIds = await getNearbyParkIds();
      }

      // 비로그인이거나, 로그인했지만 위치 권한을 거부해 parkIds가 null인 경우 -> 전국 최신글 조회
      if (!isLoggedIn || parkIds === null) {
        isDefaultView = true;
      } else if (parkIds.length === 0) {
        // 위치는 땄는데 주변에 공원이 없는 경우
        return { dogs: [], totalPosts: 0, isDefaultView: false };
      }

      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      // --- Query 빌딩 ---
      let countQuery = supabase
        .from("dogs")
        .select("*", { count: "exact", head: true });
      let query = supabase
        .from("dogs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);

      // 내 주변 조회가 가능할 때만 location_id 필터 추가
      if (!isDefaultView && parkIds) {
        countQuery = countQuery.in("location_id", parkIds);
        query = query.in("location_id", parkIds);
      }

      if (selectedSize !== "전체") {
        countQuery = countQuery.eq("dog_size", selectedSize);
        query = query.eq("dog_size", selectedSize);
      }

      const { count } = await countQuery;
      const { data: dogData } = await query;

      return {
        dogs: (dogData as Dog[]) || [],
        totalPosts: count || 0,
        isDefaultView, // 화면에 안내 문구를 띄우기 위해 반환
      };
    },
    enabled: !loadingKakao && !isSessionLoading, // 세션 로딩 끝난 후 데이터 패칭
    staleTime: 1000 * 60 * 3,
  });

  const dogs = data?.dogs || [];
  const totalPosts = data?.totalPosts || 0;
  const isDefaultView = data?.isDefaultView || false;
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize));

  // 강아지 카드 클릭 시 로그인 여부 체크
  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLoggedIn) {
      e.preventDefault();
      const confirmLogin = window.confirm(
        "상세 프로필을 보려면 로그인이 필요해요. 로그인 페이지로 이동하시겠어요?",
      );
      if (confirmLogin) {
        router.push("/login");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* 가입 유도 & 현재 상태 안내 배너 */}
      {!isSessionLoading && !isLoggedIn && (
        <div
          className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm cursor-pointer hover:bg-amber-100 transition"
          onClick={() => router.push("/login")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm">
              <DogIcon size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">
                아직 동네 산책 친구가 없으신가요?
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                가입하고 내 주변 댕댕이들을 만나보세요! (현재는 전국 최신글)
              </p>
            </div>
          </div>
          <button className="flex items-center justify-center shrink-0 gap-2 bg-white px-4 py-2 rounded-xl text-sm font-bold text-amber-600 shadow-sm border border-amber-100">
            <LogIn size={16} />
            3초 만에 시작하기
          </button>
        </div>
      )}

      {/* 로그인 했지만 위치 권한 거부한 유저를 위한 안내 배너 (선택사항) */}
      {!isSessionLoading && isLoggedIn && isDefaultView && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3 shadow-sm">
          <MapPinOff size={20} className="text-gray-400" />
          <p className="text-sm text-gray-600">
            위치 권한을 허용하지 않아 **전국 최근 등록 친구**들을 보여드리고
            있어요.
          </p>
        </div>
      )}

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
          {isLoggedIn
            ? "내 주변 산책 친구를 찾는 중..."
            : "귀여운 산책 친구들을 불러오는 중..."}
        </div>
      ) : (
        <>
          {dogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {dogs.map((item) => (
                <Link
                  key={item.id}
                  href={`/dogs/${item.id}`}
                  onClick={(e) => handleCardClick(e)}
                  className="w-full transform transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <DogCard dog={item} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 text-amber-500">
                <DogIcon size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-1">
                {isDefaultView
                  ? "등록된 산책 친구가 없어요!"
                  : "주변에 등록된 산책 친구가 없어요!"}
              </h3>
              <p className="text-sm text-gray-400">
                첫 번째로 우리 동네 댕댕이 친구를 등록해보세요.
              </p>
            </div>
          )}

          {/* 페이지네이션 */}
          {dogs.length > 0 && (
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
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => {
                  setCurrentPage((prev) => prev + 1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-6 py-2 border-2 border-gray-100 rounded-xl font-bold text-gray-600 disabled:opacity-30 hover:border-primary hover:text-primary transition"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
