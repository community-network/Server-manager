import React, { useState, useEffect } from "react";
import { useQueryClient, useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import styles from "./Styles.module.css";

import { ButtonRow, Button, TextInput, ButtonUrl, ButtonLink } from "../components";
import { OperationsApi } from "../api";



export function ServerSettings(props) {
    console.log(props)

    var allowedTo = false;
    if (props.server) allowedTo = true;

    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const [serverState, setServerState] = useState(null);
    const [canApply, setCanApply] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    
    const [restartStatus, setRestartStatus] = useState(null);
    const [restartErrorUpdating, setRestartError] = useState({ code: 0, message: "Unknown" });

    useEffect(() => {
        if (props.server) {
            const { serverName, serverAlias, discordBotToken, discordBotMinPlayerAmount, discordBotPrevReqCount, discordBotStartedAmount, discordBotOwnerId } = props.server;
            const originalServerState = { serverName, serverAlias, discordBotToken, discordBotMinPlayerAmount, discordBotPrevReqCount, discordBotStartedAmount, discordBotOwnerId };
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
    }, [props.server, serverState]);

    const changeSrerverState = (v) => {
        setServerState(s => ({ ...s, ...v }));
    }

    const removeServer = useMutation(
        variables => OperationsApi.removeServer(variables),
        {
            // When mutate is called:
            onMutate: async ({ sid }) => {
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('groupId' + sid)
                // Snapshot the previous value
                const previousGroup = queryClient.getQueryData('groupId' + sid)
                // Optimistically update to the new value
                queryClient.setQueryData('groupId', sid, old => {
                    if (old) {
                        old.data[0].servers = old.data[0].servers.filter(server => server.id !== sid);
                    }
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousGroup, sid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                queryClient.setQueryData('groupId' + context.sid, context.previousGroup)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('groupId' + context.sid)
            },
        }
    );

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
                queryClient.invalidateQueries('server' + props.sid);
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
                queryClient.invalidateQueries('server' + props.sid);
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
                    {t("serverBotStatus.running", {worker: props.server.botInfo.serviceName})}
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
                callback={(e) => changeSrerverState({ serverName: e.target.value })}
                defaultValue={getServerValue("serverName")}
                name={t("server.settings.name")}
            />

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.aliasDescription")}</h5>

            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeSrerverState({ serverAlias: e.target.value })}
                defaultValue={getServerValue("serverAlias")}
                name={t("server.settings.alias")}
            />

            <ButtonRow>
                <ButtonLink style={{ color: "#FF7575"}} name={t("server.danger.delete")} to={`/server/${props.sid}/delete/`} disabled={!allowedTo} />
            </ButtonRow>

            <span className={styles.serverBot}>{t("server.settings.discordBot.main")} {server_status} </span>
            <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.tokenDesc")}</h5>
            <ButtonRow>
                <TextInput
                    style={{ marginLeft: "6px" }}
                    disabled={!allowedTo}
                    callback={(e) => changeSrerverState({ discordBotToken: e.target.value })}
                    defaultValue={getServerValue("discordBotToken")}
                    name={t("server.settings.discordBot.token")}
                />
                <ButtonUrl href={`/cookieinfo`} name={t("statusBotInfo.link")} />
            </ButtonRow>

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.channelDesc")}</h5>
            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeSrerverState({ discordBotChannel: e.target.value })}
                defaultValue={getServerValue("discordBotChannel")}
                name={t("server.settings.discordBot.channel")}
            />
            
            <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.minPlayerAmountDesc")}</h5>
            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeSrerverState({ discordBotMinPlayerAmount: e.target.value })}
                defaultValue={getServerValue("discordBotMinPlayerAmount")}
                name={t("server.settings.discordBot.minPlayerAmount")}
            />

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.prevReqCountDesc")}</h5>
            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeSrerverState({ discordBotPrevReqCount: e.target.value })}
                defaultValue={getServerValue("discordBotPrevReqCount")}
                name={t("server.settings.discordBot.prevReqCount")}
            />

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.startedAmountDesc")}</h5>
            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeSrerverState({ discordBotStartedAmount: e.target.value })}
                defaultValue={getServerValue("discordBotStartedAmount")}
                name={t("server.settings.discordBot.startedAmount")}
            />

            {props.server? (
                <>
                    {props.server.game === "bfv"? (
                        <>
                            <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.ownerIdDesc")}</h5>
                            <TextInput
                                disabled={!allowedTo}
                                callback={(e) => changeSrerverState({ discordBotOwnerId: e.target.value })}
                                defaultValue={getServerValue("discordBotOwnerId")}
                                name={t("server.settings.discordBot.ownerId")}
                            />
                        </>
                    ) : (<></>)}

                    <h5 style={{ marginTop: "8px" }}>{t("server.settings.discordBot.restartWorkerDesc")}</h5>
                    <ButtonRow>
                        <Button name={t("server.settings.discordBot.restartWorker")} disabled={props.server.botInfo.state === "noService"} callback={
                            _ => restartWorker.mutate()
                        } status={restartStatus} />
                        <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (restartStatus === false) ? 1 : 0 }}>Error {restartErrorUpdating.code}: {restartErrorUpdating.message}</h5>
                    </ButtonRow>
                </>
            ) : (<></>)}
            {
                (props.server && canApply) ? (
                    <ButtonRow>
                        <Button name={t("apply")} disabled={!allowedTo || applyStatus !== null} callback={
                            _ => editServerSettings.mutate(
                                serverState
                            )
                        } status={applyStatus} />
                        <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (applyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
                    </ButtonRow>
                ) : ""
            }
        </>
    );
}

