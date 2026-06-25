"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ParkDetailPage() {
  const params = useParams();
  const parkId = params.id as string;
  const [loading, setLoading] = useState(true);

  // 여기서 parkId를 이용해 Supabase에서 데이터를 가져오거나
  // 카카오 지도 API에서 장소 상세 정보를 조회할 수 있습니다.

  useEffect(() => {
    // 예시: 데이터 로딩 완료 처리
    setLoading(false);
  }, [parkId]);

  if (loading) return <div>공원 정보 불러오는 중...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">공원 상세 페이지</h1>
      <p className="text-gray-600">공원 ID: {parkId}</p>

      {/* 여기에 나중에 AI 추천 기능과 
        해당 공원에 '체크인'한 사람들의 목록이 뜰 예정
      */}
      <div className="mt-8 p-4 border rounded-xl bg-amber-50">
        이 공원에서 산책 중인 친구들이 여기에 표시됩니다.
      </div>
    </div>
  );
}
