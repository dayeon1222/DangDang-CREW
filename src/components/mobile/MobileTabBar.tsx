"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, MapPin, MessageSquare, Dog } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function MobileTabBar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

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
        setUserId(data.session.user.id);
        fetchProfile(data.session.user.id);
      }
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        setUserId(session.user.id);
        fetchProfile(session.user.id);
      } else {
        setUserId(null);
        setAvatarUrl(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
        <button className="flex flex-col items-center gap-1 flex-1 py-2 text-gray-600 hover:text-amber-600 transition-colors">
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
