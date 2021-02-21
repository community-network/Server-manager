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
    var game = props.game;
    return (
        <div className={styles.ServerInfoColumn}>
            <div className={styles.ServerDescriptionRow}>
                <img className={styles.serverImage} src={"https://eaassets-a.akamaihd.net/battlelog/battlebinary/gamedata/Tunguska/18/37/MP_Scar_LandscapeLarge-ee25fbd6.jpg"} />
                <div className={styles.GameInfo}>
                    <span className={styles.ServerName}>{"Sinai Desert - CQ"}</span>
                    <SmallText>{"32/64 players"}</SmallText>
                    <SmallText>{"Running now"}</SmallText>
                </div>
            </div>
            <ButtonRow>
                <Button name="Restart" />
                <select className={styles.SwitchGame}>
                    <option value="">Switch game..</option>
                    <option value="0">Ballroom Blitz - Conquest</option>
                 </select>
            </ButtonRow>
        </div>
    );
}


export function ServerInfoHolder(props) {
    return (
        <div className={styles.ServerInfoRow}>
            {props.children}
        </div>
    );
}

