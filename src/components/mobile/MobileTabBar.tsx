"use client";

import { useRouter } from "next/navigation";
import { Home, MapPin, MessageSquare, Dog } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";

export default function MobileTabBar() {
  const router = useRouter();

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

  const handleMyClick = () => {
    if (isLoggedIn && userId) {
      router.push(`/profile/${userId}`);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-16 z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
      <nav className="flex justify-around items-center h-full text-[11px] text-gray-500 font-medium">
        <button
          onClick={() => router.push("/")}
          className="flex flex-col items-center gap-1 flex-1 py-2 text-gray-600 hover:text-amber-600 transition-colors"
        >
          <Home size={20} strokeWidth={2} />
          <span className="tracking-tight">동네피드</span>
        </button>

        <button
          onClick={() => router.push("/map")}
          className="flex flex-col items-center gap-1 flex-1 py-2 text-gray-600 hover:text-amber-600 transition-colors"
        >
          <MapPin size={20} strokeWidth={2} />
          <span className="tracking-tight">지도보기</span>
        </button>

        <button
          onClick={() => router.push("/community")}
          className="flex flex-col items-center gap-1 flex-1 py-2 text-gray-600 hover:text-amber-600 transition-colors"
        >
          <MessageSquare size={20} strokeWidth={2} />
          <span className="tracking-tight">커뮤니티</span>
        </button>

        <button
          onClick={handleMyClick}
          className="flex flex-col items-center gap-1 flex-1 py-2 text-gray-600 hover:text-amber-600 transition-colors"
        >
          {isLoggedIn && avatarUrl ? (
            <img
              src={avatarUrl}
              alt="MY"
              className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-200"
            />
          ) : (
            <Dog size={20} strokeWidth={2} />
          )}
          <span className="tracking-tight">MY</span>
        </button>
      </nav>
    </div>
  );
}
