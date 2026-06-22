"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function EditProfilePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(""); // 사진 URL
  const [file, setFile] = useState<File | null>(null); // 업로드할 파일
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data } = await supabase
        .from("profiles")
        .select("nickname, bio, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setNickname(data.nickname || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [router]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const updateProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    let newAvatarUrl = avatarUrl;

    // 파일이 선택되었다면 스토리지에 업로드
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError)
        return alert("이미지 업로드 실패: " + uploadError.message);

      // 이미지 URL 가져오기
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      newAvatarUrl = data.publicUrl;
    }

    //  DB 업데이트
    const { error } = await supabase
      .from("profiles")
      .update({ nickname, bio, avatar_url: newAvatarUrl })
      .eq("id", user.id);

    if (error) alert("수정 실패: " + error.message);
    else {
      alert("프로필이 수정되었습니다!");
      router.push("/profile");
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-6">프로필 수정</h1>

      {/* 사진 수정 */}
      <div className="mb-6 flex flex-col items-center">
        <img
          src={avatarUrl || "https://via.placeholder.com/100"}
          className="w-24 h-24 rounded-full mb-2 object-cover"
        />
        <input type="file" onChange={handleFileChange} />
      </div>

      <div className="mb-4">
        <label className="block mb-2">닉네임</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2">소개글</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        onClick={updateProfile}
        className="w-full py-2 bg-blue-500 text-white rounded"
      >
        저장하기
      </button>
    </div>
  );
}
