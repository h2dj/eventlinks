import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getLinks, getSettings } from "@/lib/db";
import LoginForm from "./LoginForm";
import AdminEditor from "./AdminEditor";

export const metadata = {
  title: "관리자 설정 | 공동체IT사회적협동조합",
};

export default async function AdminPage() {
  const store = await cookies();
  const authed = verifySessionToken(store.get(SESSION_COOKIE)?.value);

  if (!authed) {
    return <LoginForm />;
  }

  const [links, settings] = await Promise.all([getLinks(), getSettings()]);

  return <AdminEditor initialLinks={links} initialSettings={settings} />;
}
