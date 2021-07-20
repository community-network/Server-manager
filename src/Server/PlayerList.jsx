import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useMeasure } from 'react-use';

import { PlayerDropdownButton } from "../components/Buttons";
import { useModal, Column, Card, TopRow } from "../components";

import styles from "./PlayerList.module.css";
import { factions } from "./Factions";

import { ServerKickPlayer, ServerBanPlayer, PlayerStatsModal } from "./Modals";
import { useMovePlayer } from "./Manager";


export function PlayerTimer(props) {

    const { t } = useTranslation();
    // const [now, setTime] = useState(new Date().getTime());

    // setTimeout(_=>setTime(new Date().getTime()), 30000);
    var dateAdded = new Date(props.time / 1000);

    // let time_playing = Math.round(now / 1000 - (props.time / 1000000));

    // let minutes_playing = Math.floor(time_playing / 60);
    // let hours_playing = Math.floor(minutes_playing / 60);

    // minutes_playing = `${minutes_playing - 60 * hours_playing}min`;
    // hours_playing = (hours_playing === 0) ? "" : `${hours_playing}h`;

    return (
        <>
            {t("change", {change: dateAdded})}
            {/* {hours_playing} {minutes_playing} */}
        </>
    );
}

export function PlayerList({ game, sid }) {

    const { t } = useTranslation();

    let haveGame = !!game;
    let teams = haveGame ? game.data[0].players : false;
    let spectators = haveGame ? game.data[0].spectators : false;
   
    let havePlayers = teams && !("error" in teams[0]) && (teams[0].players !== undefined || teams[1].players !== undefined);

    let maxTeamPlayers = haveGame ? game.data[0].info.maxPlayerAmount / 2 : "";
    const maxSpectator = 4;

    const getPlayerAmountMsg = (teamId) => {
        if (!havePlayers) {
            return "";
        }
        if (teams[teamId].players.length === maxTeamPlayers) {
            return t("server.players.full");
        } else {
            return t("server.players.main", {amount: teams[teamId].players.length, max: maxTeamPlayers});
        }   
    }

    const getSectatorAmountMsg = () => {
        if (!havePlayers) {
            return "";
        }
        if (spectators.length === maxSpectator) {
            return t("server.players.full");
        } else {
            return t("server.players.main", {amount: spectators.length, max: maxSpectator});
        }   
    }

    const getFaction = (teamid) => {
        if (!havePlayers) {
            return (
                <span className={styles.Faction}>
                    <div className={styles.LoadingFactionImage}  />
                    {t(`server.players.${teamid}`)}
                </span>
            );
        }
        if (teams[teamid].faction in factions) {
            let factionId = teams[teamid].faction;
            return (
                <span className={styles.Faction}>
                    <img src={factions[factionId].image} alt={factions[factionId].name} className={styles.FactionImage}  />
                    {t(`server.factions.${factionId}`)}
                </span>
            );
        } else {
            return t(`server.players.${teamid}`)
        }
    }

    let team1 = 
        (!haveGame) ? <LoadingListPlayerGroup amount={16} /> : 
        (!havePlayers) ? <PlayerListMessage>{t("server.players.failed")}</PlayerListMessage> : 
        (teams[0].players.length === 0) ? <PlayerListMessage>{t("server.players.noPlayers")}</PlayerListMessage> : 
        <ListPlayerGroup players={teams[0].players} team="0" sid={sid} />;

    let team2 = 
        (!haveGame) ? <LoadingListPlayerGroup amount={16} /> : 
        (!havePlayers) ? <PlayerListMessage>{t("server.players.failed")}</PlayerListMessage> : 
        (teams[1].players.length === 0) ? <PlayerListMessage>{t("server.players.noPlayers")}</PlayerListMessage> : 
        <ListPlayerGroup players={teams[1].players} team="1" sid={sid} />;

    // Message Cards here or smth
    // Instead of plain text

    let specs = 
        (!haveGame) ? <LoadingListPlayerGroup amount={4} /> : 
        (!havePlayers) ? <PlayerListMessage>{t("server.players.failed")}</PlayerListMessage> : 
        (spectators.length === 0) ? <PlayerListMessage>{t("server.players.noSpectators")}</PlayerListMessage> : 
        <ListPlayerGroup players={spectators} team={null} sid={sid} />;

    return (
        <>
            <TopRow>
                <PlayerListColumn>
                    <h2 className={styles.PlayerGroupName}>
                        {getFaction(0)}
                        <span className={styles.playerAmount}>{getPlayerAmountMsg(0)}</span>
                    </h2>
                    {team1}
                </PlayerListColumn>
                <PlayerListColumn>
                    <h2 className={styles.PlayerGroupName}>
                        {getFaction(1)}
                        <span className={styles.playerAmount}>{getPlayerAmountMsg(1)}</span>
                    </h2>
                    {team2}
                </PlayerListColumn>
            </TopRow>
            <TopRow>
                <PlayerListColumn>
                    <h2 className={styles.PlayerGroupName}>{t("server.players.spectators")} <span className={styles.playerAmount}>{getSectatorAmountMsg()}</span></h2>
                    {specs}
                </PlayerListColumn>
            </TopRow>
        </>
    )
}

function PlayerListColumn({ children }) {
    return (
        <Column>
            <Card>{children}</Card>
        </Column>
    )
}

