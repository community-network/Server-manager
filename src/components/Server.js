import React, { useState } from "react";
import styles from "./Server.module.css";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Link } from "react-router-dom";
import { Button, ButtonRow, Switch, DropdownButton, ButtonLink, TextInput } from "./Buttons";
import { OperationsApi } from "../api";


export function SmallText(props) {
    return (<span className={styles.SmallText}>{props.children}</span>);
}

export function EditableText(props) {
    return (<p>{props.children}</p>);
}

export function SettingsRow(props) {
    return <div className={styles.SettingsRow}>{props.children}</div>;
}

export function SmallIntInput(props) {
    return <input type="text" className={styles.SmallInput} defaultValue={props.value} />;
}

export function ServerInfo(props) {
    var server = props.server;
    return (
        <>
        </>
    );
}

export function ServerRotation(props) {
    
    var server = null, game = null;
    if (props.game && props.game.data && props.game.data.length > 0) {
        server = props.game.data[0];
        game = server.info;
    }

    var [rotationId, setRotationId] = useState(""); 
    return (
        <div className={styles.ServerInfoColumn}>
            <div className={styles.ServerDescriptionRow}>
                <img className={styles.serverImage} src={(game) ? game.url : "/no-server-image.png"} />
                <div className={styles.GameInfo}>
                    <span className={styles.ServerName}>{(game) ? game.prefix : "Loading" }</span>
                    <SmallText>{(game) ? `${game.map} - ${game.mode} - ${game.serverInfo} players` : "-"}</SmallText>
                </div>
            </div>
            <div className={(server) ? (server.isAdmin) ? styles.serverStatusOk : styles.serverStatusErr : styles.serverStatus }>
                <span>Status: {(server) ? (server.isAdmin) ? "Managable" : "Permission denied" : "Pending.."}</span>
            </div>
            <ButtonRow>
                <Button name="Restart" disabled={!game} callback={_ => props.rotate((game) ? game.rotationId : null)} />
                <select className={styles.SwitchGame} value={rotationId} onChange={e => setRotationId(e.target.value)}>
                    <option value="">Switch game..</option>
                    {(game) ? game.rotation.map((value, i) =>
                        <option value={value.index} key={i}>{value.mapname}</option>
                    ) : ""}
                </select>
                {(rotationId !== "") ? <Button name="Apply" disabled={!game} callback={_ => { props.rotate((game) ? rotationId : null); setRotationId(""); }} /> : ""}
            </ButtonRow>
        </div>
    );
}

export function PlayerInfo(props) {

    var info = props.game.data[0].players[props.team].players;

    var moveTeam = (props.team == "0") ? "1" : "2";

    let getDropdownOptions = (player) => {
        return [
            { name: "Give VIP", callback: () => props.giveVip.mutate({ sid: props.sid, name: player.name, reason: "" }) },
            { name: "Remove VIP", callback: () => props.removeVip.mutate({ sid: props.sid, name: player.name, reason: "" }) },
        ]
    };
    return (
        info.map((player, i) => 
            <div className={styles.PlayerRow} key={i}>
                <span className={styles.PlayerIndex}>
                    {i + 1}
                </span>
                <span className={styles.PlayerName}>
                    {player.platoon !== "" ? `[${player.platoon}] ` : ""}
                    {player.name}
                </span>
                <span className={styles.PlayerPing}>
                    {player.ping}
                </span>
                <span className={styles.PlayerNone} />
                
                <div className={styles.PlayerButtons}>
                    {/*<Button name="Stats"></Button>*/}
                    <Button name="Move" callback={_ => props.onMove.mutate({ sid: props.sid, name: player.name, team: moveTeam})} />
                    <ButtonLink name="Kick" to={`/server/${props.sid}/kick/${player.name}/`} />
                    <ButtonLink name="Ban" to={`/server/${props.sid}/ban/${player.name}/`} />
                    <DropdownButton options={getDropdownOptions(player)} name="☰"></DropdownButton>
                </div>
            </div>
        )
    );
}

export function ServerInfoHolder(props) {
    return (
        <div className={styles.ServerInfoRow}>
            {props.children}
        </div>
    );
}

