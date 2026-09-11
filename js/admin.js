// 링크 편집기 로직: js/links-data.js 의 LINKS 를 초기값으로 사용하되,
// 이 페이지 자체는 브라우저(localStorage)에만 작업 내용을 저장합니다.
// 실제 사이트에 반영하려면 "파일 다운로드" 후 GitHub의 js/links-data.js 를 교체해야 합니다.
(function () {
  const STORAGE_KEY = "eventlinks-admin-draft";

  const rowsEl = document.getElementById("rows");
  const previewEl = document.getElementById("preview-links");
  const outputEl = document.getElementById("output");
  const copyFeedback = document.getElementById("copy-feedback");

  const defaultLinks =
    typeof LINKS !== "undefined" && Array.isArray(LINKS) ? LINKS : [];

  let state = loadDraft() ?? defaultLinks.map((l) => ({ ...l }));

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  function saveDraft() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage 를 쓸 수 없는 환경이면 조용히 무시 (편집 자체는 계속 가능)
    }
  }

  function render() {
    renderRows();
    renderPreview();
    renderOutput();
    saveDraft();
  }

  function renderRows() {
    rowsEl.innerHTML = "";
    state.forEach((link, i) => {
      const row = document.createElement("div");
      row.className = "row";

      row.appendChild(
        makeInput("field-icon", link.icon || "", "아이콘", (v) => {
          state[i].icon = v;
          render();
        })
      );
      row.appendChild(
        makeInput("field-title", link.title || "", "제목", (v) => {
          state[i].title = v;
          render();
        })
      );
      row.appendChild(
        makeInput("field-url", link.url || "", "https://...", (v) => {
          state[i].url = v;
          render();
        })
      );

      const actions = document.createElement("div");
      actions.className = "row-actions";

      const upBtn = makeIconBtn("↑", "위로 이동", i === 0, () => {
        [state[i - 1], state[i]] = [state[i], state[i - 1]];
        render();
      });
      const downBtn = makeIconBtn("↓", "아래로 이동", i === state.length - 1, () => {
        [state[i + 1], state[i]] = [state[i], state[i + 1]];
        render();
      });
      const delBtn = makeIconBtn("✕", "삭제", false, () => {
        state.splice(i, 1);
        render();
      });
      delBtn.classList.add("danger");

      actions.append(upBtn, downBtn, delBtn);
      row.appendChild(actions);

      rowsEl.appendChild(row);
    });
  }

  function makeInput(cls, value, placeholder, onInput) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = cls;
    input.value = value;
    input.placeholder = placeholder;
    input.addEventListener("input", (e) => onInput(e.target.value));
    return input;
  }

  function makeIconBtn(label, title, disabled, onClick) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "icon-btn";
    btn.textContent = label;
    btn.title = title;
    btn.setAttribute("aria-label", title);
    btn.disabled = disabled;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function renderPreview() {
    previewEl.innerHTML = "";
    state.forEach((link) => {
      const a = document.createElement("a");
      a.className = "link-btn";
      a.href = link.url || "#";
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      if (link.icon) {
        const iconSpan = document.createElement("span");
        iconSpan.className = "link-icon";
        iconSpan.textContent = link.icon;
        a.appendChild(iconSpan);
      }

      const labelSpan = document.createElement("span");
      labelSpan.className = "link-label";
      labelSpan.textContent = link.title || "(제목 없음)";
      a.appendChild(labelSpan);

      previewEl.appendChild(a);
    });
  }

  function renderOutput() {
    outputEl.value = buildFileContent(state);
  }

  function buildFileContent(links) {
    const entries = links
      .map((l) => {
        const parts = [`    title: ${jsString(l.title || "")},`, `    url: ${jsString(l.url || "")},`];
        if (l.icon) parts.push(`    icon: ${jsString(l.icon)},`);
        return `  {\n${parts.join("\n")}\n  }`;
      })
      .join(",\n");

    return `// 행사 링크 데이터
// 아래 배열의 title/url/icon 값만 수정하면 버튼 내용이 바뀝니다.
// 링크를 더 추가하고 싶으면 객체를 배열에 추가하기만 하면 자동으로 그리드에 배치됩니다.
// icon 은 이모지 하나를 넣으면 버튼 왼쪽에 표시됩니다 (선택 사항).
// (이 파일은 admin.html 링크 편집기에서 생성되었습니다.)

const LINKS = [
${entries}
];
`;
  }

  function jsString(str) {
    return JSON.stringify(str);
  }

  document.getElementById("add-row").addEventListener("click", () => {
    state.push({ title: "", url: "", icon: "" });
    render();
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (!confirm("현재 편집 중인 내용을 지우고 사이트에 적용된 링크로 되돌릴까요?")) return;
    state = defaultLinks.map((l) => ({ ...l }));
    render();
  });

  document.getElementById("copy-btn").addEventListener("click", async () => {
    const text = outputEl.value;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      outputEl.select();
      document.execCommand("copy");
    }
    copyFeedback.hidden = false;
    setTimeout(() => (copyFeedback.hidden = true), 2000);
  });

  document.getElementById("download-btn").addEventListener("click", () => {
    const blob = new Blob([outputEl.value], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "links-data.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  render();
})();
