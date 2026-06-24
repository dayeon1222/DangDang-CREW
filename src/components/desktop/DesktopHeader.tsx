"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dog } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function DesktopHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", uid)
      .maybeSingle();

    setAvatarUrl(data?.avatar_url || null);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setIsLoggedIn(true);
        setUserId(data.session.user.id); // ID 저장
        fetchProfile(data.session.user.id);
      }
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        setUserId(session.user.id); // ID 저장
        fetchProfile(session.user.id);
      } else {
        setUserId(null); // 초기화
        setAvatarUrl(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setAvatarUrl(null);
    setUserId(null);
    router.refresh();
    router.push("/");
  };

  const handleProfileClick = () => {
    if (isLoggedIn && userId) {
      router.push(`/profile/${userId}`);
    } else {
      router.push("/login");
    }
  };

  return (
    <header className="hidden md:flex w-full h-[100px] bg-white border-b border-gray-100 px-6 fixed top-0 left-0 z-50 items-center">
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
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
            <a href="#" className="hover:text-amber-600 transition-colors">
              동네피드
            </a>
            <Link
              href="/map"
              className="hover:text-amber-600 transition-colors"
            >
              지도보기
            </Link>
            <a href="#" className="hover:text-amber-600 transition-colors">
              커뮤니티
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-6 flex-shrink-0">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors font-medium"
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-gray-700 font-bold hover:text-amber-600 transition-colors"
            >
              로그인
            </button>
          )}

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
