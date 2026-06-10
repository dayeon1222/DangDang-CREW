"use client";

import { useState, ChangeEvent, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { WriteFormData } from "@/types/dog";
import { createClient } from "@/lib/supabaseClient";

export default function WritePage() {
  const router = useRouter(); // router 선언
  const supabase = createClient();

  const [formData, setFormData] = useState<WriteFormData>({
    title: "",
    people: "",
    hashtag: "",
    content: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !image || !formData.people) {
      return alert("모든 필수 항목을 입력하고 강아지 사진을 추가해주세요!");
    }

    setIsSubmitting(true);

    try {
      // 현재 로그인한 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("로그인이 필요합니다.");
        setIsSubmitting(false);
        return;
      }

      // 이미지 업로드 (Storage)
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("dog-images")
        .upload(fileName, image);

      if (uploadError) throw uploadError;

      // 공개 URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from("dog-images").getPublicUrl(fileName);

      // DB에 데이터 삽입 (Table)
      const { error: insertError } = await supabase.from("dogs").insert([
        {
          title: formData.title,
          content: formData.content,
          image_url: publicUrl,
          people: parseInt(formData.people, 10),
          hashtags: formData.hashtag
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t !== ""),
          user_id: user.id,
        },
      ]);

      if (insertError) throw insertError;

      alert("댕댕크루에 글이 등록되었어요!");

      // 5. 페이지 이동 및 초기화
      router.push("/");
      router.refresh();

      setFormData({ title: "", people: "", hashtag: "", content: "" });
      handleRemoveImage();
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-primary">
        내 산책 친구를 찾아줘!
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="title"
          placeholder="제목을 입력하세요"
          value={formData.title}
          onChange={handleChange}
          className="p-3 border rounded-xl focus:ring-2 focus:ring-primary outline-none"
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-600">강아지 사진</label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-2xl h-64 flex items-center justify-center overflow-hidden bg-gray-50 hover:border-primary transition group">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 text-gray-500 group-hover:text-primary"
              >
                <ImagePlus size={48} strokeWidth={1} />
                <span className="font-medium">사진 추가하기</span>
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <select
          name="people"
          value={formData.people}
          onChange={handleChange}
          className="p-3 border rounded-xl outline-none"
        >
          <option value="">참여 인원을 선택하세요</option>
          <option value="2">2명</option>
          <option value="3">3명</option>
          <option value="4">4명</option>
          <option value="5">5명</option>
          <option value="6">6명 이상</option>
        </select>

        <input
          name="hashtag"
          placeholder="#해시태그 (#은 빼고 콤마로 구분)"
          value={formData.hashtag}
          onChange={handleChange}
          className="p-3 border rounded-xl outline-none"
        />
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="설명"
          className="p-3 border rounded-xl h-40 outline-none"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="p-4 bg-primary text-white rounded-xl font-bold disabled:bg-gray-400"
        >
          {isSubmitting ? "등록 중..." : "글 등록하기"}
        </button>
      </form>
    </div>
  );
}
