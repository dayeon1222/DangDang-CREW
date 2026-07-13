"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { CalendarEvent } from "@/types/api";
import { Dog } from "@/types/dog";

export default function CalendarButton({ dog }: { dog: Dog }) {
  const [loading, setLoading] = useState(false);

  const handleAddToCalendar = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: dog.content,
          timeInfo: dog.deadline,
        }),
      });

      if (!res.ok) {
        throw new Error("서버 응답 오류");
      }

      const data: CalendarEvent = await res.json();

      if (data.startTime) {
        const endDate = new Date(
          new Date(data.startTime).getTime() +
            (data.durationMinutes || 60) * 60000,
        );

        // 구글 캘린더 URL 생성 (날짜 포맷: YYYYMMDDTHHmmssZ)
        const startStr =
          data.startTime.replace(/[-:]/g, "").split(".")[0] + "Z";
        const endStr =
          endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

        const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          data.summary || "댕댕크루 산책",
        )}&dates=${startStr}/${endStr}`;

        window.open(googleUrl, "_blank");
      } else {
        alert(
          "일정 정보를 찾을 수 없었어요. 내용을 조금 더 구체적으로 적어주실래요?",
        );
      }
    } catch (e) {
      console.error(e);
      alert("캘린더 연결 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCalendar}
      disabled={loading}
      className={`
        flex items-center justify-center gap-2 
        transition-all active:scale-95 
        shadow-md hover:shadow-lg
        bg-primary text-white font-bold
        px-4 py-2.5 sm:px-5 sm:py-3 
        text-xs sm:text-sm 
        rounded-full sm:rounded-2xl
        ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-primary/90"}
      `}
    >
      <Calendar size={16} />
      <span>{loading ? "AI 분석 중..." : "캘린더에 추가"}</span>
    </button>
  );
}
