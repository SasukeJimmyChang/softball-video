import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 智慧教練 - 棒壘球姿勢分析",
  description: "AI 姿勢辨識輔助工具，投球/打擊各 18 項靜態 + 3 項時序分析",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
