import i18n from "i18next";
import * as translationEN from "./languages/en-US.json";
import * as translationTR from "./languages/tr-TR.json";
import * as translationGR from "./languages/el-GR.json";
// import translationRU from './languages/ru-RU.json';
import * as translationCH from "./languages/zh-CN.json";
import * as translationNL from "./languages/nl-NL.json";
import * as translationDE from "./languages/de.json";
import * as translationHE from "./languages/he.json";
import { initReactI18next, useTranslation } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { formatDistanceToNowStrict, format } from "date-fns";
import { enUS, tr, el, zhCN, nl, de, he } from "date-fns/locale";

const locales = {
  "en-US": enUS,
  "tr-TR": tr,
  "he-IL": he,
  "el-GR": el,
  "zh-CN": zhCN,
  "nl-NL": nl,
  "de-DE": de,
};

const formatDistanceLocale = {
  xSeconds: {
    one: "1 sec",
    other: "{{count}} sec",
  },
  xMinutes: {
    one: "1 min",
    other: "{{count}} mins",
  },
  xHours: {
    one: "1 hour",
    other: "{{count}} hours",
  },
  xDays: {
    one: "1 day",
    other: "{{count}} days",
  },
  xWeeks: {
    one: "1 week",
    other: "{{count}} weeks",
  },
  xMonths: {
    one: "1 month",
    other: "{{count}} months",
  },
  xYears: {
    one: "1 year",
    other: "{{count}} years",
  },
};
const formatDistance = function formatDistance(
  token: string,
  count: number,
  options: {
    comparison: number;
    addSuffix: boolean;
    locale: Locale;
  },
) {
  let t = resources[options?.locale?.code]?.translation;
  if (t?.shortTimeItems == undefined) {
    t = resources["en-US"]?.translation;
  }

  let result: string = t["shortTimeItems"][token]?.[
    count == 1 ? "one" : "other"
  ]?.replace("{{count}}", count.toString());
  if (!result) {
    t = resources["en-US"]?.translation;
    result = t["shortTimeItems"][token]?.[
      count == 1 ? "one" : "other"
    ]?.replace("{{count}}", count.toString());
  }

  return result;
};

export const resources = {
  "en-US": {
    translation: translationEN,
  },
  "tr-TR": {
    translation: translationTR,
  },
  "el-GR": {
    translation: translationGR,
  },
  "he-IL": {
    translation: translationHE,
  },
  //   "ru-RU": {
  //     translation: translationRU,
  //   },
  "zh-CN": {
    translation: translationCH,
  },
  "nl-NL": {
    translation: translationNL,
  },
  "de-DE": {
    translation: translationDE,
  },
};

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
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
            formatDistance: formatDistance,
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
