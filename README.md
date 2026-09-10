# eventlinks

공동체IT사회적협동조합 행사용 링크 모음 페이지 (링크트리 스타일)

## 구성

- `index.html` — 페이지 구조
- `css/style.css` — 스타일 (2열 버튼 그리드, 라이트/다크 모드 자동 대응)
- `js/links-data.js` — 버튼에 표시할 링크 목록 (제목/URL/아이콘)
- `js/script.js` — `links-data.js`의 데이터를 읽어 버튼을 화면에 렌더링

## 링크 수정 방법

`js/links-data.js` 파일의 `LINKS` 배열만 수정하면 됩니다.

```js
{
  title: "행사 신청하기",   // 버튼에 표시할 이름
  url: "https://forms.gle/EXAMPLE", // 실제 링크 주소
  icon: "📝", // 이모지 (선택 사항)
}
```

- 배열 순서대로 2열 그리드에 배치됩니다.
- 항목을 추가하거나 삭제해도 자동으로 레이아웃이 조정됩니다 (기본 6개 구성).
- 현재 들어있는 URL은 예시(placeholder)이므로 실제 협동조합 링크로 교체해서 사용하세요.

## 로컬에서 미리보기

별도의 빌드 과정 없이 `index.html`을 브라우저로 열거나, 정적 파일 서버(GitHub Pages 등)에 그대로 올리면 됩니다.
