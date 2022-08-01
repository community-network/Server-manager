import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import styles from "./Styles.module.css";

import { ButtonRow, Button, TextInput, ButtonUrl, ButtonLink } from "../components";
import { OperationsApi } from "../api";
import { bf1Maps, bf1Modes } from "../Globals";

export function IngameSettings(props) {
    var allowedTo = false;
    if (props.server && props.server.editPerms) allowedTo = true;
    const queryClient = useQueryClient();
    const [canApply, setCanApply] = useState(false);
    const [maps, setMaps] = useState([]);
    const [originalMaps, setOriginalMaps] = useState([]);
    const [cookie, setCookie] = useState("")
    const [cookieSid, setCookieSid] = useState("")
    const [cookieRemid, setCookieRemid] = useState("")
    const [applyStatus, setApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });

    const sid = props.sid;
    const { t } = useTranslation();
    const { isError, data: cookieInfo, error } = useQuery(['cookieInfo' + sid], () => OperationsApi.getCookieList({ sid }), { staleTime: 30000 });
    var cookies = (cookieInfo && cookieInfo.data && cookieInfo.data.length > 0) ? cookieInfo.data : null;

    const editOwnerSettings = useMutation(
        variables => OperationsApi.editOwnerSever(variables),
        {
            onMutate: async () => {
                setApplyStatus(true);
            },
            onSuccess: async () => {
                setApplyStatus(null);
            },
            onError: async (error) => {
                setApplyStatus(false);
                setError(error);
                setTimeout(_ => setApplyStatus(null), 2000);
            },
            onSettled: async () => {
                queryClient.invalidateQueries(['servers' + props.sid]);
            }
        }
    );

    // set initial
    useEffect(() => {
        if (props.game) {
            setMaps(JSON.parse(JSON.stringify(props.game.data[0].info.rotation)));
            setOriginalMaps(props.game.data[0].info.rotation.slice());
        }
    }, []);
    // set if cookies available
    useEffect(() => {
        if (cookies) {
            setCookie(cookies[0].id)
        }
    }, [cookies])
    // check if allowed to apply
    useEffect(() => {
        let newCanApply = false;
        for (var i in originalMaps) {
            newCanApply |= JSON.stringify(maps[i]) !== JSON.stringify(originalMaps[i]);
        }
        for (var m in maps) {
            newCanApply |= JSON.stringify(maps[i]) !== JSON.stringify(originalMaps[m]);
        }
        setCanApply(newCanApply);
    }, [maps, originalMaps]);

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>{t("server.ingameSettings.main")}</h2>
            <h5 style={{ marginTop: "8px" }}>{t("server.ingameSettings.rotation")}</h5>
            {maps.map((element, index) => {
                        return (
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                alignContent: "center",
                                flexWrap: "wrap"
                            }}>
                                <select disabled={!allowedTo} style={{ marginLeft: "0" }} onChange={e => {const current = [...maps]; current[index].mapname = e.target.value; setMaps(current)}} className={styles.SwitchGame}>
                                    {bf1Maps.map((name, index) => <option key={index} selected={element.mapname === name} value={name}>{name}</option>)}
                                </select>
                        
                                <select disabled={!allowedTo} style={{ marginLeft: "0" }} onChange={e => {const current = [...maps]; current[index].mode = e.target.value; setMaps(current)}} className={styles.SwitchGame}>
                                    {bf1Modes.map((name, index) => <option key={index} selected={element.mode === name} value={name}>{name}</option>)}
                                </select>
                        
                                <Button disabled={!allowedTo} style={{ marginLeft: "0" }} name={t("server.ingameSettings.removeMap")} callback={_ => {const current = [...maps]; current.splice(index, 1); setMaps(current)}} />
                            </div>
                        )
                    })
            }
            <ButtonRow>
                <Button disabled={!allowedTo} style={{ marginLeft: "0" }} name={t("server.ingameSettings.addMap")} callback={_ => setMaps(maps => [...maps, {mapname: bf1Maps[0], mode: bf1Modes[0]}])} />
            </ButtonRow>

            <h5 style={{ marginTop: "8px" }}>{t("server.ingameSettings.cookie")}</h5>
            {(!isError) ? (
                <ButtonRow>
                    {cookies ?
                        <select disabled={!allowedTo} style={{ marginLeft: "6px" }} className={styles.SwitchGame} onChange={e => setCookie(e.target.value)}>
                            <option value="">{t("cookie.accountType.default")}</option>
                            {cookies.map((key, index) => <option key={index} selected={cookie === key.id} value={key.id}>{key.name}</option>)}
                            <option value="add">{t("cookie.accountType.add")}</option>
                        </select>
                        : ""}
                </ButtonRow>
            ) : (
                <>{`Error ${error.code}: {error.message}`}</>
            )}
            {(cookie === "add") ? (
                <>
                    <h5 style={{ marginTop: "8px" }}>
                        {t("cookie.sidDescription")}<i>accounts.ea.com</i>
                    </h5>
                    <TextInput disabled={!allowedTo} name={t("cookie.sid")} autocomplete="off" callback={(e) => { setCookieSid(e.target.value) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        {t("cookie.remidDescription")}<i>accounts.ea.com</i>
                    </h5>
                    <TextInput disabled={!allowedTo} name={t("cookie.remid")} autocomplete="off" callback={(e) => { setCookieRemid(e.target.value) }} />
                </>
            ) : <></>}
            <ButtonRow>
                {
                    (props.server && canApply) ? (
                        <Button name={t("apply")} disabled={!allowedTo || applyStatus !== null} callback={
                            _ => editOwnerSettings.mutate(
                                {sid: cookieSid, remid: cookieRemid, cookieid: cookie, serverid: sid, maps: maps}
                            )
                        } status={applyStatus} />
                    ) : ""
                }
                <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (applyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
            </ButtonRow>
        </>
    )
}

export function ServerSettings(props) {
    const ownerIdGames = ["bfv", "bf2042"]

    const { sid, server } = props;
    const { t } = useTranslation();
    const { isError, data: cookieInfo, error } = useQuery(['cookieInfo' + sid], () => OperationsApi.getCookieList({ sid }), { staleTime: 30000 });
    var cookies = (cookieInfo && cookieInfo.data && cookieInfo.data.length > 0) ? cookieInfo.data : null;

    var allowedTo = false;
    if (server && server.editPerms) allowedTo = true;

    const queryClient = useQueryClient();

    const [serverState, setServerState] = useState(null);
    const [canApply, setCanApply] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });

    const [restartStatus, setRestartStatus] = useState(null);
    const [restartErrorUpdating, setRestartError] = useState({ code: 0, message: "Unknown" });

    useEffect(() => {
        if (server) {
            const { serverName, serverAlias, discordBotToken, discordBotMinPlayerAmount, discordBotPrevReqCount, discordBotStartedAmount, discordBotOwnerId, cookie } = server;
            const originalServerState = { serverName, serverAlias, discordBotToken, discordBotMinPlayerAmount, discordBotPrevReqCount, discordBotStartedAmount, discordBotOwnerId, cookie };
            if (serverState === null) {
                setServerState(originalServerState);
            } else {
                let newCanApply = false;
                for (var i in originalServerState) {
                    newCanApply |= serverState[i] !== originalServerState[i];
                }
                setCanApply(newCanApply);
            }

        }
    }, [server, serverState]);

    const changeServerState = (v) => {
        setServerState(s => ({ ...s, ...v }));
    }

    const editServerSettings = useMutation(
        variables => OperationsApi.editServer({ value: variables, sid: props.sid }),
        {
            onMutate: async () => {
                setApplyStatus(true);
            },
            onSuccess: async () => {
                setApplyStatus(null);
            },
            onError: async (error) => {
                setApplyStatus(false);
                setError(error);
                setTimeout(_ => setApplyStatus(null), 2000);
            },
            onSettled: async () => {
                queryClient.invalidateQueries(['server' + props.sid]);
            }
        }
    );

    const restartWorker = useMutation(
        _ => OperationsApi.restartWorker({ sid: props.sid }),
        {
            onMutate: async () => {
                setRestartStatus(true);
            },
            onSuccess: async () => {
                setRestartStatus(null);
            },
            onError: async (error) => {
                setRestartStatus(false);
                setRestartError(error);
                setTimeout(_ => setRestartStatus(null), 2000);
            },
            onSettled: async () => {
                queryClient.invalidateQueries(['server' + props.sid]);
            }
        }
    );

    const getServerValue = (key) => {
        if (props.server && key in props.server) {
            return props.server[key]
        }
        return "";
    };

    var server_status = (
        <span style={{ marginLeft: "8px" }} className={styles.serverBadgePending}>
            {t("serverBotStatus.pending")}
        </span>
    );

    if (props.server) {
        if (props.server.botInfo.state === "running") {
            server_status = (
                <span style={{ marginLeft: "8px" }} className={styles.serverBadgeOk}>
                    <span className={styles.liveUpdate}></span>
                    {t("serverBotStatus.running", { worker: props.server.botInfo.serviceName })}
                </span>
            )
        } else if (props.server.botInfo.state === "failed") {
            server_status = (
                <span style={{ marginLeft: "8px" }} className={styles.serverBadgeErr}>
                    {t("serverBotStatus.failed")}
                </span>
            )
        } else {
            server_status = (
                <span style={{ marginLeft: "8px" }} className={styles.serverBadgeErr}>
                    {t("serverBotStatus.noService")}
                </span>
            )
        }
    }

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>{t("server.settings.title")}</h2>

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.nameDescription")}</h5>

            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeServerState({ serverName: e.target.value })}
                defaultValue={getServerValue("serverName")}
                name={t("server.settings.name")}
            />

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.aliasDescription")}</h5>

            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeServerState({ serverAlias: e.target.value })}
                defaultValue={getServerValue("serverAlias")}
                name={t("server.settings.alias")}
            />

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.cookie")}</h5>
            {(!isError) ? (
                <ButtonRow>
                    {cookies ?
                        <select disabled={!allowedTo} style={{ marginLeft: "6px" }} className={styles.SwitchGame} onChange={e => changeServerState({ cookie: e.target.value })}>
                            <option value="">{t("cookie.accountType.default")}</option>
                            {cookies.map((key, index) => <option key={index} selected={getServerValue("cookie") === key.id} value={key.id}>{key.name}</option>)}
                        </select>
                        : ""}
                </ButtonRow>
            ) : (
                <>{`Error ${error.code}: {error.message}`}</>
            )}

            <span className={styles.serverBot}>{t("server.settings.discordBot.main")} {server_status} </span>
            <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.tokenDesc")}</h5>
            <ButtonRow>
                <TextInput
                    style={{ marginLeft: "6px" }}
                    disabled={!allowedTo}
                    callback={(e) => changeServerState({ discordBotToken: e.target.value })}
                    defaultValue={getServerValue("discordBotToken")}
                    name={t("server.settings.discordBot.token")}
                />
                <ButtonUrl href={`/statusbotinfo`} name={t("statusBotInfo.link")} />
            </ButtonRow>

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.channelDesc")}</h5>
            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeServerState({ discordBotChannel: e.target.value })}
                defaultValue={getServerValue("discordBotChannel")}
                name={t("server.settings.discordBot.channel")}
            />

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.minPlayerAmountDesc")}</h5>
            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeServerState({ discordBotMinPlayerAmount: e.target.value })}
                defaultValue={getServerValue("discordBotMinPlayerAmount")}
                name={t("server.settings.discordBot.minPlayerAmount")}
            />

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.prevReqCountDesc")}</h5>
            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeServerState({ discordBotPrevReqCount: e.target.value })}
                defaultValue={getServerValue("discordBotPrevReqCount")}
                name={t("server.settings.discordBot.prevReqCount")}
            />

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.startedAmountDesc")}</h5>
            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeServerState({ discordBotStartedAmount: e.target.value })}
                defaultValue={getServerValue("discordBotStartedAmount")}
                name={t("server.settings.discordBot.startedAmount")}
            />

            {props.server ? (
                <>
                    {ownerIdGames.includes(props.server.game) ? (
                        <>
                            <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.ownerIdDesc")}</h5>
                            <TextInput
                                disabled={!allowedTo}
                                callback={(e) => changeServerState({ discordBotOwnerId: e.target.value })}
                                defaultValue={getServerValue("discordBotOwnerId")}
                                name={t("server.settings.discordBot.ownerId")}
                            />
                        </>
                    ) : (<></>)}

                    <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.restartWorkerDesc")}</h5>
                    <ButtonRow>
                        <Button name={t("server.settings.discordBot.restartWorker")} disabled={!allowedTo || props.server.botInfo.state === "noService"} callback={
                            _ => restartWorker.mutate()
                        } status={restartStatus} />
                        <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (restartStatus === false) ? 1 : 0 }}>Error {restartErrorUpdating.code}: {restartErrorUpdating.message}</h5>
                    </ButtonRow>
                </>
            ) : (<></>)}
            <ButtonRow>
                <ButtonLink style={{ color: "#FF7575" }} name={t("server.danger.delete")} to={`/server/${props.sid}/delete/`} disabled={!allowedTo} />
                {
                    (props.server && canApply) ? (
                        <Button name={t("apply")} disabled={!allowedTo || applyStatus !== null} callback={
                            _ => editServerSettings.mutate(
                                serverState
                            )
                        } status={applyStatus} />
                    ) : ""
                }
                <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (applyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
            </ButtonRow>

        </>
    );
}

