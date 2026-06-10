import ToolBar from "@/components/common/ToolBar";
import DogCard from "@/components/common/DogCard";
import { createClient } from "@/lib/supabaseServer";

export default async function HomePage() {
  // 서버 전용 클라이언트 생성
  const supabase = await createClient();

  // 데이터 가져오기
  const { data: dogs, error } = await supabase
    .from("dogs")
    .select("*")
    .order("created_at", { ascending: false });

  // 에러 처리
  if (error) {
    console.error("데이터 로딩 에러:", error);
    return (
      <div className="p-10 text-center text-red-500">
        데이터를 불러오는 중 문제가 발생했습니다.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pt-0 md:pt-6">
      <ToolBar />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dogs && dogs.length > 0 ? (
          dogs.map((item) => (
            <div key={item.id} className="w-full">
              <DogCard dog={item} />
            </div>
          ))
        ) : (
          <div className="col-span-full p-20 text-center text-gray-400">
            등록된 산책 친구가 없어요. 첫 번째 주인공이 되어주세요!
          </div>
        )}
      </div>
    </div>
  );
}
