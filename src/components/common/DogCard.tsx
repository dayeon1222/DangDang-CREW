import { MapPin, Users, Info, Clock } from "lucide-react";
import { Dog } from "@/types/dog";

export interface DogCardProps {
  dog: Dog;
}

export default function DogCard({ dog }: DogCardProps) {
  return (
    <div className="flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer">
      {/* 강아지 사진 */}
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-200 shrink-0">
        <img
          src={dog.image}
          alt={dog.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col justify-between py-1 w-full gap-1">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-bold text-gray-900 truncate">{dog.title}</h3>
          <p className="text-sm text-gray-600 font-medium">
            {dog.name} ({dog.age}살, {dog.breed})
          </p>

          {/* 장소 & 참여 인원 */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {dog.location}
            </span>
            <span className="flex items-center gap-1">
              <Users size={14} /> {dog.currentParticipants}/
              {dog.maxParticipants}
            </span>
          </div>
        </div>

        {/* 해시태그 */}
        <div className="flex flex-wrap gap-1">
          {dog.hashtags.map((tag) => (
            <span key={tag} className="text-xs text-blue-500">
              #{tag}
            </span>
          ))}
        </div>

        {/* 특이사항 & 시간 */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
            <Info size={12} /> {dog.note}
          </div>
          <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0 ml-2">
            <Clock size={12} /> {dog.time}
          </span>
        </div>
      </div>
    </div>
  );
}
