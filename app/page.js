import { getLinks, getSettings } from "@/lib/db";

// 관리자 저장 즉시 반영되도록 항상 최신 데이터를 가져옵니다.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [links, settings] = await Promise.all([getLinks(), getSettings()]);

  return (
    <main className="page">
      <section className="profile">
        <div className="avatar" aria-hidden="true">
          {settings.org_name ? settings.org_name.slice(0, 2) : "IT"}
        </div>
        <h1 className="org-name">{settings.org_name}</h1>
        <p className="tagline">{settings.tagline}</p>
      </section>

      <section className="links" aria-label="행사 링크 목록">
        {links.map((link) => (
          <a
            key={link.id}
            className="link-btn"
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.icon && (
              <span className="link-icon" aria-hidden="true">
                {link.icon}
              </span>
            )}
            <span className="link-label">{link.title}</span>
          </a>
        ))}
      </section>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} {settings.org_name}
        </p>
        <p className="footer-admin-link">
          <a href="/admin">관리자 설정</a>
        </p>
      </footer>
    </main>
  );
}
