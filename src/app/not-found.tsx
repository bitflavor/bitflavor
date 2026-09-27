"use client";

import Error from "next/error";

// 根级 404 页（next-intl 官方推荐写法）
// 注意：此页面渲染在 [locale] 布局之外，没有 locale 上下文，无法使用翻译文件。
// 实际用户访问的未知路径都会被 middleware 重定向到 /zh/* 或 /en/*，
// 由 src/app/[locale]/not-found.tsx 提供带翻译的 404 页面；
// 本页仅作为 /_next/* 等绕过中间件路径的兜底。
export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <Error statusCode={404} />
      </body>
    </html>
  );
}
