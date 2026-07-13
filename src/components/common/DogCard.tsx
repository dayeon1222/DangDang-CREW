import { MapPin, Users, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { DogCardProps } from "@/types/dog";

export default function DogCard({ dog }: DogCardProps) {
  return (
    <div className="flex flex-col h-full bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
      {/* 강아지 사진 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={dog.image_url || "/default-dog.png"}
          alt={dog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
          {dog.status || "모집중"}
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col p-5 gap-3 flex-1">
        <div>
          <h3 className="font-bold text-gray-900 text-lg truncate mb-1">
            {dog.title}
          </h3>

          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <MapPin size={14} className="text-primary" />
            <span className="truncate">
              {dog.location_name || "장소 미지정"}
            </span>
          </div>
        </div>

        {/* 태그 영역 */}
        <div className="flex flex-wrap gap-1.5 min-h-[24px]">
          {dog.hashtags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 하단 요약 */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users size={14} />
            <span>최대 {dog.people}명</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={12} />
            {formatDistanceToNow(new Date(dog.created_at), {
              addSuffix: true,
              locale: ko,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
