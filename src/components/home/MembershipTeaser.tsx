import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// 首页会员权益介绍区
export default function MembershipTeaser() {
  const t = useTranslations("home");

  const benefits = [
    { emoji: "🔓", title: t("benefit1Title"), desc: t("benefit1Desc") },
    { emoji: "📖", title: t("benefit2Title"), desc: t("benefit2Desc") },
    { emoji: "📸", title: t("benefit3Title"), desc: t("benefit3Desc") },
    { emoji: "🪪", title: t("benefit4Title"), desc: t("benefit4Desc") },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="rounded-3xl bg-ink-950 px-6 py-12 text-white sm:px-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t("membershipSectionTitle")}
          </h2>
          <p className="mt-2 text-ink-300">{t("membershipSectionSubtitle")}</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl bg-ink-900 p-6">
              <div className="text-3xl" aria-hidden>{b.emoji}</div>
              <h3 className="mt-3 font-bold">{b.title}</h3>
              <p className="mt-1 text-sm text-ink-300">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/membership"
            className="inline-block rounded-full bg-brand-500 px-8 py-3 font-semibold text-white transition hover:bg-brand-600"
          >
            {t("membershipCta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
