import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';

import { useModal } from "../components/Card";

import styles from "./ActionLogs.module.css";

import { OperationsApi } from "../api";

import '../locales/config';


import { PlayerStatsModal } from "./Modals";


export function LogList(props) {
    const { t } = useTranslation();
    
    const sid = props.sid;
    const { isError, data: logList, error } = useQuery(['serverLogList' + sid], () => OperationsApi.getServerLogs({ sid }));
    const [isShown, setIsShown] = useState(false);
    const showActionLogs = _=> {
        setIsShown(!isShown);
    };

    if (isError) {
        return `Error ${error.code}: {error.message}`
    }

    if (logList) {
        logList.logs.sort((a, b) => (
            Date.parse(b.timeStamp) - Date.parse(a.timeStamp)
        ));
    }

    return (
        <div className={styles.ActionLogs}>
            <div className={styles.logTitle}>
                <h5 className={styles.showLogs} onClick={showActionLogs}>
                    {t("server.console.logs")}
                    <MenuArrowIcon down={isShown} />
                </h5> 
                <span value="log-density" className={styles.logDensity}>
                    {
                        (logList) ? t("server.console.amount", {amount: logList.logs.length}) : ""
                    }
                </span>
            </div>
            {(isShown) ? <LogListing logList={logList} /> : ""}
        </div>
    );
}

function LogListing({ logList }) {
    return (
        <div className={styles.logListing}>
            {
                (logList) ? logList.logs.map(
                    (log, i) => (<LogRow log={log} key={i} />)
                ) : Array.from({ length: 8 }, (_, id) => ({ id })).map(
                    (_, i) => (<EmptyLogRow key={i} />)
                )
            }
        </div>
    );
}

function MenuArrowIcon({ down }) {
    return (
        <svg style={{ transform: down ? "rotateZ(180deg)" : "" }} className={styles.MenuArrowIcon} viewBox="0 0 24 24">
            <path fill="currentColor" d="M7,10L12,15L17,10H7Z" />
        </svg>
    );
}

function LogRow(props) {
    const { t } = useTranslation();
    const modal = useModal();
    const log = props.log;
    const action = (() => {
        switch (log.action) {
            case "addServerBan":
                return t("server.logs.reasons.addServerBan");
            case "kickPlayer":
                return t("server.logs.reasons.kickPlayer");
            case "removeServerBan":
                return t("server.logs.reasons.removeServerBan");
            case "addServerVip":
                return t("server.logs.reasons.addServerVip");
            case "movePlayer":
                return t("server.logs.reasons.movePlayer");
            case "removeServerVip":
                return t("server.logs.reasons.removeServerVip");
            default:
                return t("server.logs.reasons.magic");
        }
    })();

    var datetime = new Date(log.timeStamp);
    if (log.action === "autokick-ping") {
        return (
            <div className={styles.logRow}>
                <svg className={styles.logIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19.5,5.5V18.5H17.5V5.5H19.5M12.5,10.5V18.5H10.5V10.5H12.5M21,4H16V20H21V4M14,9H9V20H14V9M7,14H2V20H7V14Z" />
                </svg>
                <span className={styles.logAdmin}>{t("server.logs.types.pingChecker")}</span>
                <span className={styles.logAction}>{t("server.logs.reasons.kickPlayer")}</span>
                <span className={styles.logPlayer} onClick={_=>modal.show(<PlayerStatsModal player={log.toPlayer} />)}>{log.toPlayer}</span>
                <span className={styles.logAction}>{log.reason}</span>
                <span className={styles.logReasonDetailed}></span>
                <span className={styles.logTime}>{t("shortDateTime", {date: datetime})}</span>
            </div>
        );
    }

    if (log.action === "autokick-globalBans") {
        return (
            <div className={styles.logRow}>
                <svg className={styles.logIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z" />
                </svg>
                <span className={styles.logAdmin}>{t("server.logs.types.vBan")}</span>
                <span className={styles.logAction}>{t("server.logs.reasons.kickPlayer")}</span>
                <span className={styles.logPlayer} onClick={_=>modal.show(<PlayerStatsModal player={log.toPlayer} />)}>{log.toPlayer}</span>
                <span className={styles.logReason}>{t("server.logs.reason")}</span>
                <span className={styles.logReasonDetailed}>{log.reason}</span>
                <span className={styles.logTime}>{t("shortDateTime", {date: datetime})}</span>
            </div>
        );
    }

    if (log.action === "autokick-bfban") {
        return (
            <div className={styles.logRow}>
                <svg className={styles.logIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z" />
                </svg>
                <span className={styles.logAdmin}>{t("server.logs.types.bfban")}</span>
                <span className={styles.logAction}>{t("server.logs.reasons.kickPlayer")}</span>
                <span className={styles.logPlayer} onClick={_=>modal.show(<PlayerStatsModal player={log.toPlayer} />)}>{log.toPlayer}</span>
                <span className={styles.logReason}>{t("server.logs.reason")}</span>
                <span className={styles.logReasonDetailed}>{log.reason}</span>
                <span className={styles.logTime}>{t("shortDateTime", {date: datetime})}</span>
            </div>
        );
    }

    if (action === "moved" && log.toPlayer === "server") {
        return (
            <div className={styles.logRow}>
                <svg className={styles.logIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M15,19L9,16.89V5L15,7.11M20.5,3C20.44,3 20.39,3 20.34,3L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21C3.55,21 3.61,21 3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3Z" />                </svg>
                <span className={styles.logAdmin}>{log.adminName}</span>
                <span className={styles.logAction}>{log.reason}</span>
                <span className={styles.logReasonDetailed}></span>
                <span className={styles.logTime}>{t("shortDateTime", {date: datetime})}</span>
            </div>
        );
    }
    return (
        <div className={styles.logRow}>
            <svg className={styles.logIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
            </svg>
            <span className={styles.logAdmin}>{log.adminName}</span>
            <span className={styles.logAction}>{action}</span>
            <span className={styles.logPlayer} onClick={_=>modal.show(<PlayerStatsModal player={log.toPlayer} />)}>{log.toPlayer}</span>
            <span className={styles.logReason}>{
                ((log.reason === "") ? t("server.logs.noReason") : t("server.logs.reason"))
            }</span>
            <span className={styles.logReasonDetailed}>{log.reason}</span>
            <span className={styles.logTime}>{t("shortDateTime", {date: datetime})}</span>
        </div>
    );
}


function EmptyLogRow() {
    return (
        <div className={styles.logRow}></div>
    );
}
