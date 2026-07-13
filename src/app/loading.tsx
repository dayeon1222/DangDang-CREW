export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center min-h-[60vh] p-6 text-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
      <div className="text-lg sm:text-xl font-bold text-secondary animate-pulse px-4">
        강아지 친구들을
        <br className="sm:hidden" /> 불러오는 중이에요...
      </div>
    </div>
  );
}
