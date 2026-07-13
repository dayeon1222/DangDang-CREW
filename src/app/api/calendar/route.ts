import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { content, timeInfo } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey)
      return NextResponse.json({ error: "KEY 없음" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const today = "2026-07-13";
    const forcedTime = timeInfo && timeInfo.length >= 5 ? timeInfo : "19:00:00";
    const fullStartTime = `${today}T${forcedTime}`;

    const prompt = `
      게시글 내용: "${content || "산책"}"
      오늘 날짜와 시간을 합친 시작 시간: "${fullStartTime}"
      
      위 정보를 바탕으로 아래 JSON 형식으로만 응답해. 절대 아무런 말도 덧붙이지 마.
      {
        "startTime": "${fullStartTime}",
        "durationMinutes": 60,
        "summary": "댕댕크루 산책"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("캘린더 API 에러:", error);
    // 실패 시에도 강제로 고정된 시간이라도 반환하여 캘린더를 띄움
    return NextResponse.json({
      startTime: "2026-07-13T19:00:00",
      durationMinutes: 60,
      summary: "댕댕크루 산책",
    });
  }
}
