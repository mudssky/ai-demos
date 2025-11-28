import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  let currentLocale = locale as string | undefined;

  if (
    !currentLocale ||
    !routing.locales.includes(currentLocale as (typeof routing.locales)[number])
  ) {
    currentLocale = routing.defaultLocale;
  }

  return {
    locale: currentLocale,
    messages: (await import(`../../messages/${currentLocale}.json`)).default,
  };
});
