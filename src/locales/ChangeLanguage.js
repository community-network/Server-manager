import { useTranslation } from 'react-i18next'
import styles from "./ChangeLanguage.module.css";

const LanguageSelector = () => {
    const { i18n } = useTranslation()
    const getLanguage = () => window.localStorage.i18nextLng
    
    const changeLanguage = (event) => {
      i18n.changeLanguage(event.target.value)
    }

    return (
        <select className={styles.selector} value={getLanguage()} onChange={changeLanguage}>
            <option value="en-US">English</option>
            <option value="zh-CN">简体中文</option>
            <option value="tr-TR">Türkçe</option>
        </select>
    )
}

export default LanguageSelector