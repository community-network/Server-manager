import React, { useState } from "react";
import { useMeasure } from 'react-use';
import { Link, useHistory } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import { GroupGlobalUnbanPlayer } from "./Modals";

import { OperationsApi } from "../api";
import '../locales/config';
import styles from "./Group.module.css";

import { TextInput, Button, ButtonRow } from "../components/Buttons";
import { Tag, useModal } from "../components/Card";
import { PlayerStatsModal } from "../Server/Modals";
import { DynamicSort } from "../components/Functions";

export function GroupRow(props) {
    const { t } = useTranslation();
    var group = props.group;

    const [groupListRef, { width }] = useMeasure();
    return (
        <Link ref={groupListRef} className={styles.GroupRow} to={"/group/" + group.id}>
            <span className={styles.GroupName}>{group.groupName}</span>
            {width < 350? <span></span>:
                <span className={styles.manageDev}>{t("dev.manage")}</span>}
        </Link>
    );
}

export function WorkerStatus(props) {
    const { t } = useTranslation();
    var workerStatus = props.worker;
    return (
        <div style={{marginBottom: "1rem"}}>
            {workerStatus ? (
                <span className={styles.serverBadgeOk}>
                    {t("group.status.worker.in", {time: t("change", {change: new Date(props.lastUpdate)})})} 
                </span>
            ) : ( 
                <span className={styles.serverBadgePending}>
                    {t("group.status.worker.queue")}
                </span>
            )}
        </div>
    )
}

export function ServerRow(props) {
    var server = props.server;
    const { t } = useTranslation();

    // If not yet setteled
    if (server.id === null) {
        return (
            <div className={styles.GroupRow}>
                <span className={styles.GroupName}>
                    {server.name}
                    <span className={styles.serverBadgePending}>
                        {t("serverStatus.pending")}
                    </span>
                </span>
                {props.button}
            </div>
        );
    }

    const serverStatus = (() => {
        switch (server.status) {
            case "noServer":
                return (
                    <span className={styles.serverBadgeErr}>
                        {t("serverStatus.noServer")}
                    </span>
                )
            case "noAdmin":
                return (
                    <span className={styles.serverBadgeErr}>
                        {t("serverStatus.noAdmin")}
                    </span>
                )
            case "pending":
                return (
                    <span className={styles.serverBadgePending}>
                        {t("serverStatus.pending")}
                    </span>
                )
            default:
                return (
                    <span className={styles.serverBadgeOk}>
                        {t("serverStatus.running")}
                    </span>
                )    
        }
    })();

    return (
        <div className={styles.GroupRow}>
            <Link className={styles.GroupName} to={"/server/" + server.id}>
                {server.name}
                {serverStatus}
            </Link>
            {props.button}
        </div>
    );
}

export function GroupAdminAccount(props) {

    var { remid, sid } = props.cookie;

    return (
        <div className={styles.AdminAccount}>
        </div>
    );

}

export function GameStatsAd(props) {
    const { t } = useTranslation();
    return (
        <a target="_blank" rel="noopener noreferrer" className={styles.gameStatsAd} href="https://discord.com/oauth2/authorize?client_id=714524944783900794&scope=bot&permissions=83968">
            <img src="/img/game-stats.png" />
            <span>{t("group.discord.gamestats")}</span>
        </a>
    );
}


