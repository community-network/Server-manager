import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { OperationsApi } from "../api/api";
import { GametoolsApi } from "../api/GametoolsApi";
import "../locales/config";
import * as styles from "./MainPage.module.css";

function ListItem(props: {
  header: string;
  children: React.ReactElement;
}): React.ReactElement {
  return (
    <div className={styles.ListItem}>
      <h2>{props.header}</h2>
      <p>{props.children}</p>
    </div>
  );
}

function LoginButton(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <a
      className={styles.LoginButton}
      href={OperationsApi.constructApiUrl("login", {})}
    >
      {t("mainPage.login")}
    </a>
  );
}

export function MainPageComponent(): React.ReactElement {
  const { t } = useTranslation();
  const {
    isLoading,
    isError,
    data: stats,
  } = useQuery({
    queryKey: ["managerStats"],
    queryFn: () => GametoolsApi.managerStats(),
  });
  return (
    <div className={styles.MainPage}>
      <main role="main" className={styles.MainPageCard}>
        <div className={styles.titleBlock}>
          <div className={styles.titleContent}>
            <h1>{t("mainPage.main")}</h1>
            <p>{t("mainPage.description")}</p>
            {!isLoading && !isError ? (
              <p>
                {t("mainPage.statistics.main", {
                  communities: stats.amounts.communities,
                  servers: stats.amounts.servers,
                })}
              </p>
            ) : (
              ""
            )}
            <LoginButton />
            {/* {!isLoading && !isError ? (
                            <>
                                <table className={styles.Statistics}>
                                    <tr>
                                        <th className={styles.TableHeader} colspan="2">
                                            {t("mainPage.statistics.weekly.main")}
                                        </th>
                                    </tr>
                                    <tr>
                                        <td>{stats.amounts.perWeek.bfbanKicks}</td>
                                        <td>{t("mainPage.statistics.weekly.bfbanKicks")}</td>
                                    </tr>
                                    <tr>
                                        <td>{stats.amounts.perWeek.globalbanKicks}</td>
                                        <td>{t("mainPage.statistics.weekly.globalbanKicks")}</td>
                                    </tr>
                                    <tr>
                                        <td>{stats.amounts.perWeek.pingKicks}</td>
                                        <td>{t("mainPage.statistics.weekly.pingKicks")}</td>
                                    </tr>
                                    <tr>
                                        <td>{stats.amounts.perWeek.movedPlayers}</td>
                                        <td>{t("mainPage.statistics.weekly.movedPlayers")}</td>
                                    </tr>
                                    <tr>
                                        <td>{stats.amounts.perWeek.kickedPlayers}</td>
                                        <td>{t("mainPage.statistics.weekly.kickedPlayers")}</td>
                                    </tr>
                                    <tr>
                                        <td>{stats.amounts.perWeek.bannedPlayers}</td>
                                        <td>{t("mainPage.statistics.weekly.bannedPlayers")}</td>
                                    </tr>
                                </table>
                            </>
                        ) : (<></>)
                        } */}
          </div>
        </div>
        <div className={styles.listing}>
          <h2>{t("mainPage.featureList.main")}</h2>
          <ListItem header={t("mainPage.featureList.0.heading")}>
            <>{t("mainPage.featureList.0.body")}</>
          </ListItem>
          <ListItem header={t("mainPage.featureList.1.heading")}>
            <>{t("mainPage.featureList.1.body")}</>
          </ListItem>
          <ListItem header={t("mainPage.featureList.2.heading")}>
            <>{t("mainPage.featureList.2.body")}</>
          </ListItem>
          <ListItem header={t("mainPage.featureList.3.heading")}>
            <>{t("mainPage.featureList.3.body")}</>
          </ListItem>
          <ListItem header={t("mainPage.featureList.4.heading")}>
            <>{t("mainPage.featureList.4.body")}</>
          </ListItem>
          <ListItem header={t("mainPage.featureList.5.heading")}>
            <>{t("mainPage.featureList.5.body")}</>
          </ListItem>
        </div>
      </main>
    </div>
  );
}
