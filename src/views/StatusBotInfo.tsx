import * as React from "react";
import { Column, Card, Header, Row } from "../components";
import statusBotInfo1 from "../assets/img/statusBotInfo/1.png";
import statusBotInfo2 from "../assets/img/statusBotInfo/2.png";
import statusBotInfo3 from "../assets/img/statusBotInfo/3.png";
import statusBotInfo4 from "../assets/img/statusBotInfo/4.png";
import statusBotInfo5 from "../assets/img/statusBotInfo/5.png";
import statusBotInfo6 from "../assets/img/statusBotInfo/6.png";
import statusBotInfo7 from "../assets/img/statusBotInfo/7.png";
import statusBotInfo8 from "../assets/img/statusBotInfo/8.png";
import "../locales/config";
import { useTranslation } from "react-i18next";

export function StatusBotInfo() {
  const { t } = useTranslation();
  document.title = `${t("pageTitle.main")} | ${t("pageTitle.statusBotInfo")}`;

  return (
    <Row>
      <Column>
        <Header>
          <h2>{t("statusBotInfo.main")}</h2>
        </Header>
        <Card>
          <h4 style={{ margin: 0 }}>{t("statusBotInfo.0")}</h4>
          <h5 style={{ paddingTop: ".5rem" }}>
            {t("statusBotInfo.1")}
            <a
              href="https://discord.com/developers/applications"
              target="_blank"
              rel="noopener noreferrer"
            >
              discord.com/developers/applications
            </a>
          </h5>
          <img
            alt={t("imageAlts.tutorial")}
            style={{ maxWidth: "20rem" }}
            src={statusBotInfo1}
          />
          <h5 style={{ paddingTop: ".5rem" }}>{t("statusBotInfo.2")}</h5>
          <img
            alt={t("imageAlts.tutorial")}
            style={{ maxWidth: "20rem" }}
            src={statusBotInfo2}
          />
          <h5 style={{ paddingTop: ".5rem" }}>{t("statusBotInfo.3")}</h5>
          <img
            alt={t("imageAlts.tutorial")}
            style={{ maxWidth: "20rem" }}
            src={statusBotInfo3}
          />
          <h5 style={{ paddingTop: ".5rem" }}>{t("statusBotInfo.4")}</h5>
          <div style={{ display: "flex" }}>
            <img
              alt={t("imageAlts.tutorial")}
              style={{ maxWidth: "20rem", marginRight: "1rem" }}
              src={statusBotInfo4}
            />
            <img
              alt={t("imageAlts.tutorial")}
              style={{ maxWidth: "20rem" }}
              src={statusBotInfo5}
            />
          </div>
          <h4 style={{ margin: 0, marginTop: "1.5rem" }}>
            {t("statusBotInfo.5")}
          </h4>
          <h5 style={{ paddingTop: ".5rem" }}>{t("statusBotInfo.6")}</h5>
          <img
            alt={t("imageAlts.tutorial")}
            style={{ maxWidth: "20rem" }}
            src={statusBotInfo6}
          />
          <h5 style={{ paddingTop: ".5rem" }}>{t("statusBotInfo.7")}</h5>
          <img
            alt={t("imageAlts.tutorial")}
            style={{ maxWidth: "20rem" }}
            src={statusBotInfo7}
          />
          <h5 style={{ paddingTop: ".5rem" }}>{t("statusBotInfo.8")}</h5>
          <img
            alt={t("imageAlts.tutorial")}
            style={{ maxWidth: "20rem" }}
            src={statusBotInfo8}
          />
          <h5 style={{ paddingTop: ".5rem" }}>{t("statusBotInfo.9")}</h5>
        </Card>
      </Column>
    </Row>
  );
}
