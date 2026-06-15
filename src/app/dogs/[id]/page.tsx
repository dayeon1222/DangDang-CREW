"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function DogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [dog, setDog] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    const fetchData = async () => {
      // 게시글 정보 가져오기
      const { data } = await supabase
        .from("dogs")
        .select("*")
        .eq("id", id)
        .single();
      setDog(data);

      // 참여자 수 가져오기
      const { count } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("post_id", id);
      setParticipantsCount(count || 0);

      // 현재 유저 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchData();
  }, [id, supabase]);

  const handleJoin = async () => {
    if (!user) return alert("로그인이 필요합니다.");
    const { error } = await supabase
      .from("participants")
      .insert([{ post_id: id, user_id: user.id }]);
    if (error) alert("이미 참여 중이거나 문제가 발생했습니다.");
    else alert("참여 완료!");
  };

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("dogs").delete().eq("id", id);
    if (error) alert("삭제 실패!");
    else {
      alert("삭제되었습니다.");
      router.push("/");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 24) {
      if (diffInHours === 0) return "방금 전";
      return `${diffInHours}시간 전`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 3) return `${diffInDays}일 전`;
    return date
      .toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\.$/, "");
  };

  if (!dog) return <div className="p-10 text-center">로딩중...</div>;

  const isOwner = user?.id === dog.user_id;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{dog.title}</h1>
      <div className="text-sm text-gray-400 mb-2">
        {formatDate(dog.created_at)}
      </div>

      {isOwner && (
        <div className="flex justify-end gap-2 mb-4">
          <Link
            href={`/edit/${id}`}
            className="px-4 py-2 bg-gray-300 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
          >
            수정
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition"
          >
            삭제
          </button>
        </div>
      )}

      <img
        src={dog.image_url}
        alt="강아지 사진"
        className="w-full h-80 object-cover rounded-2xl mb-6 shadow-md"
      />

      <p className="text-gray-700 bg-gray-50 p-4 rounded-xl mb-6 whitespace-pre-line">
        {dog.content}
      </p>

      {/* 마감 시간 및 인원 정보 */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 border rounded-xl shadow-sm">
        <span className="font-bold text-lg text-primary">
          마감: {dog.deadline ? `${dog.deadline} 까지` : "시간 미정"}
        </span>
        <span className="font-bold text-lg text-gray-700">
          {participantsCount}/{dog.people}명
        </span>
      </div>

      <div className="flex justify-start mb-8">
        <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">
          {dog.hashtag}
        </span>
      </div>

      {!isOwner && (
        <button
          onClick={handleJoin}
          className="w-full p-4 bg-primary text-white rounded-xl font-bold text-lg hover:opacity-90 transition"
        >
          참여하기
        </button>
      )}

      {isOwner && (
        <div className="flex gap-2">
          <button className="flex-1 p-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition">
            산책 완료
          </button>
          <button className="flex-1 p-4 bg-secondary text-white rounded-xl font-bold hover:bg-secondary-dark transition">
            시간 늘리기
          </button>
        </div>
      )}
    </div>
  );
}
