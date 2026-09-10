import { createClient } from "@libsql/client";

// 로컬 개발/테스트용 기본값: TURSO_DATABASE_URL이 없으면 로컬 SQLite 파일을 사용합니다.
// 실제 배포(Vercel)에서는 TURSO_DATABASE_URL / TURSO_AUTH_TOKEN 환경변수를 반드시 설정해야 합니다.
const url = process.env.TURSO_DATABASE_URL || "file:./local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

let client;
function getClient() {
  if (!client) {
    client = createClient(authToken ? { url, authToken } : { url });
  }
  return client;
}

const DEFAULT_SETTINGS = {
  org_name: "공동체IT사회적협동조합",
  tagline: "행사에 필요한 링크를 한 곳에 모았습니다",
};

const DEFAULT_LINKS = [
  { title: "공동체IT 홈페이지", url: "https://ictact.kr/", icon: "🏠" },
  { title: "디지털 역량진단", url: "https://www.ictact.kr/dctest", icon: "📊" },
  { title: "OX퀴즈", url: "https://www.ictact.kr/dctest/quiz", icon: "❓" },
  { title: "디지털활용유형검사", url: "https://www.ictact.kr/dctest/mini-test", icon: "🧭" },
  { title: "디지털 공론장", url: "https://forum2026.ictact.kr", icon: "🗣️" },
];

let schemaReady = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const db = getClient();
      await db.batch(
        [
          `CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            icon TEXT,
            position INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
          )`,
          `CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          )`,
        ],
        "write"
      );

      const { rows: linkCountRows } = await db.execute("SELECT COUNT(*) AS c FROM links");
      if (Number(linkCountRows[0].c) === 0) {
        await db.batch(
          DEFAULT_LINKS.map((l, i) => ({
            sql: "INSERT INTO links (title, url, icon, position) VALUES (?, ?, ?, ?)",
            args: [l.title, l.url, l.icon, i],
          })),
          "write"
        );
      }

      const { rows: settingsRows } = await db.execute("SELECT COUNT(*) AS c FROM settings");
      if (Number(settingsRows[0].c) === 0) {
        await db.batch(
          Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
            sql: "INSERT INTO settings (key, value) VALUES (?, ?)",
            args: [key, value],
          })),
          "write"
        );
      }
    })();
  }
  return schemaReady;
}

export async function getLinks() {
  await ensureSchema();
  const db = getClient();
  const { rows } = await db.execute(
    "SELECT id, title, url, icon FROM links ORDER BY position ASC, id ASC"
  );
  return rows.map((r) => ({
    id: Number(r.id),
    title: r.title,
    url: r.url,
    icon: r.icon || "",
  }));
}

export async function getSettings() {
  await ensureSchema();
  const db = getClient();
  const { rows } = await db.execute("SELECT key, value FROM settings");
  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

/**
 * 설정과 링크 목록 전체를 한 번에(원자적으로) 저장합니다.
 * links 는 [{ title, url, icon }, ...] 형태이며, 배열 순서가 곧 표시 순서(position)가 됩니다.
 */
export async function saveAll({ orgName, tagline, links }) {
  await ensureSchema();
  const db = getClient();

  const statements = [
    {
      sql: "INSERT INTO settings (key, value) VALUES ('org_name', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      args: [orgName],
    },
    {
      sql: "INSERT INTO settings (key, value) VALUES ('tagline', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      args: [tagline],
    },
    { sql: "DELETE FROM links", args: [] },
    ...links.map((l, i) => ({
      sql: "INSERT INTO links (title, url, icon, position) VALUES (?, ?, ?, ?)",
      args: [l.title, l.url, l.icon || "", i],
    })),
  ];

  await db.batch(statements, "write");
}
