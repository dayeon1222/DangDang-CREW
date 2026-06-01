// src/components/desktop/DesktopHeader
"use client";

import { useState } from "react";
import { Dog } from "lucide-react";

export default function DesktopHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  return (
    <header className="hidden md:flex w-full h-[100px] bg-white border-b border-gray-100 px-6 fixed top-0 left-0 z-50 items-center">
      <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
        {/* 로고와 기본 메뉴 */}
        <div className="flex items-center gap-12">
          <h1 className="h-[140px] flex items-center cursor-pointer flex-shrink-0">
            <img
              src="/logo.png"
              alt="댕댕크루 로고"
              className="h-full w-auto object-contain"
            />
          </h1>

          {/* nav */}
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
          {/* 로그인/로그아웃 텍스트 스위칭 */}
          {isLoggedIn ? (
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors whitespace-nowrap font-medium"
            >
              로그아웃
            </button>
          ) : (
            <button
              onClick={() => setIsLoggedIn(true)}
              className="text-sm text-gray-700 font-bold hover:text-amber-600 transition-colors whitespace-nowrap"
            >
              로그인
            </button>
          )}

          {/* 프로필 사진 / 게스트 아이콘 스위칭 */}
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
