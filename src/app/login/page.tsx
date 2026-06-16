"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMsg(
        error.message === "Invalid login credentials"
          ? "이메일이나 비밀번호가 일치하지 않습니다."
          : error.message,
      );
    } else {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
      <div className="bg-[#FFFDF5] p-8 rounded-[40px] shadow-xl border-2 border-primary/20 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2 text-[#5C4033]">
          다시 만나서 반가워요!
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm">
          로그인하고 친구들을 만나러 갈까요?
        </p>

        {errorMsg && (
          <p className="text-red-500 text-xs bg-red-50 p-2 rounded-xl mb-4 text-center">
            {errorMsg}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <input
            className="w-full p-4 border-2 border-primary/30 rounded-2xl focus:border-primary outline-none transition text-sm bg-white"
            type="email"
            placeholder="이메일"
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMsg("");
            }}
          />
          <input
            className="w-full p-4 border-2 border-primary/30 rounded-2xl focus:border-primary outline-none transition text-sm bg-white"
            type="password"
            placeholder="비밀번호"
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMsg("");
            }}
          />
        </div>

        <button
          className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] text-white p-4 rounded-2xl font-bold mt-8 transition shadow-lg"
          onClick={handleLogin}
        >
          로그인 하기
        </button>

        <div className="mt-6 text-center text-xs text-gray-500">
          아직 친구가 아니신가요?{" "}
          <Link
            href="/signup"
            className="text-[#6B8E23] font-bold hover:underline"
          >
            가입하러 가기
          </Link>
        </div>
      </div>
    </div>
  );
}
