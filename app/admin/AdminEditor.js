"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAll, logout } from "./actions";

function emptyLink() {
  return { title: "", url: "", icon: "" };
}

export default function AdminEditor({ initialLinks, initialSettings }) {
  const [orgName, setOrgName] = useState(initialSettings.org_name || "");
  const [tagline, setTagline] = useState(initialSettings.tagline || "");
  const [links, setLinks] = useState(initialLinks.map((l) => ({ ...l })));
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message }
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function updateLink(index, field, value) {
    setLinks((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  }

  function moveLink(index, dir) {
    setLinks((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeLink(index) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function addLink() {
    setLinks((prev) => [...prev, emptyLink()]);
  }

  function handleSave() {
    setStatus(null);
    startTransition(async () => {
      const result = await saveAll({ orgName, tagline, links });
      if (!result.ok) {
        setStatus({ type: "error", message: result.error || "저장에 실패했습니다." });
        return;
      }
      setLinks(result.links.map((l) => ({ ...l })));
      setOrgName(result.orgName);
      setTagline(result.tagline);
      setStatus({ type: "success", message: "저장되었습니다. 실제 사이트에 바로 반영됩니다." });
      router.refresh();
    });
  }

  function handleLogout() {
    startTransition(async () => {
      await logout();
      router.refresh();
    });
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div className="admin-header-row">
          <h1>⚙️ 관리자 설정</h1>
          <button type="button" className="btn btn-ghost" onClick={handleLogout} disabled={pending}>
            로그아웃
          </button>
        </div>
        <p className="admin-sub">
          여기서 수정하고 <strong>저장</strong>을 누르면 실제 사이트(Turso DB)에 바로 반영됩니다.
        </p>
      </header>

      <section className="admin-editor" aria-label="사이트 정보">
        <h2>사이트 정보</h2>
        <div className="settings-fields">
          <label className="field-label">
            단체 이름
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="text-input"
            />
          </label>
          <label className="field-label">
            소개 문구
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="text-input"
            />
          </label>
        </div>
      </section>

      <div className="admin-layout">
        <section className="admin-editor" aria-label="링크 목록 편집">
          <div className="admin-editor-head">
            <h2>링크 목록</h2>
          </div>
          <div className="rows">
            {links.map((link, i) => (
              <div className="row" key={i}>
                <input
                  className="field-icon"
                  type="text"
                  value={link.icon}
                  placeholder="아이콘"
                  onChange={(e) => updateLink(i, "icon", e.target.value)}
                />
                <input
                  className="field-title"
                  type="text"
                  value={link.title}
                  placeholder="제목"
                  onChange={(e) => updateLink(i, "title", e.target.value)}
                />
                <input
                  className="field-url"
                  type="text"
                  value={link.url}
                  placeholder="https://..."
                  onChange={(e) => updateLink(i, "url", e.target.value)}
                />
                <div className="row-actions">
                  <button
                    type="button"
                    className="icon-btn"
                    title="위로 이동"
                    aria-label="위로 이동"
                    disabled={i === 0}
                    onClick={() => moveLink(i, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    title="아래로 이동"
                    aria-label="아래로 이동"
                    disabled={i === links.length - 1}
                    onClick={() => moveLink(i, 1)}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="icon-btn danger"
                    title="삭제"
                    aria-label="삭제"
                    onClick={() => removeLink(i)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-add" onClick={addLink}>
            + 링크 추가
          </button>
        </section>

        <section className="admin-preview" aria-label="미리보기">
          <h2>미리보기</h2>
          <div className="preview-frame">
            <div className="page" style={{ paddingBlock: 24 }}>
              <div className="profile">
                <div className="avatar" aria-hidden="true">
                  {orgName ? orgName.slice(0, 2) : "IT"}
                </div>
                <h1 className="org-name">{orgName || "(단체 이름)"}</h1>
                <p className="tagline">{tagline}</p>
              </div>
              <div className="links">
                {links.map((link, i) => (
                  <a
                    key={i}
                    className="link-btn"
                    href={link.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.preventDefault()}
                  >
                    {link.icon && (
                      <span className="link-icon" aria-hidden="true">
                        {link.icon}
                      </span>
                    )}
                    <span className="link-label">{link.title || "(제목 없음)"}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="admin-save-bar">
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={pending}>
          {pending ? "저장 중..." : "저장하기"}
        </button>
        {status && (
          <p className={status.type === "success" ? "admin-success" : "admin-error"}>
            {status.message}
          </p>
        )}
      </div>
    </main>
  );
}
