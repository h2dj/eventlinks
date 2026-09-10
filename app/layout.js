import "./globals.css";

export const metadata = {
  title: "공동체IT사회적협동조합 | 행사 링크 모음",
  description: "공동체IT사회적협동조합 행사에 필요한 온라인 링크 모음",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
