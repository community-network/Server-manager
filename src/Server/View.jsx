import React, { useState, useEffect } from "react";
import { useQueryClient, useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import { PageContext } from "./ServerGlobalContext";

import { OperationsApi } from "../api";

import { useHistory } from 'react-router-dom';
import { ServerRotation, ServerInfoHolder, BanList, VipList, AdminList, FireStarter, Spectator, Playerlogs, PlayTime } from "./Server";

import { Switch, Column, Header, ButtonRow, ButtonLink, Button, PageCard, Row, TextInput, Card } from "../components";

import '../locales/config';

import { ServerSettings } from "./Settings";
import { useServer, useGame } from "./Manager";

import Console from "./Console";

import { PlayerList } from "./PlayerList";
import { LogList } from "./ActionLogs";

/**
 * Server page
 */
export function Server(props) {

    let { sid } = props.match.params;

    const { t } = useTranslation();

    const { data: server } = useServer(sid);
    const { data: runningGame } = useGame(sid);

    var [tabsListing, setTabsListing] = useState("info");
    const [playerListSort, setPlayerListSort] = useState("position");

    const serverTabs = [
        {
            name: t("server.game.main"),
            callback: () => setTabsListing("info"),
        },
        {
            name: t("server.banList.main"),
            callback: () => setTabsListing("banlist"),
        },
        {
            name: t("server.vipList.main"),
            callback: () => setTabsListing("viplist"),
        },
        {
            name: t("server.adminList.main"),
            callback: () => setTabsListing("adminlist"),
        },
        {
            name: t("server.firestarterList.main"),
            callback: () => setTabsListing("firestarter"),
        },
        {
            name: t("server.playTimeList.main"),
            callback: () => setTabsListing("playtime"),
        },
        {
            name: t("server.spectatorList.main"),
            callback: () => setTabsListing("spectator"),
        },
        {
            name: t("server.playerLogs.main"),
            callback: () => setTabsListing("playerlogs"),
        },
        // {
        //     name: t("server.logs.main"),
        //     callback: () => setTabsListing("loglist"),
        // },
        {
            name: t("server.protection.main"),
            callback: () => setTabsListing("protection"),
        },
        {
            name: t("server.settings.main"),
            callback: () => setTabsListing("settings"),
        }
    ];


    const catTabs = {
        info: (
            <ServerInfoHolder>
                <ServerRotation game={runningGame} rotate={id => OperationsApi.changeRotation({ sid, map: id })} />
            </ServerInfoHolder>
        ),
        banlist:     <BanList sid={sid} />,
        viplist:     <VipList sid={sid} />,
        adminlist:   <AdminList sid={sid} />,
        firestarter: <FireStarter sid={sid} />,
        playtime:    <PlayTime sid={sid} />,
        spectator:   <Spectator sid={sid} />,
        playerlogs:  <Playerlogs sid={sid} />,
        // loglist:     <LogList sid={sid} />,
        protection:  <ServerAutomation server={server} sid={sid} />,
        settings:    <ServerSettings server={server} sid={sid} />,
    }

    return (
        <PageContext.Provider value={[playerListSort, setPlayerListSort]}>
            <Row>
                <Column>
                    <PageCard buttons={serverTabs} >
                        {catTabs[tabsListing]}
                    </PageCard>
                </Column>
            </Row>
            <Row>
                <Column>
                    <Console game={runningGame} sid={sid} />
                </Column>
            </Row>
            <PlayerList game={runningGame} sid={sid} /> 
        </PageContext.Provider>
    );

}



export function DeleteServer(props) {

    var thisSid = props.match.params.sid;
    const { data: server } = useServer(thisSid);

    const queryClient = useQueryClient();
    const history = useHistory();
    const { t } = useTranslation();

    const RemoveServerExecute = useMutation(
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
                history.push(`/group/${data.groupId}`); 
            },
        }
    );

    return (
        <Row>
            <Column>
                <Header>
                    <h2>{t("server.danger.delete")}</h2>
                </Header>
                <Card>
                    <h2>{t("server.danger.main")}</h2>
                    {server !== undefined ? (
                        <p>{t("server.danger.checkWithName", {name: server.serverName})}</p>
                    ) : (
                        <p>{t("server.danger.check")}</p>
                    )}
                    <ButtonRow>
                        <ButtonLink name={t("server.danger.back")} to={"/server/" + thisSid} />
                        <Button name={t("server.danger.confirm")} callback={() => { RemoveServerExecute.mutate({ sid: thisSid }); }} />
                    </ButtonRow>
                </Card>
            </Column>
        </Row>
    );
}


