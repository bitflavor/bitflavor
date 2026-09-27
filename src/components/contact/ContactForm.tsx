"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// 联系表单（演示版：不接后端，提交后仅显示确认状态）
// TODO(backend): 接入邮件服务 / 工单系统后替换 onSubmit 逻辑
export default function ContactForm() {
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="text-4xl" aria-hidden>✅</div>
        <p className="mt-2 text-sm text-green-700">{t("formNote")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-4 rounded-2xl border border-ink-100 bg-white p-6"
    >
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink-700">
          {t("formName")}
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-lg border border-ink-200 px-3 py-2 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-700">
          {t("formEmail")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-ink-200 px-3 py-2 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink-700">
          {t("formMessage")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-lg border border-ink-200 px-3 py-2 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-brand-500 py-2.5 font-semibold text-white transition hover:bg-brand-600"
      >
        {t("formSubmit")}
      </button>
      <p className="text-center text-xs text-ink-400">{t("formNote")}</p>
    </form>
  );
}
