import React, { useState, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { OperationsApi } from "../api";
import { useModal, Switch, ButtonRow, Button, TextInput } from "../components";
import '../locales/config';

import { useUser } from "./Manager";

import styles from "./Styles.module.css";


export function ServerKickPlayer(props) {

    var { sid, eaid } = props;

    const modal = useModal();
    const { t } = useTranslation();
    const [reason, setReason] = useState("");
    const [kickApplyStatus, setKickApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    const queryClient = useQueryClient();
    const history = useHistory();

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
        }
    );


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


export function ServerBanPlayer(props) {

    var { sid, eaid } = props;

    const modal = useModal();
    const { t } = useTranslation();
    const [reason, setReason] = useState("");
    const [playerId, setPid] = useState(undefined);
    const [banTime, setBanTime] = useState(0);
    const [globalVsClassicBan, setGlobalVsClassicBan] = useState(false);
    const [banApplyStatus, setBanApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    const { isError: userGettingError, data: user } = useUser();

    useEffect(() => {
        if(playerId !== props.playerId) {
            setPid(props.playerId);
        }
    }, [playerId, props.playerId]);

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
                modal.close();
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

export function ServerMovePlayer(props) {
    const modal = useModal();
    const onMovePlayer = _=> {
        props.callback();
        modal.close();
    };
    return (
        <>
            <h2>Player is not found on the server!</h2>
            <p>Choose a side to move player to, if you think it is an error.</p>
            <ButtonRow>
                <h5 style={{margin: "0 6px 0 12px"}}>Team 1</h5>
                <Switch checked={props.team} callback={props.setTeam}/>
                <h5 style={{margin: "0"}}>Team 2</h5>
            </ButtonRow>
            <Button 
                name="Move" 
                callback={onMovePlayer} 
            />
        </>
    );
}

export function PlayerStatsModal(props) {

    const player = props.player;
    const playerId = props.id;
    
    let type = "playerid"
    let check = playerId
    if (playerId === undefined) {
        type = "name"
        check = player
    }
    const { isError, data: stats, isLoading } = useQuery(['playerStatsByEAID', player], () => fetch(`https://api.gametools.network/bf1/stats/?${type}=${check}&lang=en-us&platform=pc&=`).then(r=>r.json()));
    const { t } = useTranslation();
    
    const statsBlock = (!isLoading && !isError) ? (
        <div className={styles.statsBlock}>
            <h5>{t("server.playerStats.skill")}{stats.skill}</h5>
            <h5>{t("server.playerStats.rank")}{stats.rank}</h5>
            <h5>{t("server.playerStats.killsPerMinute")}{stats.killsPerMinute}</h5>
            <h5>{t("server.playerStats.winPercent")}{stats.winPercent}</h5>
            <h5>{t("server.playerStats.accuracy")}{stats.Accuracy}</h5>
            <h5>{t("server.playerStats.headshots")}{stats.headshots}</h5>
            <h5>{t("server.playerStats.killDeath")}{stats.killDeath}</h5>
            <h5>{t("server.playerStats.id")}{stats.id}</h5>
            <a href={"https://gametools.network/stats/pc/playerid/"+stats.id+"?name="+player} target="_blank" rel="noreferrer">{t("server.playerStats.toStatsPage")}</a>
        </div>
    ) : t("server.playerStats.loading");

    return (   
        <>
            <h2>{t("server.playerStats.main", {player: player})}</h2>
            {statsBlock}
        </>
    );
}

/*
    Checks string to not have special characters and be les or 30 symbols in length
*/
export function checkGameString(v) {
    // Not sure wich ones should work, this seems right, maybe some else
    const allowed_keys = "abcdefghijklmnopqrstuvwxyz0123456789_-.: &?!";
    for (let l of v) {
        if (!allowed_keys.includes(l.toLowerCase())) return false;
    }
    return (v.length <= 30);
}


export function ServerUnbanPlayer(props) {

    var { sid, eaid, playerId } = props;

    const modal = useModal();
    const { t } = useTranslation();
    const [reason, setReason] = useState("");
    const [banApplyStatus, setBanApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    const { isError: userGettingError, data: user } = useUser();

    const UnbanPlayer = useMutation(
        v => OperationsApi.unbanPlayer(v),
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
        banApplyStatus !== null ||
        userGettingError || !user || gid == null;

    const checkReason = (v) => (checkGameString(v)) ? setReason(v) : false;

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>{t("server.unbanMenu.main", {name: props.eaid})} </h2>
            <h5 style={{maxWidth: "300px"}} >{t("server.unbanMenu.reasonDescription")}</h5>
            <TextInput value={reason} name={t("server.unbanMenu.reason")} callback={(e) => checkReason(e.target.value)} />
            <ButtonRow>
                <Button
                    name={t("server.unbanMenu.confirm")}
                    style={{ maxWidth: "144px" }}
                    disabled={isDisabled}
                    callback={() => {
                        UnbanPlayer.mutate({ sid, eaid, reason, name: props.eaid, playerId });
                    }}
                    status={banApplyStatus} />
                <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (banApplyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
            </ButtonRow>
        </>
    );
}

export function ServerUnvipPlayer(props) {

    var { sid, eaid, playerId } = props;

    const modal = useModal();
    const { t } = useTranslation();
    const [reason, setReason] = useState("");
    const [banApplyStatus, setBanApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    const { isError: userGettingError, data: user } = useUser();

    const UnvipPlayer = useMutation(
        v => OperationsApi.removeVip(v),
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
        banApplyStatus !== null ||
        userGettingError || !user || gid == null;

    const checkReason = (v) => (checkGameString(v)) ? setReason(v) : false;

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>{t("server.unvipMenu.main", {name: props.eaid})} </h2>
            <h5 style={{maxWidth: "300px"}} >{t("server.unvipMenu.reasonDescription")}</h5>
            <TextInput value={reason} name={t("server.unvipMenu.reason")} callback={(e) => checkReason(e.target.value)} />
            <ButtonRow>
                <Button
                    name={t("server.unvipMenu.confirm")}
                    style={{ maxWidth: "144px" }}
                    disabled={isDisabled}
                    callback={() => {
                        UnvipPlayer.mutate({ sid, eaid, reason, name: props.eaid, playerId });
                    }}
                    status={banApplyStatus} />
                <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (banApplyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
            </ButtonRow>
        </>
    );
}
