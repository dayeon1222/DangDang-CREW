"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Camera } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const queryClient = useQueryClient();

  // 프로필 정보 조회
  const { isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("로그인이 필요합니다.");

      const { data } = await supabase
        .from("profiles")
        .select("nickname, bio, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setNickname(data.nickname || "");
        setBio(data.bio || "");
        setPreviewUrl(data.avatar_url || "");
      }
      return data;
    },
    retry: false,
  });

  //  프로필 수정 뮤테이션
  const updateMutation = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("사용자를 찾을 수 없습니다.");

      let avatarUrl = previewUrl;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
        avatarUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ nickname, bio, avatar_url: avatarUrl })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      alert("프로필이 수정되었습니다!");
      router.push("/profile");
    },
    onError: (error: any) => {
      alert("수정 실패: " + error.message);
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  if (isLoading)
    return (
      <div className="p-10 text-center font-bold text-gray-500">로딩 중...</div>
    );

  return (
    <div className="max-w-md mx-auto p-6 min-h-screen">
      <h1 className="text-2xl font-bold mb-8 text-secondary">프로필 수정</h1>

      <div className="mb-8 flex flex-col items-center">
        <div
          className="relative w-32 h-32 mb-4 group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <img
            src={previewUrl || "https://via.placeholder.com/150"}
            className="w-full h-full rounded-full object-cover border-4 border-gray-100 shadow-md"
            alt="프로필 미리보기"
          />
          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white" size={32} />
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <p className="text-xs text-gray-400">클릭하여 사진을 변경하세요</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block mb-2 font-bold text-sm text-gray-700">
            닉네임
          </label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition"
            placeholder="닉네임을 입력하세요"
          />
        </div>

        <div>
          <label className="block mb-2 font-bold text-sm text-gray-700">
            소개글
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition h-32 resize-none"
            placeholder="나를 소개하는 글을 적어보세요"
          />
        </div>
      </div>

      <button
        onClick={() => updateMutation.mutate()}
        disabled={updateMutation.isPending}
        className="w-full py-4 mt-8 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition shadow-lg active:scale-[0.98] disabled:bg-gray-400"
      >
        {updateMutation.isPending ? "저장 중..." : "저장하기"}
      </button>
    </div>
  );
}
