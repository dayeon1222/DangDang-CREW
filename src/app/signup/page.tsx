"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,}$/;

    if (!emailRegex.test(email)) {
      setErrorMsg("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    if (!passwordRegex.test(password)) {
      setErrorMsg(
        "비밀번호는 8자 이상, 영문/숫자/특수문자를 모두 포함해야 합니다.",
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("비밀번호가 일치하지 않습니다.");
      return;
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMsg(error.message);
    } else {
      alert("회원가입 성공! 이제 로그인해 주세요.");
      router.push("/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
      <div className="bg-[#FFFDF5] p-8 sm:p-10 rounded-[40px] shadow-xl border-2 border-primary/20 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2 text-primary">
          댕댕크루의 친구가 되어주세요!
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm">
          오늘부터 우리 동네 댕댕이들과 함께해요!
        </p>

        {errorMsg && (
          <p className="text-red-500 text-xs bg-red-50 p-3 rounded-xl mb-4 text-center border border-red-100">
            {errorMsg}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <input
            className="w-full p-4 border-2 border-primary/30 rounded-2xl focus:border-primary outline-none transition text-sm bg-white"
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMsg("");
            }}
          />
          <input
            className="w-full p-4 border-2 border-primary/30 rounded-2xl focus:border-primary outline-none transition text-sm bg-white"
            type="password"
            placeholder="비밀번호 (8자 이상, 특수문자 포함)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMsg("");
            }}
          />
          <input
            className="w-full p-4 border-2 border-primary/30 rounded-2xl focus:border-primary outline-none transition text-sm bg-white"
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrorMsg("");
            }}
          />
        </div>

        <button
          className="w-full bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl font-bold mt-8 transition shadow-lg active:scale-[0.98]"
          onClick={handleSignup}
        >
          회원가입 하기
        </button>

        <div className="mt-6 text-center text-xs text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text-secondary font-bold hover:underline"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
