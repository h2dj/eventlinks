// LINKS 데이터(js/links-data.js)를 기반으로 링크 버튼을 렌더링합니다.
(function () {
  const container = document.getElementById("links");

  if (!container || typeof LINKS === "undefined" || !Array.isArray(LINKS)) return;

  LINKS.forEach((link) => {
    const a = document.createElement("a");
    a.className = "link-btn";
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    if (link.icon) {
      const iconSpan = document.createElement("span");
      iconSpan.className = "link-icon";
      iconSpan.setAttribute("aria-hidden", "true");
      iconSpan.textContent = link.icon;
      a.appendChild(iconSpan);
    }

    const labelSpan = document.createElement("span");
    labelSpan.className = "link-label";
    labelSpan.textContent = link.title;
    a.appendChild(labelSpan);

    container.appendChild(a);
  });

  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
