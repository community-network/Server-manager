import React, { useState } from "react";
import styles from "./Server.module.css";
import { useQuery } from 'react-query';
import { Button, ButtonRow, DropdownButton, ButtonLink, TextInput } from "./Buttons";
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
                    <SmallText>{(game) ? `${game.map} - ${game.mode} - ${game.serverInfo} [${game.inQue}] players` : "-"}</SmallText>
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

    var moveTeam = (props.team === "0") ? "1" : "2";

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
                <a href={`https://gametools.network/stats/pc/playerid/${player.playerId}?name=${player.name}`} target="_blank" className={styles.PlayerName}>
                    {player.platoon !== "" ? `[${player.platoon}] ` : ""}
                    {player.name}
                </a>
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

    const [searchWord, setSearchWord] = useState("");

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
            <TextInput name={"Search.."} callback={(v) => setSearchWord(v.target.value)} />
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
                            banList.data.filter(p => p.displayName.includes(searchWord)).map(
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
            <h5>Log list</h5>
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

    if (log.action === "autokick-ping") {
        return (
            <div className={styles.logRow}>
                <svg className={styles.logIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19.5,5.5V18.5H17.5V5.5H19.5M12.5,10.5V18.5H10.5V10.5H12.5M21,4H16V20H21V4M14,9H9V20H14V9M7,14H2V20H7V14Z" />
                </svg>
                <span className={styles.logAdmin}>Ping checker</span>
                <span className={styles.logAction}>kicked</span>
                <span className={styles.logPlayer}>{log.toPlayer}</span>
                <span className={styles.logAction}>{log.reason}</span>
                <span className={styles.logReasonDetailed}></span>
                <span className={styles.logTime}>{datetime}</span>
            </div>
        );
    }

    if (log.action === "autokick-globalBans") {
        return (
            <div className={styles.logRow}>
                <svg className={styles.logIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z" />
                </svg>
                <span className={styles.logAdmin}>VBan</span>
                <span className={styles.logAction}>kicked</span>
                <span className={styles.logPlayer}>{log.toPlayer}</span>
                <span className={styles.logReason}>with reason</span>
                <span className={styles.logReasonDetailed}>{log.reason}</span>
                <span className={styles.logTime}>{datetime}</span>
            </div>
        );
    }

    if (log.action === "autokick-bfban") {
        return (
            <div className={styles.logRow}>
                <svg className={styles.logIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z" />
                </svg>
                <span className={styles.logAdmin}>BFBAN</span>
                <span className={styles.logAction}>kicked</span>
                <span className={styles.logPlayer}>{log.toPlayer}</span>
                <span className={styles.logReason}>with reason</span>
                <span className={styles.logReasonDetailed}>{log.reason}</span>
                <span className={styles.logTime}>{datetime}</span>
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
                <span className={styles.logTime}>{datetime}</span>
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
            <span className={styles.logPlayer}>{log.toPlayer}</span>
            <span className={styles.logReason}>{
                ((log.reason === "") ? "without any reason" : "with reason")
            }</span>
            <span className={styles.logReasonDetailed}>{log.reason}</span>
            <span className={styles.logTime}>{datetime}</span>
        </div>
    );
}


function EmptyLogRow() {
    return (
        <div className={styles.logRow}></div>
    );
}

export function VipList(props) {
    const sid = props.sid;
    const { isError, data: vipList, error } = useQuery('serverVipList' + sid, () => OperationsApi.getVipList({ sid }));

    const [searchWord, setSearchWord] = useState("");


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
                <TextInput name={"Search.."} callback={(v) => setSearchWord(v.target.value)} />
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
                            vipList.data.filter(p => p.displayName.includes(searchWord)).map(
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
                <span>{player.displayName}</span>
            </td>
            <td title="Player ID">{player.id}</td>
        </tr>
    );
}