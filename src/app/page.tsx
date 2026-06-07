import ToolBar from "@/components/common/ToolBar";
import DogCard from "@/components/common/DogCard";
import { dogList } from "@/data/mockData";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-0 md:pt-6">
      <ToolBar />

      <div className="flex flex-col">
        {dogList.length > 0 ? (
          dogList.map((item) => <DogCard key={item.id} dog={item} />)
        ) : (
          <div className="p-10 text-center text-gray-400">
            등록된 게시글이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
