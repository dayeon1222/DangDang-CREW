"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dog } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function DesktopHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();

  // 페이지 로드 시 로그인 상태 체크
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.refresh(); // 페이지 새로고침하여 상태 동기화
  };

  return (
    <header className="hidden md:flex w-full h-[100px] bg-white border-b border-gray-100 px-6 fixed top-0 left-0 z-50 items-center">
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
        {/* 로고와 기본 메뉴 */}
        <div className="flex items-center gap-12">
          <h1
            className="h-[140px] flex items-center cursor-pointer flex-shrink-0"
            onClick={() => router.push("/")}
          >
            <img
              src="/logo.png"
              alt="댕댕크루 로고"
              className="h-full w-auto object-contain"
            />
          </h1>

          <nav className="flex gap-8 text-gray-700 font-bold flex-shrink-0">
            <a
              href="#"
              className="hover:text-amber-600 transition-colors whitespace-nowrap tracking-tight"
            >
              동네피드
            </a>
            <a
              href="#"
              className="hover:text-amber-600 transition-colors whitespace-nowrap tracking-tight"
            >
              지도보기
            </a>
            <a
              href="#"
              className="hover:text-amber-600 transition-colors whitespace-nowrap tracking-tight"
            >
              커뮤니티
            </a>
          </nav>
        </div>

        {/* 우측 로그인 상태 영역 */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap font-medium"
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-gray-700 font-bold hover:text-amber-600 transition-colors whitespace-nowrap"
            >
              로그인
            </button>
          )}

          {isLoggedIn ? (
            <img
              src="https://via.placeholder.com/150"
              alt="유저 프로필"
              className="w-12 h-12 rounded-full ring-2 ring-gray-100 object-cover cursor-pointer hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center cursor-pointer hover:bg-amber-100 transition-colors shadow-sm">
              <Dog size={24} strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
