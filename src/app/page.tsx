import ToolBar from "@/components/common/ToolBar";
import DogCard from "@/components/common/DogCard";
import { supabase } from "@/lib/supabaseClient";

export default async function HomePage() {
  const { data: dogs, error } = await supabase.from("dogs").select("*");

  if (error) {
    console.error("데이터 로딩 에러:", error);
    return <div>데이터를 불러오는 중 문제가 발생했습니다.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-0 md:pt-6">
      <ToolBar />

      <div className="flex flex-col">
        {dogs && dogs.length > 0 ? (
          dogs.map((item) => <DogCard key={item.id} dog={item} />)
        ) : (
          <div className="p-10 text-center text-gray-400">
            등록된 게시글이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
