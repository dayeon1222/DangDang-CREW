"use client"; // 1. 클라이언트 컴포넌트로 변경

import { useState, useEffect } from "react";
import ToolBar from "@/components/common/ToolBar";
import Link from "next/link";
import DogCard from "@/components/common/DogCard";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [dogs, setDogs] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("전체"); // 필터 상태 추가

  useEffect(() => {
    fetchDogs();
  }, [selectedSize]); // 선택이 바뀔 때마다 다시 실행

  const fetchDogs = async () => {
    let query = supabase
      .from("dogs")
      .select("*")
      .order("created_at", { ascending: false });

    // 필터 조건 적용
    if (selectedSize !== "전체") {
      query = query.eq("dog_size", selectedSize);
    }

    const { data } = await query;
    setDogs(data || []);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-0 md:pt-6">
      <ToolBar onFilterChange={setSelectedSize} selectedSize={selectedSize} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dogs.map((item) => (
          <Link key={item.id} href={`/dogs/${item.id}`} className="w-full">
            <DogCard dog={item} />
          </Link>
        ))}
      </div>
    </div>
  );
}
