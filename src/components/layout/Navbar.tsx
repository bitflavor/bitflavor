"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Show, UserButton } from "@clerk/nextjs";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import WalletConnectButton from "../web3/WalletConnectButton";

// 全站导航栏：移动端优先，含语言切换、登录/账户入口与钱包连接占位
export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: t("home") },
    { href: "/#continents", label: t("cuisines") },
    { href: "/membership", label: t("membership") },
    { href: "/contributors", label: t("contributors") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink-900">
          <span className="text-2xl" aria-hidden>🍜</span>
          <span>
            BitFlavor
            <span className="ml-1 hidden text-sm font-normal text-ink-400 sm:inline">
              世界美食图谱
            </span>
          </span>
        </Link>

        {/* 桌面端导航链接 */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                isActive(link.href)
                  ? "bg-brand-50 font-medium text-brand-700"
                  : "text-ink-600 hover:text-brand-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 右侧操作区 */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/search"
            aria-label={t("searchPlaceholder")}
            className="rounded-full p-2 text-ink-500 transition hover:text-brand-600"
          >
            🔍
          </Link>
          <Link
            href="/favorites"
            aria-label={t("favorites")}
            className="rounded-full p-2 text-ink-500 transition hover:text-brand-600"
          >
            ❤️
          </Link>
          <LanguageSwitcher />
          {/* 未登录：登录按钮；已登录：账户入口 + 用户头像菜单（Clerk Core 3 Show API） */}
          <Show when="signed-out">
            <Link
              href="/login"
              className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              {t("login")}
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/account"
              className={`rounded-full px-3 py-1.5 text-sm transition ${
                pathname.startsWith("/account")
                  ? "bg-brand-50 font-medium text-brand-700"
                  : "text-ink-600 hover:text-brand-600"
              }`}
            >
              {t("account")}
            </Link>
            <UserButton
              userProfileMode="navigation"
              userProfileUrl={`/${locale}/account/profile`}
            />
          </Show>
          <WalletConnectButton />
        </div>

        {/* 移动端菜单按钮 */}
        <button
          type="button"
          aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-lg p-2 text-2xl lg:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* 移动端展开菜单 */}
      {menuOpen && (
        <nav className="border-t border-ink-100 bg-white px-4 py-3 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-ink-700 transition hover:bg-brand-50"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
            <Link href="/search" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2">
              🔍 {t("searchPlaceholder")}
            </Link>
            <Link href="/favorites" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2">
              ❤️ {t("favorites")}
            </Link>
            <Show when="signed-out">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-full bg-brand-500 px-4 py-2 text-sm font-medium text-white"
              >
                {t("login")}
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/account" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2">
                👤 {t("account")}
              </Link>
              <UserButton
                userProfileMode="navigation"
                userProfileUrl={`/${locale}/account/profile`}
              />
            </Show>
            <LanguageSwitcher />
            <WalletConnectButton />
          </div>
        </nav>
      )}
    </header>
  );
}
