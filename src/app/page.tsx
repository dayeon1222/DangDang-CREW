import ToolBar from "@/components/common/ToolBar";
import DogCard from "@/components/common/DogCard";

export default function HomePage() {
  // 임시 데이터
  const dogList = [
    {
      name: "귀염둥이 멍멍이",
      breed: "리트리버",
      age: 2,
      type: "대형견",
      location: "인천 연수구",
      status: "입양 가능",
      time: "5분 전",
      image: "/dog-placeholder.jpg",
    },
    {
      name: "초코",
      breed: "푸들",
      age: 1,
      type: "소형견",
      location: "인천 남동구",
      status: "임보 중",
      time: "1시간 전",
      image: "/dog-placeholder.jpg",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 pt-0 md:pt-6">
      <ToolBar />

      {/* 데이터 리스트를 순회*/}
      <div className="flex flex-col">
        {dogList.map((item, index) => (
          <DogCard key={index} dog={item} />
        ))}
      </div>
    </div>
  );
}
