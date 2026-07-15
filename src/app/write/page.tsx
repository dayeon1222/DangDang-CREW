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
import { ImagePlus, X, MapPin } from "lucide-react";
import { useKakaoLoader } from "react-kakao-maps-sdk";
import { WriteFormData } from "@/types/dog";
import { supabase } from "@/lib/supabaseClient";

export default function WritePage({
  params,
}: {
  params?: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [loadingKakao] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY || "",
    libraries: ["services"],
  });

  const resolvedParams = params ? use(params) : null;
  const isEdit = !!resolvedParams?.id;

  const [id, setId] = useState<string | null>(resolvedParams?.id || null);
  const [parkList, setParkList] = useState<{ id: string; name: string }[]>([]);
  const [loadingParks, setLoadingParks] = useState(true);

  const [formData, setFormData] = useState<WriteFormData>({
    title: "",
    people: "",
    content: "",
    dog_size: "",
    deadline: "",
    status: "모집중",
  });

  const [location, setLocation] = useState<{ name: string; id: string } | null>(
    null,
  );
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loadingKakao) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const ps = new kakao.maps.services.Places();
          ps.keywordSearch(
            "공원",
            (data, status) => {
              if (status === kakao.maps.services.Status.OK) {
                setParkList(
                  data.map((p) => ({ id: p.id, name: p.place_name })),
                );
              }
              setLoadingParks(false);
            },
            {
              location: new kakao.maps.LatLng(latitude, longitude),
              radius: 5000,
              sort: kakao.maps.services.SortBy.DISTANCE,
            },
          );
        },
        () => {
          alert("위치 정보를 가져올 수 없습니다.");
          setLoadingParks(false);
        },
      );
    } else {
      setLoadingParks(false);
    }
  }, [loadingKakao]);

  useEffect(() => {
    if (isEdit && resolvedParams?.id) {
      const fetchDog = async () => {
        const { data } = await supabase
          .from("dogs")
          .select("*")
          .eq("id", resolvedParams.id)
          .maybeSingle();

        if (data) {
          setFormData({
            title: data.title || "",
            content: data.content || "",
            people: data.people?.toString() || "",
            dog_size: data.dog_size || "",
            deadline: data.deadline || "",
            status: data.status || "모집중",
          });
          setPreviewUrl(data.image_url || null);
          if (data.location_name && data.location_id) {
            setLocation({ name: data.location_name, id: data.location_id });
          }
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
      !formData.deadline ||
      !location
    ) {
      return alert("모든 필수 항목을 입력해주세요!");
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
        dog_size: formData.dog_size,
        deadline: formData.deadline,
        location_name: location.name,
        location_id: location.id,
      };

      if (isEdit && id) {
        await supabase.from("dogs").update(postData).eq("id", id);
        alert("수정되었습니다!");
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        await supabase
          .from("dogs")
          .insert([{ ...postData, user_id: user?.id }]);
        alert("등록되었습니다!");
      }
      router.push("/");
      router.refresh();
    } catch {
      alert("작업 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-20">
      <h1 className="text-2xl font-bold mb-8 text-secondary">
        {isEdit ? "글 수정하기" : "내 산책 친구를 찾아줘!"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          name="title"
          placeholder="제목을 입력하세요"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-primary outline-none transition"
        />

        <div className="flex items-center gap-3 border-2 border-gray-100 p-4 rounded-2xl bg-white focus-within:border-primary transition">
          <MapPin size={22} className="text-gray-400 shrink-0" />
          <select
            value={location?.id || ""}
            onChange={(e) => {
              const selected = parkList.find((p) => p.id === e.target.value);
              if (selected) setLocation(selected);
            }}
            className="w-full outline-none bg-transparent font-medium"
          >
            <option value="">
              {loadingParks
                ? "주변 공원 찾는 중..."
                : "산책할 공원을 선택하세요"}
            </option>
            {parkList.map((park) => (
              <option key={park.id} value={park.id}>
                {park.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold text-gray-700">강아지 사진</label>
          <div className="relative border-2 border-dashed border-gray-200 rounded-3xl h-64 flex items-center justify-center bg-gray-50 overflow-hidden group">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  alt="preview"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
                >
                  <X size={20} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 text-gray-400 hover:text-primary transition"
              >
                <ImagePlus size={48} />
                <span className="font-bold">사진 추가</span>
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

        <div className="grid grid-cols-2 gap-4">
          <select
            name="people"
            value={formData.people}
            onChange={handleChange}
            className="p-4 border-2 border-gray-100 rounded-2xl outline-none font-medium"
          >
            <option value="">참여 인원</option>
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 6 ? "명 이상" : "명"}
              </option>
            ))}
          </select>
          <input
            type="time"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="p-4 border-2 border-gray-100 rounded-2xl outline-none font-medium"
          />
        </div>

        <select
          name="dog_size"
          value={formData.dog_size}
          onChange={handleChange}
          className="p-4 border-2 border-gray-100 rounded-2xl outline-none font-medium"
        >
          <option value="">강아지 크기</option>
          <option value="소형견">소형견</option>
          <option value="중형견">중형견</option>
          <option value="대형견">대형견</option>
        </select>

        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="산책 모임에 대해 자세히 적어주세요!"
          className="p-4 border-2 border-gray-100 rounded-2xl h-40 outline-none focus:border-primary transition resize-none"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition shadow-lg active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? "처리 중..." : isEdit ? "수정 완료" : "글 등록하기"}
        </button>
      </form>
    </div>
  );
}
