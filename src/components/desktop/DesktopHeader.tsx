"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dog } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function DesktopHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();

  // 프로필 정보를 가져와 상태를 업데이트하는 함수
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .maybeSingle();

    if (data?.avatar_url) {
      setAvatarUrl(data.avatar_url);
    } else {
      setAvatarUrl(null);
    }
  };

  //  페이지 로드 시 로그인 상태 체크 및 실시간 구독
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setIsLoggedIn(true);
        fetchProfile(data.session.user.id);
      }
    };
    checkUser();

    // 로그인/로그아웃 시 즉시 상태 동기화
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setAvatarUrl(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setAvatarUrl(null);
    router.refresh();
  };

  //  프로필 클릭 시 상세 페이지(/profile)로 이동
  const handleProfileClick = () => {
    if (isLoggedIn) {
      router.push("/profile");
    } else {
      router.push("/login");
    }
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

          {/* 클릭 시 handleProfileClick 실행 */}
          <div onClick={handleProfileClick} className="cursor-pointer">
            {isLoggedIn && avatarUrl ? (
              <img
                src={avatarUrl}
                alt="유저 프로필"
                className="w-12 h-12 rounded-full ring-2 ring-gray-100 object-cover hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center hover:bg-amber-100 transition-colors shadow-sm">
                <Dog size={24} strokeWidth={2.5} />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
