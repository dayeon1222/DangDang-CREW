import { Pencil } from "lucide-react";
import Link from "next/link";
import { ToolBarProps } from "@/types/common";

export default function ToolBar({
  onFilterChange,
  selectedSize,
}: ToolBarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
      {/* 필터 영역 */}
      <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-hide">
        {["전체", "대형견", "중형견", "소형견"].map((item) => (
          <button
            key={item}
            onClick={() => onFilterChange(item)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm active:scale-95
              ${
                selectedSize === item
                  ? "bg-primary text-white border-2 border-primary"
                  : "bg-white text-gray-600 border-2 border-gray-100 hover:border-primary/50"
              }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* 글쓰기 버튼 */}
      <Link
        href="/write"
        className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-2.5 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition active:scale-95"
      >
        <Pencil size={18} />
        글쓰기
      </Link>
    </div>
  );
}
