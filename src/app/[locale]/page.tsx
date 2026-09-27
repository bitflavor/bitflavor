import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/home/Hero";
import ContinentGrid from "@/components/home/ContinentGrid";
import FeaturedRecipes from "@/components/home/FeaturedRecipes";
import MembershipTeaser from "@/components/home/MembershipTeaser";

// 首页：首屏 + 大洲入口 + 热门菜谱 + 会员权益
// SEO 标题使用 layout 中的默认 title（metadata.defaultTitle）
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // 启用静态渲染
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <ContinentGrid />
      <FeaturedRecipes />
      <MembershipTeaser />
    </>
  );
}