export function BanList(props) {
    const sid = props.sid;
    const { isError, data: banList, error } = useQuery('serverBanList' + sid, () => OperationsApi.getBanList({ sid }));

    if (!banList) {
        // TODO: add fake item list on loading
        return "Loading..";
    }

    if (isError) {
        return `Error ${error.code}: {error.message}`
    }

    return (
        <div>
            <h5>
                List of banned players on this server.<br />
                Used <b>{banList.data.length} slots out of 200</b>.
                Use our group-based virtual ban list,<br /> to ban unlimited amount of players.
            </h5>
            <TextInput name={"Search.."} />
            <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead style={{ position: "sticky", top: "0" }}>
                        <th>Player name</th>
                        <th>Player id</th>
                        <th>Reason</th>
                        <th>Admin</th>
                        <th>Until</th>
                        <th>Timestamp</th>
                    </thead>
                    <tbody>
                        {
                            banList.data.map(
                                (player, i) => (<BanRow player={player} key={i} />)
                            )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BanRow(props) {
    const player = props.player;
    return (
        <tr className={styles.BanRow}>
            <td className={styles.BanDisplayName}>{player.displayName}</td>
            <td title="Player ID">{player.id}</td>
            <td>{player.reason}</td>
            <td>{player.admin}</td>
            <td>{player.banned_until}</td>
            <td>{player.ban_timestamp}</td>
        </tr>
    );
}

export function LogList(props) {
    const sid = props.sid;
    const { isError, data: logList, error } = useQuery('serverLogList' + sid, () => OperationsApi.getServerLogs({ sid }));

    if (!logList) {
        // TODO: add fake item list on loading
        return "Loading..";
    }

    if (isError) {
        return `Error ${error.code}: {error.message}`
    }

    logList.logs.sort((a, b) => (
        Date.parse(b.timeStamp) - Date.parse(a.timeStamp)
    ));

    return (
        <div>
            <h5>Log list</h5>
            <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
            {
                logList.logs.map(
                    (log, i) => (<LogRow log={log} key={i} />)
                )
            }
            </div>
        </div>
    );
}

function LogRow(props) {
    const log = props.log;
    const action = (() => {
        switch (log.action) {
            case "addServerBan":
                return "banned";
            case "kickPlayer":
                return "kicked";
            case "removeServerBan":
                return "unbanned"
            case "addServerVip":
                return "gave vip to";
            case "movePlayer":
                return "moved";
            case "removeServerVip":
                return "removed vip of"
            default:
                return "did magic to";
        }
    })();
    var datetime = new Date(log.timeStamp);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    // Local time
    datetime = `${datetime.getUTCDate()} ${months[datetime.getMonth()]} ${datetime.getFullYear()} ${datetime.getHours()}:${datetime.getMinutes()}`;
    return (
        <div className={styles.logRow}>
            <span className={styles.logAdmin}>{log.adminName}</span>
            <span className={styles.logAction}>{action}</span>
            <span className={styles.logPlayer}>{log.toPlayer}</span>
            <span className={styles.logReason}>{
                ((log.reason === "") ? "without any reason" : "with reason " + log.reason)
            }</span>
            <span className={styles.logTime}>{datetime}</span>
        </div>
    );
}

export function VipList(props) {
    const sid = props.sid;
    const { isError, data: vipList, error } = useQuery('serverVipList' + sid, () => OperationsApi.getVipList({ sid }));

    if (!vipList) {
        // TODO: add fake item list on loading
        return "Loading..";
    }

    if (isError) {
        return `Error ${error.code}: {error.message}`
    }
    

    return (
        <div>
            <div className={styles.VipHeader}>
                <TextInput name={"Search.."} />
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h5 style={{ marginBottom: 0 }}>
                        List of VIP players on this server.<br />
                        Used <b>{vipList.data.length} slots out of 50</b>.
                    </h5>
                </div>
            </div>
            <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead style={{ position: "sticky", top: "0" }}>
                        <tr>
                            <th>Player name</th>
                            <th>Player id</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            vipList.data.map(
                                (player, i) => (<VipRow player={player} key={i} />)
                            )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function VipRow(props) {
    const player = props.player;
    return (
        <tr className={styles.VipRow}>
            <td title={player.displayName} className={styles.VipName}>
                <div className={styles.VipRowImg}><img src={player.avatar} alt="" /></div>
                {player.displayName}
            </td>
            <td title="Player ID">{player.id}</td>
        </tr>
    );
}