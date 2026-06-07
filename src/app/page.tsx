import ToolBar from "@/components/common/ToolBar";
import DogCard from "@/components/common/DogCard";

export default function HomePage() {
  // 임시 데이터
  const dogList = [
    {
      title: "송도 센트럴파크 산책해요!",
      name: "멍멍이",
      breed: "리트리버",
      age: 2,
      location: "인천 연수구",
      hashtags: ["산책", "대형견"],
      currentParticipants: 3,
      maxParticipants: 10,
      note: "입질 없고 순해요!",
      time: "5분 전",
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
