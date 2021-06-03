import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { OperationsApi } from "../api";
import { useModal, Switch, BanList, Column, Card, Header, ServerRotation, ServerInfoHolder, TopRow, ButtonRow, Button, PageCard, Row, VipList, LogList, TextInput, PlayerInfo, FireStarter, Spectator, Playerlogs } from "../components";
import '../locales/config';
import { useTranslation } from 'react-i18next';


/*
    Checks string to not have special characters and be les or 30 symbols in length
*/
function checkGameString(v) {
    // Not sure wich ones should work, this seems right, maybe some else
    const allowed_keys = "abcdefghijklmnopqrstuvwxyz0123456789_-.: &?!";
    for (let l of v) {
        if (!allowed_keys.includes(l.toLowerCase())) return false;
    }
    return (v.length <= 30);
}

export function Server(props) {
    var sid = props.match.params.sid;
    const { t } = useTranslation();

    const queryClient = useQueryClient();
    const modal = useModal();

    const { isError: serverError, data: server } = useQuery('server' + sid, () => OperationsApi.getServer(sid));
    const { isError: gameError, data: runningGame } = useQuery('serverGame' + sid, () => OperationsApi.getServerGame(sid));

    var serverCard = "";
    var playerList = "";
    var playerInGame = false;
    var playerNicknameTeam;

    var [playerName, setPlayerName] = useState("");

    var [addVipStatus, changeAddVipStatus] = useState({ name: t("server.action.addVip"), status: false });
    var [removeVipStatus, changeRemoveVipStatus] = useState({ name: t("server.action.removeVip"), status: false });
    var [unbanStatus, changeUnbanStatus] = useState({ name: t("server.action.unban"), status: false });
    
    var [tabsListing, setTabsListing] = useState("info");

    const UnbanPlayer = useMutation(
        v => OperationsApi.unbanPlayer(v), {
        onMutate: async () => {
            changeUnbanStatus({ name: "Pending..", status: true });
            return { status: unbanStatus }
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, newTodo, context) => {

        },
        // Always refetch after error or success:
        onSettled: (data, error, variables, context) => {
            changeUnbanStatus(context.status);
        },
    }
    );

    const RemoveVip = useMutation(
        v => OperationsApi.removeVip(v), {
        onMutate: async () => {
            changeRemoveVipStatus({ name: "Pending..", status: true });
            return { status: removeVipStatus }
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, newTodo, context) => {

        },
        // Always refetch after error or success:
        onSettled: (data, error, variables, context) => {
            changeRemoveVipStatus(context.status);
        },
    }
    );

    const AddVip = useMutation(
        v => OperationsApi.addVip(v), {
        onMutate: async () => {
            changeAddVipStatus({ name: "Pending..", status: true });
            return { status: addVipStatus }
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, newTodo, context) => {

        },
        // Always refetch after error or success:
        onSettled: (data, error, variables, context) => {
            changeAddVipStatus(context.status);
        },
    }
    );

    const movePlayer = useMutation(
        variables => OperationsApi.movePlayer(variables),
        {
            // When mutate is called:
            onMutate: async ({ sid, team, name }) => {
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                //await queryClient.cancelQueries('serverGame' + sid)
                // Snapshot the previous value
                const previousGroup = queryClient.getQueryData('serverGame' + sid)
                // Optimistically update to the new value
                // queryClient.setQueryData('serverGame' + sid, old => {
                //     if (team === "1") {
                //         old.data[0].players[1].players.push(old.data[0].players[0].players.find(e => (!e) ? false : e.name === name));
                //         old.data[0].players[0].players = old.data[0].players[0].players.filter(p => (!p) ? false : p.name !== name);
                //     } else {
                //         old.data[0].players[0].players.push(old.data[0].players[1].players.find(e => (!e) ? false : e.name === name));
                //         old.data[0].players[1].players = old.data[0].players[1].players.filter(p => (!p) ? false : p.name !== name);
                //     }
                //     return old;
                // })
                // Return a context object with the snapshotted value
                return { previousGroup, sid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                //queryClient.setQueryData('serverGame' + context.sid, context.previousGroup)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                //queryClient.invalidateQueries('groupId' + context.gid)
            },
        }
    );

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
            name: t("server.firestarterList.main"),
            callback: () => setTabsListing("firestarter"),
        },
        {
            name: t("server.spectatorList.main"),
            callback: () => setTabsListing("spectator"),
        },
        {
            name: t("server.playerLogs.main"),
            callback: () => setTabsListing("playerlogs"),
        },
        {
            name: t("server.logs.main"),
            callback: () => setTabsListing("loglist"),
        },
        {
            name: t("server.protection.main"),
            callback: () => setTabsListing("protection"),
        },
        {
            name: t("server.settings.main"),
            callback: () => setTabsListing("settings"),
        }
    ];

    const [teamId, setTeamId] = useState(false);

    const catTabs = {
        info: (
            <ServerInfoHolder>
                <ServerRotation game={runningGame} rotate={id => OperationsApi.changeRotation({ sid, map: id })} />
            </ServerInfoHolder>
        ),
        banlist: <BanList sid={sid} />,
        viplist: <VipList sid={sid} />,
        firestarter: <FireStarter sid={sid} />,
        spectator: <Spectator sid={sid} />,
        playerlogs: <Playerlogs sid={sid} />,
        loglist: <LogList sid={sid} />,
        protection: (
            <>
                <ServerAutomation server={server} sid={sid} />
            </>
        ),
        settings: ( 
            <>
                <ServerSettings server={server} sid={sid} />
            </>
        )
    }

    //if (!serverError && server && !gameError && runningGame) {
    serverCard = (
        <Row>
            <Column>
                <PageCard buttons={serverTabs} >
                    {catTabs[tabsListing]}
                </PageCard>
            </Column>
        </Row>
    );
    //}

    var isOpsMode = false;
    var isMovableModal = !gameError && runningGame && !("error" in runningGame.data[0].players[0]) && (runningGame.data[0].players[0].players.length > 0 || runningGame.data[0].players[1].players.length > 0) && (runningGame.data[0].players[0].players !== undefined || runningGame.data[0].players[1].players.players !== undefined );
    //console.log(runningGame.data[0].players[0].players.length)
    if (!gameError && runningGame && isMovableModal) {

        isOpsMode = runningGame.data[0].info.mode === "Operations";

        var f1 = runningGame.data[0].players[0].players.find(e => (!e) ? false : e.name === playerName);
        var f2 = runningGame.data[0].players[1].players.find(e => (!e) ? false : e.name === playerName);

        if (f1 !== undefined) {
            playerNicknameTeam = "1";
        } else if(f2 !== undefined) {
            playerNicknameTeam = "2";
        } else {
            isMovableModal = false;
        }

        var playerInGame = (playerName !== "") &&
            (
                (f1 !== undefined) || (f2 !== undefined)
            );

        playerList = (
            <TopRow>
                <Column>
                    <Card>
                        <h2>{t("server.players.teamOne")}</h2>
                        <PlayerInfo game={runningGame} team="0" sid={sid} onMove={movePlayer} banModal={ServerBanPlayer} kickModal={ServerKickPlayer} giveVip={AddVip} removeVip={RemoveVip} /> 
                    </Card>
                </Column>
                <Column>
                    <Card>
                        <h2>{t("server.players.teamTwo")}</h2>
                        <PlayerInfo game={runningGame} team="1" sid={sid} onMove={movePlayer} banModal={ServerBanPlayer} kickModal={ServerKickPlayer}  giveVip={AddVip} removeVip={RemoveVip} /> 
                    </Card>
                </Column>
            </TopRow>
        )
    }

    const movePlayerPopup = (vars) => {
        if (isMovableModal) {
            movePlayer.mutate(vars);
        } else {
            modal.show(
                <>
                    <h2>Player is not found on the server!</h2>
                    <p>Choose a side to move player to, if you think it is an error.</p>
                    <ButtonRow>
                        <h5 style={{margin: "0 6px 0 12px"}}>Team 1</h5>
                        <Switch checked={teamId} callback={(v) => setTeamId(v)}/>
                        <h5 style={{margin: "0"}}>Team 2</h5>
                    </ButtonRow>
                    <Button disabled={playerName === ""} name="Move" callback={_ => {movePlayer.mutate({ sid, team: teamId ? "1" : "2", name: playerName }); modal.close()}} />
                </>
            );
        }
    }

    return (
        <>
            <Row>
                <Column>
                    <Header>
                        <h2>{t("server.main")}</h2>
                    </Header>
                </Column>
            </Row>
            {serverCard}
            <Row>
                <Column>
                    <Card>
                        <h2>{t("server.console.main")}</h2>
                        <Row>
                            <TextInput name={t("server.playerName")} callback={e => setPlayerName(e.target.value)} style={{
                                marginRight: 12,
                            }}/>
                            <ButtonRow>
                                <Button disabled={playerName === ""} name={t("server.action.kick")} callback={_ => modal.show(<ServerKickPlayer sid={sid} eaid={playerName} />)} />
                                <Button disabled={playerName === ""} name={t("server.action.move")} callback={_ => movePlayerPopup({ sid, team: playerNicknameTeam, name: playerName })} />
                                <Button disabled={playerName === ""} name={t("server.action.ban")} callback={_ => modal.show(<ServerBanPlayer sid={sid} eaid={playerName} />)} />
                                <Button disabled={playerName === "" || unbanStatus.status} name={unbanStatus.name} callback={_ => UnbanPlayer.mutate({ sid, name: playerName, reason: "" })} />
                                <Button disabled={playerName === "" || addVipStatus.status || isOpsMode} name={addVipStatus.name} callback={_ => AddVip.mutate({ sid, name: playerName, reason: "" })}  />
                                <Button disabled={playerName === "" || removeVipStatus.status || isOpsMode} name={removeVipStatus.name} callback={_ => RemoveVip.mutate({ sid, name: playerName, reason: "" })}  />
                            </ButtonRow>
                        </Row>
                    </Card>
                </Column>
            </Row>
            {playerList}
        </>
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
            const { autoBanKick, autoBfbanKick, autoGlobalBanMessage, autoPingKick, autoPingKickMessage, minAutoPingKick } = props.server;
            const originalServerState = { autoBanKick, autoBfbanKick, autoGlobalBanMessage, autoPingKick, autoPingKickMessage, minAutoPingKick };
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

function ServerSettings(props) {

    var allowedTo = false;
    if (props.server) allowedTo = true;

    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const [serverState, setServerState] = useState(null);
    const [canApply, setCanApply] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });

    useEffect(() => {
        if (props.server) {
            const { serverName, serverAlias } = props.server;
            const originalServerState = { serverName, serverAlias };
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

    const getServerValue = (key) => {
        if (props.server && key in props.server) {
            return props.server[key]
        }
        return "";
    };

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


function ServerKickPlayer(props) {

    var { sid, eaid } = props;
    const modal = useModal();
    const { t } = useTranslation();
    var [reason, setReason] = useState("");
    var [kickApplyStatus, setKickApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    const queryClient = useQueryClient();

    const KickPlayer = useMutation(
        v => OperationsApi.kickPlayer(v),
        {
            // When mutate is called:
            onMutate: async ({ sid, eaid, reason }) => {
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('serverGame' + sid)
                // Snapshot the previous value
                const previousGroup = queryClient.getQueryData('serverGame' + sid)
                // Optimistically update to the new value
                queryClient.setQueryData('serverGame' + sid, old => {
                    old.data[0].players[0].players = old.data[0].players[0].players.filter(e => e.name !== eaid);
                    old.data[0].players[1].players = old.data[0].players[1].players.filter(e => e.name !== eaid);
                    return old;
                })
                setKickApplyStatus(true);
                // Return a context object with the snapshotted value
                return { previousGroup, sid }
            },
            onSuccess: () => {
                setKickApplyStatus(null);
                modal.close();
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (error, newTodo, context) => {
                setKickApplyStatus(false);
                setError(error);
                setTimeout(_ => setKickApplyStatus(null), 3000);
                queryClient.setQueryData('serverGame' + context.sid, context.previousGroup)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                //queryClient.invalidateQueries('groupId' + context.gid)
            },
        }
    );

    const history = useHistory();

    const checkReason = (v) => (checkGameString(v)) ? setReason(v) : false;

    return (
        <>
            <h2>{t("server.kickMenu.main", {name: props.eaid})}</h2>
            <h5 style={{maxWidth: "400px", margin: "6px 0"}}>{t("server.kickMenu.reasonDescription")}</h5>
            <TextInput name={t("server.kickMenu.reason")} value={reason} callback={(e) => checkReason(e.target.value)} />
            <ButtonRow>
                <Button status={kickApplyStatus} name={t("server.kickMenu.confirm")} disabled={reason === ""} callback={() => { KickPlayer.mutate({ sid, eaid, reason, playername: props.eaid, playerId: props.playerId }); history.push(`/server/${props.sid}/`); }} />
                <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (kickApplyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
            </ButtonRow>
        </>
    );
}


function ServerBanPlayer(props) {
    const modal = useModal();
    var { sid, eaid } = props;
    const { t } = useTranslation();

    const history = useHistory();
    const [reason, setReason] = useState("");
    const [playerId, setPid] = useState(undefined);
    const [banTime, setBanTime] = useState(0);
    const [globalVsClassicBan, setGlobalVsClassicBan] = useState(false);

    var [banApplyStatus, setBanApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });

    const { isError: userGettingError, data: user } = useQuery('user', () => OperationsApi.user);

    useEffect(() => {
        if(playerId !== props.playerId) {
            setPid(props.playerId);
        }
    }, [props.playerId]);

    const BanPlayer = useMutation(
        v => OperationsApi.banPlayer(v),
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

            },
        }
    );

    var gid = null;

    if (user) {
        user.permissions.isAdminOf.map(
            group => {
                for (let someSid of group.servers) {
                    if (someSid === sid) {
                        gid = group.id;
                    }
                }
            }
        )
    }

    const isDisabled =
        reason === "" ||
        banTime < 0 ||
        banApplyStatus !== null ||
        userGettingError || !user || gid == null;

    const checkReason = (v) => (checkGameString(v)) ? setReason(v) : false;
    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>{t("server.banMenu.main", {name: props.eaid})} </h2>
            <h5 style={{maxWidth: "300px"}} >{t("server.banMenu.reasonDescription")}</h5>
            <TextInput value={reason} name={t("server.banMenu.reason")} callback={(e) => checkReason(e.target.value)} />
            <Switch value={globalVsClassicBan} name={t("server.banMenu.vBanOption")} callback={ (v) => setGlobalVsClassicBan(v) } />
            <h5 style={{maxWidth: "300px"}} >{t("server.banMenu.tempbanDesc0")}<br />{t("server.banMenu.tempbanDesc1")}<br />{t("server.banMenu.tempbanDesc2")}</h5>
            <TextInput type={"text"} name="Ban time" defaultValue={0} callback={(e) => setBanTime(e.target.value)} disabled={globalVsClassicBan} />
            <h5 style={{maxWidth: "300px"}} >If set, nickanme will be ignored to force ban by Player ID.</h5>
            <TextInput type="number" name="Player ID" value={playerId} callback={(e) => setPid(e.target.value)} />
            <ButtonRow>
                <Button
                    name={t("server.banMenu.confirm")}
                    style={{ maxWidth: "144px" }}
                    disabled={isDisabled}
                    callback={() => {
                        if (globalVsClassicBan) {
                            GlobalBanPlayer.mutate({ gid, reason, name: props.eaid, playerId });
                        } else {
                            BanPlayer.mutate({ sid, eaid, reason, name: props.eaid, time: banTime, playerId });
                        }
                    }}
                    status={banApplyStatus} />
                <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (banApplyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
            </ButtonRow>
        </>
    );
}