import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Switch, BanList, Column, Card, Header, ServerRotation, ServerInfoHolder, ButtonLink, ButtonRow, Button, PageCard, Row, VipList, LogList, TextInput, PlayerInfo, FireStarter } from "../components";


export function Server(props) {
    var sid = props.match.params.sid;

    const queryClient = useQueryClient();

    const { isError: serverError, data: server } = useQuery('server' + sid, () => OperationsApi.getServer(sid));
    const { isError: gameError, data: runningGame } = useQuery('serverGame' + sid, () => OperationsApi.getServerGame(sid));

    var serverCard = "";
    var playerList = "";
    var playerInGame = false;
    var playerNicknameTeam;

    var [playerName, setPlayerName] = useState("");

    var [addVipStatus, changeAddVipStatus] = useState({ name: "Add Vip", status: false });
    var [removeVipStatus, changeRemoveVipStatus] = useState({ name: "Remove Vip", status: false });
    var [unbanStatus, changeUnbanStatus] = useState({ name: "Unban", status: false });
    
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
                await queryClient.cancelQueries('serverGame' + sid)
                // Snapshot the previous value
                const previousGroup = queryClient.getQueryData('serverGame' + sid)
                // Optimistically update to the new value
                queryClient.setQueryData('serverGame' + sid, old => {
                    if (team === "1") {
                        old.data[0].players[1].players.push(old.data[0].players[0].players.find(e => e.name === name));
                        old.data[0].players[0].players = old.data[0].players[0].players.filter(p => p.name !== name);
                    } else {
                        old.data[0].players[0].players.push(old.data[0].players[1].players.find(e => e.name === name));
                        old.data[0].players[1].players = old.data[0].players[1].players.filter(p => p.name !== name);
                    }
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousGroup, sid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                queryClient.setQueryData('serverGame' + context.sid, context.previousGroup)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                //queryClient.invalidateQueries('groupId' + context.gid)
            },
        }
    );

    const serverTabs = [
        {
            name: "Current game",
            callback: () => setTabsListing("info"),
        },
        {
            name: "Ban list",
            callback: () => setTabsListing("banlist"),
        },
        {
            name: "Vip players",
            callback: () => setTabsListing("viplist"),
        },
        {
            name: "Firestarter list",
            callback: () => setTabsListing("firestarter"),
        },
        {
            name: "Logs",
            callback: () => setTabsListing("loglist"),
        },
        {
            name: "Server Protection",
            callback: () => setTabsListing("protection"),
        },
        {
            name: "Settings",
            callback: () => setTabsListing("settings"),
        }
    ];

    const catTabs = {
        info: (
            <ServerInfoHolder>
                <ServerRotation game={runningGame} rotate={id => OperationsApi.changeRotation({ sid, map: id })} />
            </ServerInfoHolder>
        ),
        banlist: <BanList sid={sid} />,
        viplist: <VipList sid={sid} />,
        firestarter: <FireStarter sid={sid} />,
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

    if (!gameError && runningGame && !("error" in runningGame.data[0].players[0])) {

        isOpsMode = runningGame.data[0].info.mode === "Operations";

        var f1 = runningGame.data[0].players[0].players.find(e => e.name === playerName);
        var f2 = runningGame.data[0].players[1].players.find(e => e.name === playerName);

        if (f1 !== undefined) {
            playerNicknameTeam = "1";
        } else if(f2 !== undefined) {
            playerNicknameTeam = "2";
        }

        var playerInGame = (playerName !== "") &&
            (
                (f1 !== undefined) || (f2 !== undefined)
            );

        playerList = (
            <Row>
                <Column>
                    <Card>
                        <h2>Team 1</h2>
                        <PlayerInfo game={runningGame} team="0" sid={sid} onMove={movePlayer} giveVip={AddVip} removeVip={RemoveVip} /> 
                    </Card>
                </Column>
                <Column>
                    <Card>
                        <h2>Team 2</h2>
                        <PlayerInfo game={runningGame} team="1" sid={sid} onMove={movePlayer} giveVip={AddVip} removeVip={RemoveVip} /> 
                    </Card>
                </Column>
            </Row>
        )
    }

    return (
        <>
            <Row>
                <Column>
                    <Header>
                        <h2>Server panel</h2>
                    </Header>
                </Column>
            </Row>
            {serverCard}
            <Row>
                <Column>
                    <Card>
                        <h2>Console</h2>
                        <Row>
                            <TextInput name="Player name" callback={e => setPlayerName(e.target.value)} style={{
                                marginRight: 12,
                            }}/>
                            <ButtonRow>
                                <ButtonLink disabled={playerName === ""} name="Kick" to={`/server/${sid}/kick/${playerName}/`} />
                                <Button disabled={!playerInGame} name="Move" callback={_ => movePlayer.mutate({ sid, team: playerNicknameTeam, name: playerName })} />
                                <ButtonLink disabled={playerName === ""} name="Ban" to={`/server/${sid}/ban/${playerName}/`} />
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

    const [kickOnPingDisabled, setKickOnPingDisabled] = useState(false);
    const [serverState, setServerState] = useState(null);
    const [canApply, setCanApply] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null);

    useEffect(() => {

        if (props.server) {
            const { autoBanKick, autoBfbanKick, autoGlobalBanMessage, autoPingKick, autoPingKickMessage } = props.server;
            const originalServerState = { autoBanKick, autoBfbanKick, autoGlobalBanMessage, autoPingKick, autoPingKickMessage };
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
            <h2 style={{ marginLeft: "20px" }}>Auto server protection</h2>
            <h5 style={{ marginTop: "8px" }}>
                Introducing new tools developed to protect your servers against hackers.<br />
                Global Virtual Ban list auto-kicks players on <b>all group servers</b> providing<br />
                infinity amount of ban slots and synchronized ban list.
            </h5>
            <Switch checked={getServerValue("autoBanKick")} name="Enable Global V-Ban" callback={(v) => changeSrerverState({ autoBanKick: v })}/>
            <h5 style={{ marginTop: "8px" }}>This msg appear to users who got <br />auto-kicked by V-Ban Global system.</h5>
            
            <TextInput
                disabled={!allowedTo || (serverState && !serverState.autoBanKick)}
                callback={(e) => changeSrerverState({ autoGlobalBanMessage: e.target.value })}
                defaultValue={getServerValue("autoGlobalBanMessage")}
                name={"V-Ban message"}
            />
            <h5 style={{ marginTop: "30px" }}>Protect server agains known cheaters in <i>bfban.com</i></h5>
            <Switch checked={getServerValue("autoBfbanKick")} name="Enable BFBan Anti Cheat" callback={(v) => changeSrerverState({ autoBfbanKick: v })} />
            <h5 style={{ marginTop: "30px" }}>Auto kick players with constant high ping</h5>
            <Switch checked={kickOnPingDisabled} name="Kick on high ping" callback={(v) => { setKickOnPingDisabled(v); (!v) ?changeSrerverState({ autoPingKick: 0 }) : changeSrerverState({ autoPingKick: 200 })  }} />
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
                name={"High ping value"}
            />
            <TextInput
                disabled={!allowedTo || !kickOnPingDisabled}
                callback={(e) => changeSrerverState({ autoPingKickMessage: e.target.value })}
                defaultValue={getServerValue("autoPingKickMessage")}
                name={"Auto ping msg"}
            />
            <h5 style={{ marginTop: "8px" }}>Mimimum amount of players for autokick to start working (0 for always)</h5>
            <TextInput
                type="number"
                disabled={!allowedTo || !kickOnPingDisabled}
                callback={
                    (e) => {
                        console.log(e.target.value);
                        if (e.target.value < 0) {} else {
                            if (e.target.value !== "") changeSrerverState({ minAutoPingKick: parseInt(e.target.value) })
                        }
                    }
                }
                value={(serverState) ? serverState.minAutoPingKick : "" }
                name={"Minimum amount of players"}
            />
            {
                (props.server && canApply) ? (
                    <ButtonRow>
                        <Button name="Apply changes" disabled={!allowedTo || applyStatus !== null} callback={
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
            <h2 style={{ marginLeft: "20px" }}>Server settings</h2>

            <h5 style={{ marginTop: "8px" }}>Change Server Name</h5>

            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeSrerverState({ serverName: e.target.value })}
                defaultValue={getServerValue("serverName")}
                name={"Server Name"}
            />

            <h5 style={{ marginTop: "8px" }}>Alias to use with a Discord bot. (Can be a server number, for example)</h5>

            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeSrerverState({ serverAlias: e.target.value })}
                defaultValue={getServerValue("serverAlias")}
                name={"Alias"}
            />
            {
                (props.server && canApply) ? (
                    <ButtonRow>
                        <Button name="Apply changes" disabled={!allowedTo || applyStatus !== null} callback={
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

    var [reason, setReason] = useState("");
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
                // Return a context object with the snapshotted value
                return { previousGroup, sid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                queryClient.setQueryData('serverGame' + context.sid, context.previousGroup)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                //queryClient.invalidateQueries('groupId' + context.gid)
            },
        }
    );

    const history = useHistory();

    return (
        <Row>
            <Column>
                <Header>
                    <h2>Kick player</h2>
                </Header>
                <Card>
                    <h2>You are going to kick player {props.eaid}</h2>
                    <TextInput name="Reason" callback={(e) => setReason(e.target.value)} />
                    <ButtonRow>
                        <ButtonLink name="Go back" to={`/server/${props.sid}/`} />
                        <Button name="Kick him!" disabled={reason === ""} callback={() => { KickPlayer.mutate({ sid, eaid, reason, playername: props.eaid }); history.push(`/server/${props.sid}/`); }} />
                    </ButtonRow>
                </Card>
            </Column>
        </Row>
    );
}

function ServerBanPlayer(props) {

    var { sid, eaid } = props;

    const history = useHistory();
    const [reason, setReason] = useState("");
    const [banTime, setBanTime] = useState(0);
    const [globalVsClassicBan, setGlobalVsClassicBan] = useState(false);

    var [banApplyStatus, setBanApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });

    const { isError: userGettingError, data: user } = useQuery('user', () => OperationsApi.user);

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
                history.push(`/server/${ props.sid } /`);
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


    return (
        <Row>
            <Column>
                <Header>
                    <h2>Ban player</h2>
                </Header>
                <Card>
                    <h2 style={{ marginLeft: "20px" }}>You are going to ban player {props.eaid}</h2>
                    <h5>Enter a reason to ban this player.</h5>
                    <TextInput name="Reason" callback={(e) => setReason(e.target.value)} />
                    <Switch value={globalVsClassicBan} name="Use Virtual Ban instead of classic ban list" callback={ (v) => setGlobalVsClassicBan(v) } />
                    <h5>If you want to temporary ban him, specify time in<br /> hours below, or leave it 0 to make permament ban.<br />Not supported yet by V-Ban.</h5>
                    <TextInput type="number" name="Ban time" defaultValue={0} callback={(e) => setBanTime(e.target.value)} disabled={globalVsClassicBan} />
                    <ButtonRow>
                        <ButtonLink name="Go back" to={`/server/${props.sid}/`} style={{maxWidth: "143px"}} />
                        <Button
                            name="Ban!"
                            style={{ maxWidth: "144px" }}
                            disabled={isDisabled}
                            callback={() => {
                                if (globalVsClassicBan) {
                                    GlobalBanPlayer.mutate({ gid, reason, name: props.eaid });
                                } else {
                                    BanPlayer.mutate({ sid, eaid, reason, name: props.eaid, time: banTime });
                                }
                            }}
                            status={banApplyStatus} />
                        <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (banApplyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
                    </ButtonRow>
                </Card>
            </Column>
        </Row>
    );
}

export function ServerAction(props) {

    var { eaid, action, sid } = props.match.params;

    if (action === "kick") {
        return <ServerKickPlayer eaid={eaid} sid={sid} />;
    } else if (action === "ban") {
        return <ServerBanPlayer eaid={eaid} sid={sid} />;
    }

    return (
        <Row>
            <Column>
                <Header>
                    <h2>Uh? Method {action} is not allowed..</h2>
                </Header>
            </Column>
        </Row>
    );

}