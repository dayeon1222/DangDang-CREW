import type { Metadata } from "next";
import "./globals.css";

import DesktopHeader from "@/components/desktop/DesktopHeader";
import MobileTabBar from "@/components/mobile/MobileTabBar";

export const metadata: Metadata = {
  title: "댕댕크루 - 우리 동네 반려견 산책 커뮤니티",
  description: "동네 반려견 피드와 지도를 통해 함께 산책할 크루를 찾아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col bg-gray-50 text-gray-900"
        suppressHydrationWarning={true}
      >
        {/*  데스크톱용 상단 바 고정 */}
        <DesktopHeader />

        <main className="flex-1 pb-16 md:pb-0">{children}</main>

        {/* 모바일용 하단 탭 바 고정 */}
        <MobileTabBar />
      </body>
    </html>
  );
}
