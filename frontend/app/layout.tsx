import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-PPT Architect",
  description: "AI 驱动的 PPT 自动生成工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
