import crypto from "node:crypto";

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7일

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return secret;
}

function sign(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * 비밀번호가 맞는지 확인합니다. (timing-safe 비교)
 * ADMIN_PASSWORD 환경변수가 설정되어 있어야 합니다.
 */
export function checkPassword(password) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== "string") return false;

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false; // 길이가 다르면 timingSafeEqual이 예외를 던짐
  return crypto.timingSafeEqual(a, b);
}

/** 로그인 성공 시 쿠키에 저장할 세션 토큰을 생성합니다. */
export function createSessionToken() {
  const secret = getSecret();
  if (!secret) {
    throw new Error(
      "AUTH_SECRET 환경변수가 설정되어 있지 않습니다. 관리자 로그인을 사용하려면 설정이 필요합니다."
    );
  }
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  const signature = sign(payload, secret);
  return `${payload}.${signature}`;
}

/** 세션 토큰이 유효한지 (서명이 맞고 만료되지 않았는지) 확인합니다. */
export function verifySessionToken(token) {
  const secret = getSecret();
  if (!secret || !token || typeof token !== "string") return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  return true;
}
