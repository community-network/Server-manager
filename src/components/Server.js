import React, { useState } from "react";
import styles from "./Server.module.css";
import { Link } from "react-router-dom";
import { Button, ButtonRow, Switch, DropdownButton, ButtonLink, TextInput} from "./Buttons";


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
            <div className={styles.ServerInfoColumn}>
                <SettingsRow>
                    <SmallText>Auto kick/ban</SmallText>
                </SettingsRow>
                <SettingsRow>
                    <SmallText>Kick on ping</SmallText>
                </SettingsRow>
                <SettingsRow>
                    <SmallText>Discord bot channel</SmallText>
                </SettingsRow>
                <SettingsRow>
                    <SmallText>Bot lang</SmallText> 
                </SettingsRow>
            </div>
            <div className={styles.ServerDescriptionColumn}>
                <SettingsRow>
                    <Switch checked={server.autoBanKick} callback={() => { }} />
                </SettingsRow>
                <SettingsRow>
                    <SmallIntInput value={server.autoPingKick} />
                </SettingsRow>
                <SettingsRow>
                    <SmallIntInput value={server.discordBotChannel} />
                </SettingsRow>
                <SettingsRow>
                    <SmallIntInput value={server.discordBotLang} />
                </SettingsRow>
            </div>
            <div className={styles.ServerDescriptionColumn}>
                <SettingsRow>
                    <SmallText>Bot Min players</SmallText>
                </SettingsRow>
                <SettingsRow>
                    <SmallText>Bot Prev Req Count</SmallText>
                </SettingsRow>
                <SettingsRow>
                    <SmallText>Bot Started Amount</SmallText>
                </SettingsRow>
            </div>
            <div className={styles.ServerDescriptionColumn}>
                <SettingsRow>
                    <SmallIntInput value={server.discordBotMinPlayerAmount} />
                </SettingsRow>
                <SettingsRow>
                    <SmallIntInput value={server.discordBotPrevReqCount} />
                </SettingsRow>
                <SettingsRow>
                    <SmallIntInput value={server.discordBotStartedAmount} />
                </SettingsRow>
            </div>
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
                <span className={styles.PlayerName}>
                    {player.platoon !== "" ? `[${player.platoon}] ` : ""}
                    {player.name}
                    {" - "}
                    {player.ping}
                </span>
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
    if (!props.banList) {
        return "Loading..";
    }
    const banList = props.banList;
    return (
        <div>
            <h5>
                List of banned players on this server.<br />
                Used <b>{banList.data[0].players.length} slots out of 200</b>.
                Use our group-based virtual ban list,<br /> to ban unlimited amount of players.
            </h5>
            <TextInput name={"Search.."} />
            <div style={{ maxHeight: "400px", overflowY: "scroll", marginTop: "8px" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>

                    <tbody>
                        {
                            banList.data[0].players.map(
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