import * as React from "react";
import { useTranslation } from "react-i18next";
import * as styles from "./ChangeLanguage.module.css";

const LanguageSelector = (): React.ReactElement => {
  const { i18n } = useTranslation();
  const getLanguage = () => window.localStorage.i18nextLng;

  const changeLanguage = (event: { target: { value: string } }) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <select
      className={styles.selector}
      value={getLanguage()}
      onChange={changeLanguage}
    >
      <option value="en-US">English</option>
      <option value="zh-CN">简体中文</option>
      <option value="tr-TR">Türkçe</option>
      <option value="he-IL">עִברִית</option>
      <option value="el-GR">Ελληνικα</option>
      <option value="nl-NL">Nederlands</option>
      <option value="de-DE">Deutsch</option>
      <option value="fr_FR">Française</option>
    </select>
  );
};

export default LanguageSelector;