export function VBanList(props) {
    const gid = props.gid;
    const { isError, data: banList, error } = useQuery('globalBanList' + gid, () => OperationsApi.getAutoBanList({ gid }));

    const queryClient = useQueryClient();

    const [sorting, setSorting] = useState("-timeStamp");
    const [searchWord, setSearchWord] = useState("");
    const { t } = useTranslation();

    const modal = useModal();
    const showGlobalUnban = e => {
        let playerInfo = e.target.dataset
        modal.show(
            <GroupGlobalUnbanPlayer 
                gid={gid} 
                eaid={playerInfo.name} 
                playerId={playerInfo.id}
            />
        );
    }

    if (!banList) {
        // TODO: add fake item list on loading
        return "Loading..";
    } else {
        banList.data = banList.data.sort(DynamicSort(sorting));
    }

    if (isError) {
        return `Error ${error.code}: {error.message}`
    }

    return (
        <div>
            <h5>
                {t("group.vban.description0")} <b>{t("group.vban.description1", {number: banList.data.length})}</b>.
            </h5>
            <ButtonRow>
                <TextInput name={t("search")} callback={(v) => setSearchWord(v.target.value)} />
                <Button name="Add ban" callback={_ => modal.show(<VbanBanPlayer gid={gid}/>)} />
            </ButtonRow>
            <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead style={{ position: "sticky", top: "0" }}>
                        <th onClick={_=>setSorting("playerName")}>{t("group.vban.table.playerName")}</th>
                        <th onClick={_=>setSorting("id")}>{t("group.vban.table.playerId")}</th>
                        <th onClick={_=>setSorting("reason")}>{t("group.vban.table.reason")}</th>
                        <th onClick={_=>setSorting("admin")}>{t("group.vban.table.admin")}</th>
                        <th onClick={_=>setSorting("-timeStamp")}>{t("group.vban.table.timestamp")}</th>
                        <th></th>
                    </thead>
                    <tbody>
                        {
                            banList.data.filter(p => p.playerName.toLowerCase().includes(searchWord.toLowerCase())).map(
                                (player, i) => (<GlobalBanRow player={player} key={i} callback={showGlobalUnban}/>)
                            )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}


function GlobalBanRow(props) {
    const modal = useModal();
    const player = props.player;
    const { t } = useTranslation();
    return (
        <tr className={styles.BanRow} onClick={e=>e.target.tagName==="TD"?modal.show(<PlayerStatsModal player={player.playerName} id={player.id} />):null}>
            <td>{player.playerName}</td>
            <td>{player.id}</td>
            <td>{((player.reason === "") ? t("group.vban.noReason") : player.reason)}</td>
            <td>{player.admin}</td>
            <td>{player.timeStamp!==undefined?t("dateTime", {date: new Date(player.timeStamp)}):"-"}</td>
            <th className={styles.globalUnban} data-name={player.playerName} data-id={player.id} onClick={props.callback}>
                {t("group.vban.unban")}
            </th>
        </tr>
    );
}

export function GroupLogs(props) {
    const gid = props.gid;
    const { isError, data: logList, error } = useQuery('groupogList' + gid, () => OperationsApi.getGroupLogs({ gid }));
    const { t } = useTranslation();

    if (isError) {
        return `Error ${error.code}: {error.message}`
    }

    if (logList) {
        logList.logs.sort((a, b) => (
            Date.parse(b.timeStamp) - Date.parse(a.timeStamp)
        ));
    }


    return (
        <div>
            <h5>{t("group.logs.description")}</h5>
            <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
                {
                    (logList) ? logList.logs.map(
                        (log, i) => (<LogRow log={log} key={i} />)
                    ) : Array.from({ length: 8 }, (_, id) => ({ id })).map(
                        (_, i) => (<EmptyLogRow key={i} />)
                    )
            }
            </div>
        </div>
    );
}

function LogRow(props) {
    const { t } = useTranslation();
    const log = props.log;
    const modal = useModal();

    var datetime = new Date(log.timeStamp);
    if (log.userLog) {
        const action = (() => {
            switch (log.action) {
                case "add-autoban":
                    return t("group.logs.reasons.addVban");
                case "remove-autoban":
                    return t("group.logs.reasons.removeVban");
                case "editGroup":
                    return t("group.logs.reasons.editGroup");
                case "addUser":
                    return t("group.logs.reasons.addUser");
                case "addOwner":
                    return t("group.logs.reasons.addOwner");
                case "addGroup":
                    return t("group.logs.reasons.addGroup");
                case "removeOwner":
                    return t("group.logs.reasons.removeOwner");
                case "removeUser":
                    return t("group.logs.reasons.removeUser");
                default:
                    return t("group.logs.reasons.magic");
            }
        })();

        return (
            <div className={styles.logRow}>
                <span className={styles.logAdmin}>{log.adminName}</span>
                <span className={styles.logAdmin}>{action}</span>
                <span className={styles.logAdmin}>{log.toPlayer}</span>
                <span className={styles.logReason}>{t("server.logs.reason")}</span>
                <span className={styles.groupLogReason}>{
                    log.reason
                }</span>
                <span className={styles.logTime}>{t("dateTime", {date: datetime})}</span>
            </div>
        );
    } else {
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

        
        if (log.action === "autokick-ping") {
            return (
                <div className={styles.logRow}>
                    <span className={styles.logServer}>{log.serverName}: </span>
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
                    <span className={styles.logServer}>{log.serverName}: </span>
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
                    <span className={styles.logServer}>{log.serverName}: </span>
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
                    <span className={styles.logServer}>{log.serverName}: </span>
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
                <span className={styles.logServer}>{log.serverName}: </span>
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
}

function EmptyLogRow() {
    return (
        <div className={styles.logRow}></div>
    );
}


function VbanBanPlayer(props) {
    const modal = useModal();
    var { gid } = props;
    const { t } = useTranslation();

    const history = useHistory();
    const [playerName, setPlayerName] = useState("");
    const [reason, setReason] = useState("");

    var [banApplyStatus, setBanApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });

    const { isError: userGettingError, data: user } = useQuery('user', () => OperationsApi.user);

    const GlobalBanPlayer = useMutation(
        v => OperationsApi.globalBanPlayer(v),
        {
            onMutate: async () => {
                setBanApplyStatus(true)
            },
            onError: (error) => {
                setBanApplyStatus(false);
                setError(error);
                setTimeout(_ => setBanApplyStatus(null), 3000);
            },
            onSuccess: () => {
                setBanApplyStatus(null);
                modal.close();
            },
        }
    );

    const isDisabled =
        reason === "" ||
        banApplyStatus !== null ||
        userGettingError || !user || gid == null;

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>{t("server.vBanMenu.playerNameDescription")} </h2>
            <TextInput value={playerName} name={t("server.vBanMenu.playerName")} callback={(e) => setPlayerName(e.target.value)} />
            <h5 style={{maxWidth: "300px"}} >{t("server.vBanMenu.reasonDescription")}</h5>
            <TextInput value={reason} name={t("server.vBanMenu.reason")} callback={(e) => setReason(e.target.value)} />
            <ButtonRow>
                <Button
                    name={t("server.vBanMenu.confirm")}
                    style={{ maxWidth: "144px" }}
                    disabled={isDisabled}
                    callback={() => GlobalBanPlayer.mutate({ gid, reason, name: playerName, playerId: undefined })}
                    status={banApplyStatus} />
                <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (banApplyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
            </ButtonRow>
        </>
    );
}