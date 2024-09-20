import * as React from "react";
import { useTranslation } from "react-i18next";
import cookieInfo1 from "../assets/img/cookieInfo/c1.png?format=webp&useResponsiveLoader=true";
import cookieInfo2 from "../assets/img/cookieInfo/c2.png?format=webp&useResponsiveLoader=true";
import cookieInfo3 from "../assets/img/cookieInfo/c3.png?format=webp&useResponsiveLoader=true";
import cookieInfo4 from "../assets/img/cookieInfo/c4.png?format=webp&useResponsiveLoader=true";
import { ButtonUrl, Card, Column, Header, Row } from "../components";
import "../locales/config";
React.version;

export default function CookieInfo() {
  const { t } = useTranslation();
  document.title = `${t("pageTitle.main")} | ${t("pageTitle.cookieInfo")}`;
  const getLanguage = () => window.localStorage.i18nextLng;

  return (
    <Row>
      <Column>
        <Header>
          <h2>{t("cookieInfoV2.main")}</h2>
        </Header>
        <Card>
          {getLanguage() === "zh-CN" && (
            <ButtonUrl
              href="https://youtu.be/Znd1YjmXqO8"
              name={t("cookieInfo.video")}
            />
          )}
          <h5 style={{ paddingTop: ".5rem" }}>
            {t("cookieInfoV2.0")}
            <a
              href="https://addons.mozilla.org/en-US/firefox/addon/cookie-quick-manager/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://addons.mozilla.org/en-US/firefox/addon/cookie-quick-manager/
            </a>
          </h5>
          <h5 style={{ paddingTop: ".5rem" }}>
            {t("cookieInfoV2.1")}
            <a
              href="https://www.ea.com/login"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.ea.com/login
            </a>
            {t("cookieInfoV2.2")}
          </h5>
          <h5 style={{ paddingTop: ".5rem" }}>{t("cookieInfoV2.3")}</h5>
          <h5 style={{ paddingTop: ".5rem" }}>{t("cookieInfoV2.4")}</h5>
          <div className="align">
            <img
              alt={t("imageAlts.tutorial")}
              style={{ maxWidth: "20rem", margin: ".5rem" }}
              src={cookieInfo1.src}
            />
            <img
              alt={t("imageAlts.tutorial")}
              style={{ maxWidth: "20rem", margin: ".5rem" }}
              src={cookieInfo2.src}
            />
          </div>
          <h5 style={{ paddingTop: "1.5rem" }}>{t("cookieInfoV2.5")}</h5>
          <img
            alt={t("imageAlts.tutorial")}
            style={{ maxWidth: "20rem", margin: ".5rem" }}
            src={cookieInfo3.src}
          />
          <h5 style={{ paddingTop: "1.5rem" }}>
            {t("cookieInfoV2.6")}
            <br />
            {t("cookieInfoV2.7")}
            <br />
            {t("cookieInfoV2.8")}
          </h5>
          <img
            alt={t("imageAlts.tutorial")}
            style={{ maxWidth: "20rem", margin: ".5rem" }}
            src={cookieInfo4.src}
          />
        </Card>
      </Column>
    </Row>
  );
}
