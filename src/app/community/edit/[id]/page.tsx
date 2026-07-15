"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Image as ImageIcon, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<"자랑하기" | "고민상담">("자랑하기");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 기존 게시글 정보 쿼리 (데이터 페칭 최적화)
  const { isLoading: isFetching } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setTitle(data.title);
      setContent(data.content);
      setCategory(data.category);
      setImagePreview(data.image_url);
      return data;
    },
    enabled: !!id,
    staleTime: 0,
  });

  // 게시글 수정 뮤테이션
  const updateMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = imagePreview;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from("posts")
        .update({ title, content, category, image_url: imageUrl })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      alert("수정되었습니다!");
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      router.push(`/community/${id}`);
    },
    onError: (err: any) => {
      alert("수정 실패: " + err.message);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (isFetching)
    return <div className="p-10 text-center text-gray-500">불러오는 중...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-8">글 수정하기</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate();
        }}
        className="space-y-8"
      >
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

        {/* 사진 업로드 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            사진
          </label>
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
            >
              <ImageIcon size={24} />
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

        {/* 제목 & 내용 */}
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
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            내용
          </label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-48 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-base resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-opacity-90 transition-all disabled:bg-gray-300 shadow-lg"
        >
          {updateMutation.isPending ? "수정 중..." : "수정 완료"}
        </button>
      </form>
    </div>
  );
}
