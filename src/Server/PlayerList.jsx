import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useMeasure } from 'react-use';

import { PlayerDropdownButton } from "../components/Buttons";
import { useModal, Column, Card, TopRow } from "../components";

import styles from "./PlayerList.module.css";

import { ServerKickPlayer, ServerBanPlayer, PlayerStatsModal } from "./Modals";
import { useMovePlayer } from "./Manager";


export function PlayerTimer(props) {


    const [now, setTime] = useState(new Date().getTime());

    setTimeout(_=>setTime(new Date().getTime()), 30000);

    let time_playing = Math.round(now / 1000 - (props.time / 1000000));

    let minutes_playing = Math.floor(time_playing / 60);
    let hours_playing = Math.floor(minutes_playing / 60);

    minutes_playing = `${minutes_playing - 60 * hours_playing}min`;
    hours_playing = (hours_playing == 0) ? "" : `${hours_playing}h`;

    return (
        <>
            {hours_playing} {minutes_playing}
        </>
    );
}

export function PlayerList(props) {

    const { t } = useTranslation();

    let { game, sid } = props;

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
        if (teams[teamId].players.length == maxTeamPlayers) {
            return t("server.players.full");
        } else {
            return `${teams[teamId].players.length}/${maxTeamPlayers}`;
        }   
    }

    const getSectatorAmountMsg = () => {
        if (!havePlayers) {
            return "";
        }
        if (spectators.length == maxSpectator) {
            return t("server.players.full");
        } else {
            return `${spectators.length}/${maxSpectator}`;
        }   
    }


    let team1 = 
        (!haveGame) ? <LoadingListPlayerGroup amount={32} /> : 
        (!havePlayers) ? t("server.players.failed") : 
        (teams[0].players.length == 0) ? t("server.players.noPlayers") : 
        <ListPlayerGroup players={teams[0].players} team="0" sid={sid} />;

    let team2 = 
        (!haveGame) ? <LoadingListPlayerGroup amount={32} /> : 
        (!havePlayers) ? t("server.players.failed") : 
        (teams[1].players.length == 0) ? t("server.players.noPlayers") : 
        <ListPlayerGroup players={teams[1].players} team="1" sid={sid} />;


    // Message Cards here or smth
    // Instead of plain text

    let specs = 
        (!haveGame) ? <LoadingListPlayerGroup amount={4} /> : 
        (!havePlayers) ? t("server.players.failed") : 
        (spectators.length == 0) ? t("server.players.noSpectators") : 
        <ListPlayerGroup players={spectators} team={null} sid={sid} />;

    return (
        <>
            <TopRow>
                <PlayerListColumn>
                    <h2>{t("server.players.teamOne")} <span className={styles.playerAmount}>{getPlayerAmountMsg(0)}</span></h2>
                    {team1}
                </PlayerListColumn>
                <PlayerListColumn>
                    <h2>{t("server.players.teamTwo")}  <span className={styles.playerAmount}>{getPlayerAmountMsg(1)}</span></h2>
                    {team2}
                </PlayerListColumn>
            </TopRow>
            <TopRow>
                <PlayerListColumn>
                    <h2>Spectators <span className={styles.playerAmount}>{getSectatorAmountMsg()}</span></h2>
                    {specs}
                </PlayerListColumn>
            </TopRow>
        </>
    )
}

function PlayerListColumn(props) {
    return (
        <Column>
            <Card>{props.children}</Card>
        </Column>
    )
}

function LoadingListPlayerGroup(props) {
    let { amount } = props;
    return (
        <div>
            {Array.from({ length: amount }, (_, i) => i).map((_, i) => (
                <LoadingPlayer key={i} />
            ))}
        </div>
    )
}

function LoadingPlayer() {
    return (
        <div className={styles.PlayerRowLoading}><span className={styles.LoadingText}></span></div>
    );
}

function ListPlayerGroup(props) {
   
    const [playerListRef, { width }] = useMeasure();

    let { team, players, sid } = props;

    let moveTeam = !!team ? (team === "0") ? "1" : "2" : false;

    return (
        <div ref={playerListRef}>
            {players.map((player, i) => (
                <Player player={player} key={i} i={i} moveTeam={moveTeam} width={width} sid={sid} />
            ))}
        </div>
    )
}


export function Player(props) {

    const modal = useModal();

    let { player, i, sid, moveTeam, width } = props;

    const showStats = _=> {
        return modal.show(
            <PlayerStatsModal player={player.name} />
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

function PlayerButtons(props) {

    let { player, sid, moveTeam, width } = props;

    const { t } = useTranslation();
    const modal = useModal();
    const movePlayer = useMovePlayer();

    const showBan = _=> {
        modal.show(
            <ServerBanPlayer 
                sid={sid} 
                eaid={player.name} 
                playerId={player.playerId}
            />
        );
    }

    const showKick = _=> {
        modal.show(
                <ServerKickPlayer 
                sid={sid} 
                eaid={player.name} 
                playerId={player.playerId}
            />
        )
    }

    const moveCallback = _=> {
        movePlayer.mutate({ 
            sid, 
            name: player.name, 
            team: moveTeam, 
            playerId: player.playerId
        })
    }


    let playerOptions = [
        { name: t("server.action.kick"), callback: showKick },
        { name: t("server.action.ban"),  callback: showBan  },
    ];

    if (!!moveTeam) {
        playerOptions.push({ name: t("server.action.move"), callback: moveCallback });
    }


    if (width < 600) {
        return (
            <PlayerDropdownButton options={playerOptions} name="☰"></PlayerDropdownButton>
        )
    }

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

function PlayerButton(props) {
    return (
        <button className={styles.PlayerButton} onClick={props.onClick}>
            {props.children}
        </button>
    )
}

function PlayerPing(props) {

    const { ping } = props;

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