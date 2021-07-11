import i18n from 'i18next';
import translationEN from './languages/en-US.json';
import translationTR from './languages/tr-TR.json';
import translationGR from './languages/el-GR.json';
// import translationRU from './languages/ru-RU.json';
import translationCH from './languages/zh-CN.json';
import translationNL from './languages/nl-NL.json';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from "i18next-browser-languagedetector";
import { formatDistanceToNowStrict, format, formatDuration } from 'date-fns';
import { enUS, tr, el, zhCN, nl } from 'date-fns/locale';

const locales = { "en-US": enUS, "tr-TR": tr, "el-GR": el, "zh-CN": zhCN, "nl-NL": nl }

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
//   "ru-RU": {
//     translation: translationRU,
//   },
  "zh-CN": {
    translation: translationCH,
  },
  "nl-NL": {
    translation: translationNL,
  }
}

i18n.use(initReactI18next).use(LanguageDetector).init({
  resources,
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default,
    format: function (value, fmt, lng) {
      if (!value || value === '' || value === undefined || value === null) {
        return ''
      }

      // format = date|mask
      const [type, mask] = fmt.split('|')
      if (type === 'date') {
        return format(value, mask, {locale: locales[lng]})
      }
      if (type === "change") {
        return formatDistanceToNowStrict(value, mask, {locale: locales[lng]})
      }
      return value;
    }
  },
});

export const apiLanguage = {
  "zh-cn": "zh-tw",
}

export const getLanguage = () => {
  let language = window.localStorage.i18nextLng.toLowerCase()
  if (language in apiLanguage) {
      language = apiLanguage[language]
  }
  return language
}