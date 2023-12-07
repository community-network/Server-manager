import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { formatDistanceToNowStrict, format } from "date-fns";
import { enUS, tr, el, zhCN, nl, de, he, fr } from "date-fns/locale";
import resourcesToBackend from "i18next-resources-to-backend";

const locales = {
  "en-US": enUS,
  "tr-TR": tr,
  "he-IL": he,
  "el-GR": el,
  "zh-CN": zhCN,
  "nl-NL": nl,
  "de-DE": de,
  fr_FR: fr,
};

i18n
  .use(
    resourcesToBackend(
      (language: string) => import(`./languages/${language}.json`),
    ),
  )
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: "en-US",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default,
      format: function (value, fmt, lng) {
        if (!value || value === "" || value === undefined || value === null) {
          return "";
        }

        // format = date|mask
        const [type, mask] = fmt.split("|");
        if (type === "date") {
          return format(value, mask, { locale: locales[lng] });
        }
        if (type === "change") {
          return formatDistanceToNowStrict(value, { locale: locales[lng] });
        }
        if (type === "shortChange") {
          const customLocale: Locale = {
            code: lng,
            formatDistance: (token: string, count: number) => {
              return JSON.stringify({ token: token || "", count: count || 0 });
            },
            formatLong: null,
            formatRelative: null,
            localize: null,
            match: null,
            options: {
              weekStartsOn: 0,
              firstWeekContainsDate: 1,
            },
          };

          return formatDistanceToNowStrict(value, { locale: customLocale });
        }
        return value;
      },
    },
  });

export const apiLanguage = {
  "zh-cn": "zh-tw",
};

export const getLanguage = () => {
  let language = window.localStorage.i18nextLng.toLowerCase();
  if (language in apiLanguage) {
    language = apiLanguage[language];
  }
  return language;
};

export default i18n;
