import { getRequestConfig } from "next-intl/server";
import { isValidLocale, routing } from "./routing";

// 每次服务端请求时解析 locale 并加载对应翻译文件
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isValidLocale(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
