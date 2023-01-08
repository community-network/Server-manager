import * as React from "react";
import { Column, Card, Header, Row, ButtonUrl } from "../components";
import "../locales/config";
import { useTranslation } from "react-i18next";

export function CookieInfo() {
  const { t } = useTranslation();
  const getLanguage = () => window.localStorage.i18nextLng;

  return (
    <Row>
      <Column>
        <Header>
          <h2>{t("cookieInfo.main")}</h2>
        </Header>
        <Card>
          {getLanguage() === "zh-CN" ? (
            <ButtonUrl
              href="https://youtu.be/Znd1YjmXqO8"
              name={t("cookieInfo.video")}
            />
          ) : (
            <></>
          )}
          <h5 style={{ paddingTop: ".5rem" }}>
            {t("cookieInfo.0")}
            <a
              href="https://www.ea.com/login"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.ea.com/login
            </a>
            {t("cookieInfo.1")}
          </h5>
          <h5 style={{ paddingTop: ".5rem" }}>{t("cookieInfo.2")}</h5>
          <h5 style={{ paddingTop: ".5rem" }}>{t("cookieInfo.3")}</h5>
          <img
            alt={t("imageAlts.tutorial")}
            style={{ maxWidth: "20rem" }}
            src="/img/cookieInfo/1.png"
          />
          <h5 style={{ paddingTop: "1.5rem" }}>{t("cookieInfo.4")}</h5>
          <img
            alt={t("imageAlts.tutorial")}
            style={{ maxWidth: "20rem" }}
            src="/img/cookieInfo/2.png"
          />
          <h5 style={{ paddingTop: "1.5rem" }}>{t("cookieInfo.5")}</h5>
          <img
            alt={t("imageAlts.tutorial")}
            style={{ maxWidth: "20rem" }}
            src="/img/cookieInfo/3.png"
          />
          <h5 style={{ paddingTop: "1.5rem" }}>
            {t("cookieInfo.6")}
            <br />
            {t("cookieInfo.7")}
          </h5>
        </Card>
      </Column>
    </Row>
  );
}