function ServerAutomation(props) {

    var allowedTo = false;
    if (props.server) allowedTo = true;

    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const [kickOnPingDisabled, setKickOnPingDisabled] = useState(false);
    const [serverState, setServerState] = useState(null);
    const [canApply, setCanApply] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null);

    useEffect(() => {

        if (props.server) {
            const { autoBanKick, autoBfbanKick, autoGlobalBanMessage, autoPingKick, autoPingKickMessage, minAutoPingKick, autoBfBanMessage } = props.server;
            const originalServerState = { autoBanKick, autoBfbanKick, autoGlobalBanMessage, autoPingKick, autoPingKickMessage, minAutoPingKick, autoBfBanMessage };
            if (serverState === null) {
                setServerState(originalServerState);
                setKickOnPingDisabled(autoPingKick !== 0);
            } else {
                let newCanApply = false;
                for (var i in originalServerState) {
                    newCanApply |= serverState[i] !== originalServerState[i];
                }
                if (serverState.autoPingKick === 0) setKickOnPingDisabled(false);
                setCanApply(newCanApply);
            }
           
        }
        

    }, [props.server, serverState]);

    const changeSrerverState = (v) => {
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
            onError: async () => {
                setApplyStatus(false);
                setTimeout(_ => setApplyStatus(null), 2000);
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

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>{t("server.protection.title")}</h2>
            <h5 style={{ marginTop: "8px" }}>
                {t("server.protection.vBanDescription0")}<br />
                {t("server.protection.vBanDescription1")}
                <b>{t("server.protection.vBanDescription2")}</b>
                {t("server.protection.vBanDescription3")}<br />
                {t("server.protection.vBanDescription4")}
            </h5>
            <Switch checked={getServerValue("autoBanKick")} name={t("server.protection.vBanEnable")} callback={(v) => changeSrerverState({ autoBanKick: v })}/>
            <h5 style={{ marginTop: "8px" }}>
                {t("server.protection.vbanReasonDesc0")}<br />
                {t("server.protection.vbanReasonDesc1")}
            </h5>
            
            <TextInput
                disabled={!allowedTo || (serverState && !serverState.autoBanKick)}
                callback={(e) => changeSrerverState({ autoGlobalBanMessage: e.target.value })}
                defaultValue={getServerValue("autoGlobalBanMessage")}
                name={t("server.protection.vBanMsg")}
            />
            <h5 style={{ marginTop: "30px" }}>{t("server.protection.bfbanDescription")}<i>bfban.com</i></h5>
            <Switch checked={getServerValue("autoBfbanKick")} name={t("server.protection.bfbanEnable")} callback={(v) => changeSrerverState({ autoBfbanKick: v })} />
            <TextInput
                disabled={!allowedTo || (serverState && !serverState.autoBfbanKick)}
                callback={(e) => changeSrerverState({ autoBfBanMessage: e.target.value })}
                defaultValue={getServerValue("autoBfBanMessage")}
                name={t("server.protection.bfBanMsg")}
            />
            <h5 style={{ marginTop: "30px" }}>{t("server.protection.pingKickDescription")}</h5>
            <Switch checked={kickOnPingDisabled} name={t("server.protection.pingKickEnable")} callback={(v) => { setKickOnPingDisabled(v); (!v) ?changeSrerverState({ autoPingKick: 0 }) : changeSrerverState({ autoPingKick: 200 })  }} />
            <TextInput
                type="number"
                disabled={!allowedTo || !kickOnPingDisabled}
                callback={
                    (e) => {
                        console.log(e.target.value);
                        if (e.target.value < 0) {} else {
                            if (e.target.value !== "") changeSrerverState({ autoPingKick: parseInt(e.target.value) })
                        }
                    }
                }
                value={(serverState) ? serverState.autoPingKick : "" }
                name={t("server.protection.pingKickAmount")}
            />
            <TextInput
                disabled={!allowedTo || !kickOnPingDisabled}
                callback={(e) => changeSrerverState({ autoPingKickMessage: e.target.value })}
                defaultValue={getServerValue("autoPingKickMessage")}
                name={t("server.protection.pingKickMsg")}
            />
            <h5 style={{ marginTop: "8px" }}>{t("server.protection.pingKickMinDesc")}</h5>
            <TextInput
                type="number"
                disabled={!allowedTo || !kickOnPingDisabled}
                callback={
                    (e) => {
                        console.log(e.target.value < 0);
                        if (e.target.value < 0) {} else {
                            if (e.target.value !== "") {
                                changeSrerverState({ minAutoPingKick: parseInt(e.target.value) })
                            }
                        }
                    }
                }
                defaultValue={getServerValue("minAutoPingKick")}
                value={(serverState) ? serverState.minAutoPingKick : "" }
                name={t("server.protection.minAutoPingKick")}
            />
            {   
                (props.server && canApply) ? (
                    <ButtonRow>
                        <Button name={t("apply")} disabled={!allowedTo || applyStatus !== null} callback={
                            _ => editServerSettings.mutate(
                                serverState
                            )
                        } status={applyStatus} />
                    </ButtonRow>
                ) : ""
            }
        </>
    );
}
