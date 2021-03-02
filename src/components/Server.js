import React from "react";
import styles from "./Server.module.css";
import { Link } from "react-router-dom";
import { Button, ButtonRow, Switch } from "./Buttons";


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
    var game = props.game.data[0].info;
    return (
        <div className={styles.ServerInfoColumn}>
            <div className={styles.ServerDescriptionRow}>
                <img className={styles.serverImage} src={game.url} />
                <div className={styles.GameInfo}>
                    <span className={styles.ServerName}>{game.prefix}</span>
                    <SmallText>{`${game.serverInfo} players`}</SmallText>
                    <SmallText>{"Running now"}</SmallText>
                </div>
            </div>
            <ButtonRow>
                <Button name="Restart" />
                <select className={styles.SwitchGame}>
                    <option value="">Switch game..</option>
                    {game.rotation.map(value => 
                        <option value={value.index}>{value.mapname}</option>
                    )}
                 </select>
            </ButtonRow>
        </div>
    );
}

export function PlayerInfo(props) {
    var info = props.game.data[0].players[props.team].players;
    return (
        info.map(player => 
            <div className={styles.PlayerRow}>
                <span className={styles.PlayerName}>
                    {player.platoon !== "" ? `[${player.platoon}] ` : ""}
                    {player.name}
                </span>
                <div className={styles.PlayerButtons}>
                    <Button name="Stats"></Button>
                    <Button name="Kick"></Button>
                    <Button name="Ban"></Button>
                    <Button name="☰"></Button>
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

