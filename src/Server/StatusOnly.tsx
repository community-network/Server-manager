import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageContext } from "./ServerGlobalContext";
import { useParams } from "react-router-dom";

import { Column, Header, PageCard, Row } from "../components";

import "../locales/config";

import { ServerSettings } from "./Settings";
import { useServer } from "./Manager";

/**
 * Server page
 */
export function StatusOnlyServer(): React.ReactElement {
  const params = useParams();
  const { sid } = params;

  const { t } = useTranslation();

  const { data: server } = useServer(sid);

  const [tabsListing, setTabsListing] = React.useState("settings");

  const serverTabs = [
    {
      name: t("server.settings.main"),
      callback: () => setTabsListing("settings"),
    },
  ];

  const catTabs = {
    settings: <ServerSettings server={server} sid={sid} />,
  };

  return (
    <PageContext.Provider value={undefined}>
      <Row>
        <Column>
          <Header>
            <h2>{t("server.main")}</h2>
          </Header>
        </Column>
      </Row>
      <Row>
        <Column>
          <PageCard buttons={serverTabs}>{catTabs[tabsListing]}</PageCard>
        </Column>
      </Row>
    </PageContext.Provider>
  );
}
