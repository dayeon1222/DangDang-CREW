import Image from "next/image";

interface DogCardProps {
  dog: {
    name: string;
    breed: string;
    age: number;
    type: string;
    location: string;
    status: string;
    time: string;
    image: string;
  };
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
      <div className="flex flex-col justify-between py-1 w-full">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-bold text-gray-900">{dog.name}</h3>
          <p className="text-sm text-gray-500">
            {dog.type} · {dog.age}살 · {dog.breed}
          </p>
        </div>

        {/* 하단 정보 (태그 + 시간) */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-md">
              {dog.status}
            </span>
            <span className="text-xs text-gray-400">{dog.location}</span>
          </div>
          <span className="text-xs text-gray-400">{dog.time}</span>
        </div>
      </div>
    </div>
  );
}
