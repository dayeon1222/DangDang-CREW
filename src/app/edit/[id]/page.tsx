import WritePage from "@/app/write/page";

export default function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <WritePage params={params} />;
}
