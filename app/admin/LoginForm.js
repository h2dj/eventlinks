"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { login } from "./actions";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await login(password);
      if (!result.ok) {
        setError(result.error || "로그인에 실패했습니다.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <main className="admin-page login-page">
      <section className="login-card">
        <h1>🔒 관리자 로그인</h1>
        <p className="admin-sub">비밀번호를 입력하면 링크와 설정을 편집할 수 있습니다.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="관리자 비밀번호"
            autoFocus
            className="login-input"
          />
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "확인 중..." : "로그인"}
          </button>
        </form>
        {error && <p className="admin-error">{error}</p>}
      </section>
    </main>
  );
}
