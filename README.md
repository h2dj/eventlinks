# eventlinks

공동체IT사회적협동조합 행사용 링크 모음 페이지 (링크트리 스타일)

**Next.js(Vercel 배포) + Turso(libSQL) DB** 기반으로, 관리자 로그인 후 웹에서 바로 링크와
사이트 정보를 수정할 수 있습니다. 저장하면 코드 배포 없이 실제 사이트에 즉시 반영됩니다.

## 구성

- `app/page.js` — 공개 페이지 (2열 링크 버튼 그리드), DB에서 항상 최신 데이터를 읽어옵니다.
- `app/admin/` — 관리자 설정 페이지
  - `page.js` — 로그인 여부에 따라 로그인 폼 또는 편집기를 보여줍니다.
  - `LoginForm.js` — 비밀번호 로그인 폼
  - `AdminEditor.js` — 단체 이름/소개 문구, 링크 목록(추가·삭제·순서 변경) 편집 + 실시간 미리보기
  - `actions.js` — 로그인/로그아웃/저장을 처리하는 서버 액션 (인증 확인 포함)
- `lib/db.js` — Turso(libSQL) 접속 및 테이블 생성/조회/저장 로직 (`links`, `settings` 테이블)
- `lib/auth.js` — 비밀번호 확인, 세션 쿠키 서명/검증 (HMAC 기반)
- `app/globals.css` — 공개 페이지 + 관리자 페이지 공통 스타일 (라이트/다크 모드 자동 대응)

## 환경변수

`.env.example` 참고. 로컬 개발 시 `.env.local` 파일로 복사해서 값을 채우면 됩니다.

| 변수 | 설명 |
| --- | --- |
| `TURSO_DATABASE_URL` | Turso 데이터베이스 URL (`libsql://...`). **비워두면 로컬 SQLite 파일(`local.db`)을 자동 사용**하므로 로컬 개발에는 필수가 아닙니다. |
| `TURSO_AUTH_TOKEN` | Turso 인증 토큰. Vercel 배포 시에는 필수입니다. |
| `ADMIN_PASSWORD` | `/admin` 로그인 비밀번호. 원하는 값으로 직접 지정하세요. |
| `AUTH_SECRET` | 로그인 세션 쿠키 서명에 쓰는 비밀 키. `openssl rand -hex 32` 등으로 생성한 무작위 값 권장. |

## Turso 데이터베이스 만들기

```bash
# Turso CLI 설치 후
turso auth login
turso db create eventlinks
turso db show eventlinks --url        # → TURSO_DATABASE_URL
turso db tokens create eventlinks      # → TURSO_AUTH_TOKEN
```

테이블(`links`, `settings`)은 앱이 처음 DB에 접속할 때 자동으로 생성되고,
비어 있으면 기본 링크 5개로 자동 채워집니다. 별도 마이그레이션 명령은 필요 없습니다.

## Vercel 배포

1. 이 저장소를 Vercel 프로젝트로 Import (Next.js는 별도 설정 없이 바로 인식됩니다)
2. Vercel 프로젝트 **Settings → Environment Variables**에 위 4개 환경변수를 등록
3. Deploy

이후 `/admin`에서 로그인해 링크를 수정하면 저장 즉시 배포 없이 실제 사이트(`/`)에 반영됩니다.

## 관리자 설정 페이지 사용법

1. 사이트 하단의 **관리자 설정** 링크 또는 `/admin`으로 접속
2. `ADMIN_PASSWORD`로 로그인
3. 단체 이름/소개 문구, 링크 목록(아이콘·제목·URL) 수정 — 추가/삭제/순서 변경(↑↓) 가능
4. 오른쪽 미리보기로 실제 모습 확인 후 **저장하기** 클릭 → Turso DB에 즉시 저장되어 실제 사이트에 반영

## 로컬에서 실행하기

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD / AUTH_SECRET 값 채우기 (TURSO_* 는 비워둬도 됨)
npm run dev                  # http://localhost:3000
```

`TURSO_DATABASE_URL`을 설정하지 않으면 프로젝트 폴더에 `local.db` 파일이 자동 생성되어
로컬 SQLite로 동작합니다 (git에는 포함되지 않습니다).

```bash
npm run build && npm run start   # 프로덕션 빌드로 실행
npm run lint                     # 린트
```
