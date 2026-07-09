import { MapPin, Users, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { DogCardProps } from "@/types/dog";

export default function DogCard({ dog }: DogCardProps) {
  return (
    <div className="flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer">
      {/* 강아지 사진 */}
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200 shrink-0">
        <img
          src={dog.image_url}
          alt={dog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col justify-between py-1 w-full gap-1">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-bold text-gray-900 truncate">{dog.title}</h3>

          {/* 장소 & 참여 인원 */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
              <MapPin size={14} className="text-primary" />
              {dog.location_name || "장소 미지정"}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users size={14} /> 최대 {dog.people}명 모집
            </div>
          </div>
        </div>

        {/* 해시태그 */}
        <div className="flex flex-wrap gap-1">
          {dog.hashtags?.map((tag) => (
            <span key={tag} className="text-xs text-blue-500">
              #{tag}
            </span>
          ))}
        </div>

        {/* 설명 & 시간 */}
        <div className="flex items-center justify-between mt-1">
          <div className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded truncate max-w-[150px]">
            {dog.content}
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0 ml-2">
            <Clock size={12} />
            {formatDistanceToNow(new Date(dog.created_at), {
              addSuffix: true,
              locale: ko,
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
