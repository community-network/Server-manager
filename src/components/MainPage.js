    import React from "react";
import { useQuery } from 'react-query';
import styles from "./MainPage.module.css";
import { OperationsApi } from "../api";
import '../locales/config';
import { useTranslation } from 'react-i18next';

function ListItem(props) {
    return (
        <div className={styles.ListItem}>
            <h2>{props.header}</h2>
            <p>{props.children}</p>
        </div>
    );
}

function LoginButton() {
    const { t } = useTranslation();
    return (
        <a className={styles.LoginButton} href={OperationsApi.constructApiUrl("login")}>{t("mainPage.login")}</a>
    );
}

export function MainPageComponent(props) {
    const { t } = useTranslation();
    const { isError, data: stats, isLoading } = useQuery('managerStats', () => fetch("https://api.gametools.network/manager/info/").then(r=>r.json()));
    return (
        <div className={styles.MainPage}>
            <div className={styles.MainPageCard}>
                <div className={styles.titleBlock}>
                    <div className={styles.titleContent}>
                        <h1>{t("mainPage.main")}</h1>
                        <p>{t("mainPage.description")}</p>
                        {
                            (!isLoading && !isError) ? (
                                <p>{t("mainPage.statistics.main", {communities: stats.amounts.communities, servers: stats.amounts.servers})}</p>
                            ) : ""
                        }
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
                    <ListItem header={t("mainPage.featureList.0.heading")}>{t("mainPage.featureList.0.body")}</ListItem>
                    <ListItem header={t("mainPage.featureList.1.heading")}>{t("mainPage.featureList.1.body")}</ListItem>
                    <ListItem header={t("mainPage.featureList.2.heading")}>{t("mainPage.featureList.2.body")}</ListItem>
                    <ListItem header={t("mainPage.featureList.3.heading")}>{t("mainPage.featureList.3.body")}</ListItem>
                    <ListItem header={t("mainPage.featureList.4.heading")}>{t("mainPage.featureList.4.body")}</ListItem>
                    <ListItem header={t("mainPage.featureList.5.heading")}>{t("mainPage.featureList.5.body")}</ListItem>
                </div>
            </div>
        </div>
    );
}
