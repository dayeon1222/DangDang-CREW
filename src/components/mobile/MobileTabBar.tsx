// src/componenets/mobile/MobileTabBar

"use client";

import { Home, MapPin, MessageSquare, Dog } from "lucide-react";

export default function MobileTabBar() {
  return (
    <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-16 z-50 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
      <nav className="flex justify-around items-center h-full text-[11px] text-gray-500 font-medium">
        {/* 동네피드 (Home) */}
        <button className="flex flex-col items-center gap-1 flex-1 py-2 text-gray-600 hover:text-amber-600 transition-colors">
          <Home size={20} strokeWidth={2} />
          <span className="tracking-tight">동네피드</span>
        </button>

        {/* 지도보기 (MapPin) */}
        <button className="flex flex-col items-center gap-1 flex-1 py-2 text-gray-600 hover:text-amber-600 transition-colors">
          <MapPin size={20} strokeWidth={2} />
          <span className="tracking-tight">지도보기</span>
        </button>

        {/* 커뮤니티 (MessageSquare) */}
        <button className="flex flex-col items-center gap-1 flex-1 py-2 text-gray-600 hover:text-amber-600 transition-colors">
          <MessageSquare size={20} strokeWidth={2} />
          <span className="tracking-tight">커뮤니티</span>
        </button>

        {/*  MY (Dog) */}
        <button className="flex flex-col items-center gap-1 flex-1 py-2 text-gray-600 hover:text-amber-600 transition-colors">
          <Dog size={20} strokeWidth={2} />
          <span className="tracking-tight">MY</span>
        </button>
      </nav>
    </div>
  );
}
