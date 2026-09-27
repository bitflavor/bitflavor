import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SignUp } from "@clerk/nextjs";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isValidLocale, routing } from "@/i18n/routing";

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: t("signupTitle"),
    description: t("signupDesc"),
    // 注册页不参与 SEO 收录
    robots: { index: false, follow: false },
  };
}

// 注册页：Clerk 托管 UI 组件（支持邮箱验证码 / 社交账号，后台可配置）
export default async function SignupPage({ params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <div className="mx-auto flex max-w-6xl justify-center px-4 py-14">
      <SignUp />
    </div>
  );
}
