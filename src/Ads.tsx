import { useLocalStorage } from "@uidotdev/usehooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import * as styles from "./locales/ChangeLanguage.module.css";

declare const window: { adsbygoogle; location: Location };

const AdsComponent = (props: {
  dataAdSlot: string;
  style?: React.CSSProperties;
}) => {
  const { dataAdSlot } = props;
  const style = props.style || { display: "block" };

  React.useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) { }
  }, []);

  const [value] = useLocalStorage("disable-ads", true);

  if (value) return <></>;

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-6546858755151450"
      data-ad-slot={dataAdSlot}
      // data-adtest="on"
      // data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export const AdsEnabled = () => {
  const [value] = useLocalStorage("disable-ads", true);
  return !value;
};

export const AdSwitch = (): JSX.Element => {
  const { t } = useTranslation();
  const [value, setValue] = useLocalStorage("disable-ads", true);

  return (
    <div className="adv-ad" style={{ display: "flex", paddingLeft: ".3rem" }}>
      <select
        className={styles.selector}
        value={value ? "on" : "off"}
        onChange={(e) => {
          setValue(e.target.value === "on");
        }}
      >
        <option value="off">{t("ads.enabled")}</option>
        <option value="on">{t("ads.disabled")}</option>
      </select>
    </div>
  );
};

export default AdsComponent;
