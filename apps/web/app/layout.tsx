import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodingMaster",
  description: "어떤 사고 단계에서 막히는지 찾아주는 코딩 테스트 연습 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
