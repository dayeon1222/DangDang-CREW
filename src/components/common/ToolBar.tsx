import { Pencil } from "lucide-react";
import Link from "next/link";

// 1. 부모로부터 받을 데이터(props) 정의
interface ToolBarProps {
  onFilterChange: (size: string) => void;
  selectedSize: string;
}

export default function ToolBar({
  onFilterChange,
  selectedSize,
}: ToolBarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-0 mb-6 gap-4 px-4">
      {/* 필터 영역 */}
      <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide">
        {["전체", "대형견", "중형견", "소형견"].map((item) => (
          <button
            key={item}
            onClick={() => onFilterChange(item)} // 2. 클릭 시 부모의 함수 호출
            className={`whitespace-nowrap px-4 py-2 border rounded-full text-sm transition shadow-sm 
              ${
                selectedSize === item
                  ? "bg-primary text-white border-primary" // 선택된 버튼 스타일
                  : "bg-white border-gray-200 hover:bg-primary hover:text-white"
              }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* 글쓰기 버튼 */}
      <Link
        href="/write"
        className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-2 bg-primary text-white rounded-full font-bold shadow-md hover:bg-primary-dark transition"
      >
        <Pencil size={16} />
        글쓰기
      </Link>
    </div>
  );
}