function LoadingListPlayerGroup({ amount }) {
    return (
        <div>
            {Array.from({ length: amount }, (_, i) => i).map((_, i) => (
                <LoadingPlayer key={i} />
            ))}
        </div>
    )
}

function PlayerListMessage({ children }) {
    return (
        <div className={styles.PlayerListMessage}>
            {children}
        </div>
    )
}

function LoadingPlayer() {
    return (
        <div className={styles.PlayerRowLoading}><span className={styles.LoadingText}></span></div>
    );
}

function ListPlayerGroup({ team, players, sid }) {
   
    const [playerListRef, { width }] = useMeasure();

    let moveTeam = !!team ? (team === "0") ? "1" : "2" : false;

    return (
        <div ref={playerListRef}>
            {players.map((player, i) => (
                <Player player={player} key={i} i={i} moveTeam={moveTeam} width={width} sid={sid} />
            ))}
        </div>
    )
}

/**
 * PLayer row
 * @param {Object} props 
 * @param {Object} props.player - Player
 * @param {Number} props.i - Index
 * @param {String} props.sid - Server Id
 * @param {String | Null} props.moveTeam - Tell which team to move player into
 * @param {Number} props.width - Current Player group width
 * 
 * @returns Player
 */
export function Player({ player, i, sid, moveTeam, width }) {

    const modal = useModal();

    // Show player stats modal
    const showStats = _=> {
        return modal.show(
            <PlayerStatsModal player={player.name} id={player.playerId} />
        )
    }

    return (
        <div className={styles.PlayerRow}>

            <span className={styles.PlayerIndex} value="slot">
                {i + 1}
            </span>

            <span className={styles.PlayerLevel} value="rank">
                {
                    (player.rank === null) ? "??" : player.rank
                }
            </span>

            <span className={styles.PlayerName} onClick={showStats} value="nickname">
                {
                    (player.platoon === "") ? "" : `[${player.platoon}] ` 
                }
                {
                    player.name
                }
            </span>

            <span className={styles.PlayerTimer} title="" value="jointime">
                <PlayerTimer time={player.joinTime} />
            </span>

            <span className={styles.PlayerNone} />

            <PlayerButtons player={player} sid={sid} moveTeam={moveTeam} width={width} />

            <PlayerPing ping={player.ping} />
                
        </div>
    );
}

/**
 * Component to show buttons in a Player list
 * @param {Object} props 
 * @param {Object} props.player - Player
 * @param {String} props.sid - Server Id
 * @param {String | Null} props.moveTeam - Tell which team to move player into
 * @param {Number} props.width - Current Player group width
 * 
 * @returns Player Buttons React element
 */
function PlayerButtons({ player, sid, moveTeam, width }) {

    const { t } = useTranslation();
    const modal = useModal();
    const movePlayer = useMovePlayer();

    // Show Ban player Modal
    const showBan = _=> {
        modal.show(
            <ServerBanPlayer 
                sid={sid} 
                eaid={player.name} 
                playerId={player.playerId}
            />
        );
    }

    // Show Kick player modal
    const showKick = _=> {
        modal.show(
                <ServerKickPlayer 
                sid={sid} 
                eaid={player.name} 
                playerId={player.playerId}
            />
        )
    }

    // Try to move player
    const moveCallback = _=> {
        movePlayer.mutate({ 
            sid, 
            name: player.name, 
            team: moveTeam, 
            playerId: player.playerId
        })
    }

    // Possible buttons
    let playerOptions = [
        { name: t("server.action.kick"), callback: showKick },
        { name: t("server.action.ban"),  callback: showBan  },
    ];

    // If movable, add move button
    if (!!moveTeam) {
        playerOptions.push({ name: t("server.action.move"), callback: moveCallback });
    }

    // If too small, show button listing instead
    if (width < 600) {
        return (
            <PlayerDropdownButton options={playerOptions} name="☰"></PlayerDropdownButton>
        )
    }

    // Return Buttons in a row
    return (
        <div className={styles.PlayerButtons}>
            {playerOptions.map(({name, callback}, key) => (
                <PlayerButton onClick={callback} key={key}>
                    {name}
                </PlayerButton>
            ))}
        </div>
    )
} 

/**
 * Player Button styled component
 * @param {Object} props
 * @param {React.ReactChild} props.children
 * @param {Function} props.onClick - callback
 * @returns React element
 */
function PlayerButton({ children, onClick }) {
    return (
        <button className={styles.PlayerButton} onClick={onClick}>
            {children}
        </button>
    )
}


/**
 * Display player ping as an element with icon
 * @param {Object} props
 * @param {String} props.ping - Player Ping
 * @returns React element
 */
function PlayerPing({ ping }) {
    return (
        <span className={styles.PlayerPing}>
            {ping}
            <svg viewBox="0 0 24 24">
                <path 
                    fill="currentColor" 
                    d="M4,6V4H4.1C12.9,4 20,11.1 20,19.9V20H18V19.9C18,12.2 11.8,6 4,6M4,10V8A12,12 0 0,1 16,20H14A10,10 0 0,0 4,10M4,14V12A8,8 0 0,1 12,20H10A6,6 0 0,0 4,14M4,16A4,4 0 0,1 8,20H4V16Z" 
                />
            </svg>
        </span>
    )
}