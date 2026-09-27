import { notFound } from "next/navigation";

// 捕获 [locale] 段下所有未匹配路径（如 /zh/some-unknown-page），
// 触发同目录的 not-found.tsx，从而在本地化布局中渲染带翻译的 404 页面。
// （locale 前缀之外的路径仍由根级 src/app/not-found.tsx 兜底）
export default function CatchAllPage() {
  notFound();
}
