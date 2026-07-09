import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ParkPlace } from "@/types/dog";

export async function POST(req: Request) {
  try {
    // 요청 데이터 타입 명시
    const body: { parks: ParkPlace[]; size: string } = await req.json();
    const { parks, size } = body;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.error("API 키를 찾을 수 없습니다.");
      return NextResponse.json(
        { recommendation: "서버 설정 오류 (API KEY)" },
        { status: 500 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 공원 이름만 추출하여 프롬프트 구성
    const limitedParks = parks
      .slice(0, 10)
      .map((p: ParkPlace) => p.place_name)
      .join(", ");

    const prompt = `${size} 강아지와 산책하기 좋은 곳을 아래 공원들 중에서 추천해줘: ${limitedParks}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ recommendation: text });
  } catch (error) {
    console.error("AI 추천 에러:", error);
    return NextResponse.json(
      { recommendation: "AI 서비스 응답 실패" },
      { status: 500 },
    );
  }
}
