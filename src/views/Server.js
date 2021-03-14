import React, { useState, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Redirect, useHistory } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, ServerRotation, ServerInfoHolder, ButtonLink, ButtonRow, Button, UserStRow, Row, ServerRow, Grow, TextInput, SmallButton, ServerInfo, PlayerInfo } from "../components";


export function Server(props) {
    var sid = props.match.params.sid;

    const queryClient = useQueryClient();

    const { isError: serverError, data: server } = useQuery('server' + sid, () => OperationsApi.getServer(sid), { staleTime: 60000 });
    const { isError: gameError, data: runningGame } = useQuery('serverGame' + sid, () => OperationsApi.getServerGame(sid), { staleTime: 60000 });

    var serverCard = "";
    var playerList = "";
    var playerInGame = false;
    var playerNicknameTeam;

    var [playerName, setPlayerName] = useState("");

    var [addVipStatus, changeAddVipStatus] = useState({ name: "Add Vip", status: false });
    var [removeVipStatus, changeRemoveVipStatus] = useState({ name: "Remove Vip", status: false });
    var [unbanStatus, changeUnbanStatus] = useState({ name: "Unban", status: false });


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
                    if (team == "1") {
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

    if (!serverError && server && !gameError && runningGame) {
        serverCard = (
            <Row>
                <Column>
                    <Header>
                        <h2>Dashboard</h2>
                    </Header>
                    <Card>
                        <h2>Server info</h2>
                        <p>Server info</p>
                        <ServerInfoHolder>
                            <ServerRotation game={runningGame} rotate={id => OperationsApi.changeRotation({ sid, map: id })} /> 
                        </ServerInfoHolder>
                    </Card>
                </Column>
                <Column>
                    <Header />
                    <Card>
                        <h2>Discord Integration</h2>
                        <p>Servers can be attached to Discord bots. <br /> Main bot settings for current server.</p>
                        <ServerInfoHolder>
                            <ServerInfo server={server} />
                        </ServerInfoHolder>
                    </Card>
                </Column>
            </Row>
        );
    }

    if (!gameError && runningGame) {
        var f1 = runningGame.data[0].players[0].players.find(e => e.name == playerName);
        var f2 = runningGame.data[0].players[1].players.find(e => e.name == playerName);

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
                                <Button disabled={playerName === "" || addVipStatus.status } name={addVipStatus.name} callback={_ => AddVip.mutate({ sid, name: playerName, reason: "" })}  />
                                <Button disabled={playerName === "" || removeVipStatus.status} name={removeVipStatus.name} callback={_ => RemoveVip.mutate({ sid, name: playerName, reason: "" })}  />
                            </ButtonRow>
                        </Row>
                    </Card>
                </Column>
            </Row>
            {playerList}
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
                        <ButtonLink name="Chancel" to={`/server/${props.sid}/`} />
                        <Button name="Kick him!" disabled={reason === ""} callback={() => { KickPlayer.mutate({ sid, eaid, reason, playername: props.eaid }); history.push(`/server/${props.sid}/`); }} />
                    </ButtonRow>
                </Card>
            </Column>
        </Row>
    );
}

function ServerBanPlayer(props) {

    var { sid, eaid } = props;

    var [reason, setReason] = useState("");
    var [banTime, setBanTime] = useState(0);
    const queryClient = useQueryClient();

    const BanPlayer = useMutation(
        v => OperationsApi.banPlayer(v),
        {
            // When mutate is called:
            onMutate: async ({ sid, eaid }) => {
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
                    <h2>Ban player</h2>
                </Header>
                <Card>
                    <h2>You are going to ban player {props.eaid}</h2>
                    <TextInput name="Reason" callback={(e) => setReason(e.target.value)} />
                    <TextInput type="number" name="Ban time" defaultValue={0} callback={(e) => setBanTime(e.target.value)} />
                    <ButtonRow>
                        <ButtonLink name="Chancel" to={`/server/${props.sid}/`} />
                        <Button name="Ban hammer!" disabled={reason === "" || banTime < 0} callback={() => { BanPlayer.mutate({ sid, eaid, reason, name: props.eaid, time: banTime }); history.push(`/server/${props.sid}/`); }} />
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