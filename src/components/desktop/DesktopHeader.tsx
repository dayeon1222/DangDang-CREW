"use client";

import { useRouter } from "next/navigation";
import { Dog } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function DesktopHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 세션 및 프로필 데이터 관리
  const { data: userProfile } = useQuery({
    queryKey: ["user-session"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) return { user: null, avatar: null };

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", sessionData.session.user.id)
        .maybeSingle();

      return {
        user: sessionData.session.user,
        avatar: profile?.avatar_url || null,
      };
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시
  });

  const isLoggedIn = !!userProfile?.user;
  const userId = userProfile?.user?.id;
  const avatarUrl = userProfile?.avatar;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.setQueryData(["user-session"], { user: null, avatar: null });
    router.push("/");
    router.refresh();
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
            <Link href="/" className="hover:text-amber-600 transition-colors">
              동네피드
            </Link>
            <Link
              href="/map"
              className="hover:text-amber-600 transition-colors"
            >
              지도보기
            </Link>
            <Link
              href="/community"
              className="hover:text-amber-600 transition-colors"
            >
              커뮤니티
            </Link>
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
