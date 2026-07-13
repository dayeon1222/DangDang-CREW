"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Image as ImageIcon, X } from "lucide-react";

export default function WritePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"자랑하기" | "고민상담">("자랑하기");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 이미지 선택 처리
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    let imageUrl = null;

    // 이미지 업로드
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        alert("이미지 업로드 실패: " + uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    // 게시글 저장
    const { error } = await supabase.from("posts").insert([
      {
        user_id: user.id,
        title,
        content,
        category,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      alert("글쓰기에 실패했습니다: " + error.message);
    } else {
      alert("글이 등록되었습니다!");
      router.push("/community");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-8">글쓰기</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 카테고리 선택 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            카테고리
          </label>
          <div className="flex gap-4">
            {(["자랑하기", "고민상담"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex-1 py-3 rounded-lg font-bold border transition-colors ${
                  category === cat
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-500 border-gray-200 hover:border-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            사진 첨부
          </label>
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all"
            >
              <ImageIcon size={24} />
              <span className="text-[10px] mt-1">사진 추가</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            {imagePreview && (
              <div className="relative w-24 h-24">
                <img
                  src={imagePreview}
                  alt="미리보기"
                  className="w-full h-full object-cover rounded-xl shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            제목
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-base"
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            내용
          </label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-base resize-none"
            placeholder="내용을 입력하세요"
          />
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:bg-gray-300 shadow-lg"
        >
          {loading ? "등록 중..." : "등록하기"}
        </button>
      </form>
    </div>
  );
}
