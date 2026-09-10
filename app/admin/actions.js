"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  checkPassword,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth";
import { saveAll as saveAllToDb } from "@/lib/db";

async function isAuthed() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/** 로그인 폼에서 호출하는 서버 액션 */
export async function login(password) {
  if (!process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET) {
    return {
      ok: false,
      error:
        "서버에 ADMIN_PASSWORD 또는 AUTH_SECRET 환경변수가 설정되어 있지 않습니다. Vercel 프로젝트 설정을 확인해주세요.",
    };
  }

  if (!checkPassword(password)) {
    return { ok: false, error: "비밀번호가 올바르지 않습니다." };
  }

  const token = createSessionToken();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return { ok: true };
}

/** 로그아웃 서버 액션 */
export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** 설정 + 링크 목록을 한 번에 저장하는 서버 액션 */
export async function saveAll({ orgName, tagline, links }) {
  if (!(await isAuthed())) {
    return { ok: false, error: "로그인이 만료되었습니다. 다시 로그인해주세요." };
  }

  const cleanedOrgName = String(orgName || "").trim();
  const cleanedTagline = String(tagline || "").trim();

  if (!cleanedOrgName) {
    return { ok: false, error: "단체 이름을 입력해주세요." };
  }

  const cleanedLinks = (Array.isArray(links) ? links : [])
    .map((l) => ({
      title: String(l.title || "").trim(),
      url: String(l.url || "").trim(),
      icon: String(l.icon || "").trim(),
    }))
    .filter((l) => l.title && l.url);

  for (const l of cleanedLinks) {
    if (!/^https?:\/\//i.test(l.url)) {
      return { ok: false, error: `URL은 http:// 또는 https:// 로 시작해야 합니다: ${l.url}` };
    }
  }

  try {
    await saveAllToDb({ orgName: cleanedOrgName, tagline: cleanedTagline, links: cleanedLinks });
  } catch (err) {
    return { ok: false, error: `저장 중 오류가 발생했습니다: ${err.message}` };
  }

  revalidatePath("/");
  revalidatePath("/admin");

  return { ok: true, links: cleanedLinks, orgName: cleanedOrgName, tagline: cleanedTagline };
}
