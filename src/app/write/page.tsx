"use client";

import {
  useState,
  ChangeEvent,
  FormEvent,
  useRef,
  useEffect,
  use,
} from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { WriteFormData } from "@/types/dog";
import { supabase } from "@/lib/supabaseClient";

export default function WritePage({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  const router = useRouter();

  // params를 use 훅으로 언래핑합니다.
  const resolvedParams = params ? use(params) : null;
  const isEdit = !!resolvedParams?.id;

  // id 상태를 초기화합니다.
  const [id, setId] = useState<string | null>(resolvedParams?.id || null);

  const [formData, setFormData] = useState<WriteFormData>({
    title: "",
    people: "",
    hashtag: "",
    content: "",
    dog_size: "",
    deadline: "",
    status: "모집중", // 초기값 설정 (필요에 따라 수정)
  });

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit && resolvedParams?.id) {
      const fetchDog = async () => {
        const { data, error } = await supabase
          .from("dogs")
          .select("*")
          .eq("id", resolvedParams.id)
          .maybeSingle(); // 에러 방지를 위해 maybeSingle 사용

        if (data) {
          setFormData({
            title: data.title || "",
            content: data.content || "",
            people: data.people?.toString() || "",
            hashtag: data.hashtags ? data.hashtags.join(", ") : "",
            dog_size: data.dog_size || "",
            deadline: data.deadline || "",
            status: data.status || "모집중",
          });
          setPreviewUrl(data.image_url || null);
        } else if (error) {
          console.error("데이터 로드 실패:", error);
        }
      };
      fetchDog();
    }
  }, [isEdit, resolvedParams?.id]);

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
    if (
      !formData.title ||
      !formData.content ||
      !formData.people ||
      !formData.dog_size ||
      !formData.deadline
    ) {
      return alert("모든 필수 항목(마감 시간 포함)을 입력해주세요!");
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = previewUrl;

      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("dog-images")
          .upload(fileName, image);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("dog-images")
          .getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      const postData = {
        title: formData.title,
        content: formData.content,
        image_url: finalImageUrl,
        people: parseInt(formData.people, 10),
        hashtags: formData.hashtag
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t !== ""),
        dog_size: formData.dog_size,
        deadline: formData.deadline,
      };

      if (isEdit && id) {
        const { error } = await supabase
          .from("dogs")
          .update(postData)
          .eq("id", id);
        if (error) throw error;
        alert("수정되었습니다!");
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("dogs")
          .insert([{ ...postData, user_id: user?.id }]);
        if (error) throw error;
        alert("등록되었습니다!");
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("작업 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-primary">
        {isEdit ? "글 수정하기" : "내 산책 친구를 찾아줘!"}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          name="title"
          placeholder="제목"
          value={formData.title}
          onChange={handleChange}
          className="p-3 border rounded-xl"
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-600">강아지 사진</label>
          <div className="relative border-2 border-dashed border-gray-300 rounded-2xl h-64 flex items-center justify-center bg-gray-50">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  className="w-full h-full object-cover rounded-2xl"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-1.5 bg-black/50 rounded-full text-white"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 text-gray-500"
              >
                <ImagePlus size={48} />
                <span className="font-medium">사진 추가</span>
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

        <div className="flex gap-4">
          <select
            name="people"
            value={formData.people}
            onChange={handleChange}
            className="flex-1 p-3 border rounded-xl outline-none"
          >
            <option value="">참여 인원</option>
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 6 ? "명 이상" : "명"}
              </option>
            ))}
          </select>
          <div className="flex-1 flex flex-col gap-1">
            <input
              type="time"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="p-3 border rounded-xl outline-none w-full"
            />
          </div>
        </div>

        <select
          name="dog_size"
          value={formData.dog_size}
          onChange={handleChange}
          className="p-3 border rounded-xl outline-none"
        >
          <option value="">강아지 크기</option>
          <option value="소형견">소형견</option>
          <option value="중형견">중형견</option>
          <option value="대형견">대형견</option>
        </select>

        <input
          name="hashtag"
          placeholder="#해시태그 (콤마 구분)"
          value={formData.hashtag}
          onChange={handleChange}
          className="p-3 border rounded-xl"
        />
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="설명"
          className="p-3 border rounded-xl h-40"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="p-4 bg-primary text-white rounded-xl font-bold"
        >
          {isSubmitting ? "처리 중..." : isEdit ? "수정 완료" : "글 등록하기"}
        </button>
      </form>
    </div>
  );
}
