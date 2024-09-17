import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMeasure } from "react-use";
import { PageContext } from "./ServerGlobalContext";

import { Card, Column, TopRow, useModal } from "../components";
import { PlayerDropdownButton } from "../components/Buttons";
import { DynamicSort } from "../components/Functions";

import { bf1Factions, bfvFactions, IFactions } from "./Factions";
import * as styles from "./PlayerList.module.css";

import { useQuery } from "@tanstack/react-query";
import { GametoolsApi } from "../api/GametoolsApi";
import {
  IManagerPlayers,
  ISeederServerPlayer,
} from "../api/GametoolsReturnTypes";
import {
  IInGameServerInfo,
  IServerInfo,
  IServerPlayer,
  IServerTeam,
} from "../api/ReturnTypes";
import { useMovePlayer } from "./Manager";
import { PlayerStatsModal, ServerBanPlayer, ServerKickPlayer } from "./Modals";

export function PlayerList(
  props: Readonly<{
    game: IInGameServerInfo;
    server: IServerInfo;
    sid: string;
  }>,
) {
  const { game, server, sid } = props;
  const { t } = useTranslation();

  const haveGame = !!game;
  const haveServer = !!server;
  const teams = haveGame ? game.data[0].players : [];
  const spectators = haveGame ? game.data[0].spectators : [];
  const gameName = haveServer ? server.game : false;

  let factions: IFactions = bf1Factions;
  if (gameName === "bfv") {
    factions = bfvFactions;
  }

  const havePlayers =
    teams?.length > 0 &&
    !("error" in teams[0]) &&
    (teams[0].players !== undefined || teams[1].players !== undefined);

  const gameId = havePlayers ? game.data[0].ingameServerId : null;
  const { data: seederInfo } = useQuery({
    queryKey: ["seederPlayers", gameId],

    queryFn: () =>
      GametoolsApi.seederPlayerList({
        gameId: gameId,
      }),
  });

  let playerIds: number[] = [];
  if (teams?.length > 0) {
    teams.forEach((teamInfo: IServerTeam) => {
      playerIds = playerIds.concat(
        teamInfo.players.map((player) => {
          return player?.playerId;
        }),
      );
    });
  }

  const {
    isLoading: checkBanLoading,
    isError: checkBanError,
    data: checkBanInfo,
  } = useQuery({
    queryKey: ["managerCheckPlayers" + playerIds],
    queryFn: () =>
      GametoolsApi.managerCheckPlayers({
        playerIds: playerIds,
      }),
  });

  const haveSeederPlayers =
    seederInfo && seederInfo.teams && seederInfo.teams.length > 0;
  let seederPlayers: Map<number, ISeederServerPlayer> = new Map<
    number,
    ISeederServerPlayer
  >();
  if (haveSeederPlayers) {
    seederPlayers = new Map<number, ISeederServerPlayer>();
    seederInfo.teams.map((team) => {
      team.players.map((player) => seederPlayers.set(player.player_id, player));
    });
  }

  const maxTeamPlayers = haveGame ? game.data[0].info.maxPlayerAmount / 2 : "";
  const maxSpectator = 4;

  const getPlayerAmountMsg = (teamId: number) => {
    if (!havePlayers) {
      return "";
    }
    if (teams[teamId].players.length === maxTeamPlayers) {
      return t("server.players.full");
    } else {
      return t("server.players.main", {
        amount: teams[teamId].players.length,
        max: maxTeamPlayers,
      });
    }
  };

  const getSectatorAmountMsg = () => {
    if (!spectators) {
      return "";
    }

    if (spectators.length === maxSpectator) {
      return t("server.players.full");
    } else {
      return t("server.players.main", {
        amount: spectators.length,
        max: maxSpectator,
      });
    }
  };

  const getFaction = (teamid: number) => {
    if (!havePlayers) {
      return (
        <span className={styles.Faction}>
          <div className={styles.LoadingFactionImage} />
          {t(`server.players.${teamid}`)}
        </span>
      );
    }
    if (teams[teamid].faction in factions) {
      const factionId = teams[teamid].faction;
      return (
        <span className={styles.Faction}>
          <img
            src={factions[factionId].image}
            alt={factions[factionId].name}
            className={styles.FactionImage}
          />
          {t(`server.factions.${factionId}`)}
        </span>
      );
    } else {
      return t(`server.players.${teamid}`);
    }
  };

  const TeamInfo = (
    fakePlayerCount: number,
    teamId: string,
    players: IServerPlayer[],
  ) => {
    if (!haveGame) {
      return <LoadingListPlayerGroup amount={fakePlayerCount} />;
    }
    if (!havePlayers) {
      return (
        <PlayerListMessage>{t("server.players.failed")}</PlayerListMessage>
      );
    }
    if (players?.length <= 0) {
      return (
        <PlayerListMessage>
          {teamId !== "spectators"
            ? t("server.players.noPlayers")
            : t("server.players.noSpectators")}
        </PlayerListMessage>
      );
    }
    return (
      <ListPlayerGroup
        seederPlayers={seederPlayers}
        gameName={teamId !== "spectators" ? gameName : undefined}
        players={players}
        team={teamId !== "spectators" ? teamId : null}
        sid={sid}
        checkBanInfo={checkBanInfo}
        checkBanLoading={checkBanLoading}
        checkBanError={checkBanError}
      />
    );
  };

  const team1 = TeamInfo(16, "0", teams[0]?.players);
  const team2 = TeamInfo(16, "1", teams[1]?.players);
  const specs = TeamInfo(16, "spectators", spectators);

  const [playerColumnRef, { width }] = useMeasure();

  return (
    <div ref={playerColumnRef}>
      {width > 2000 ? (
        <TopRow>
          <PlayerListColumn>
            <h2 className={styles.PlayerGroupName}>
              {getFaction(0)}
              <span className={styles.playerAmount}>
                {getPlayerAmountMsg(0)}
              </span>
            </h2>
            {team1}
          </PlayerListColumn>
          <PlayerListColumn>
            <h2 className={styles.PlayerGroupName}>
              {getFaction(1)}
              <span className={styles.playerAmount}>
                {getPlayerAmountMsg(1)}
              </span>
            </h2>
            {team2}
          </PlayerListColumn>
          <PlayerListColumn>
            <h2 className={styles.PlayerGroupName}>
              {t("server.players.spectators")}{" "}
              <span className={styles.playerAmount}>
                {getSectatorAmountMsg()}
              </span>
            </h2>
            {specs}
          </PlayerListColumn>
        </TopRow>
      ) : (
        <>
          <TopRow>
            <PlayerListColumn>
              <h2 className={styles.PlayerGroupName}>
                {getFaction(0)}
                <span className={styles.playerAmount}>
                  {getPlayerAmountMsg(0)}
                </span>
              </h2>
              {team1}
            </PlayerListColumn>
            <PlayerListColumn>
              <h2 className={styles.PlayerGroupName}>
                {getFaction(1)}
                <span className={styles.playerAmount}>
                  {getPlayerAmountMsg(1)}
                </span>
              </h2>
              {team2}
            </PlayerListColumn>
          </TopRow>
          <TopRow>
            <PlayerListColumn>
              <h2 className={styles.PlayerGroupName}>
                {t("server.players.spectators")}{" "}
                <span className={styles.playerAmount}>
                  {getSectatorAmountMsg()}
                </span>
              </h2>
              {specs}
            </PlayerListColumn>
          </TopRow>
        </>
      )}
    </div>
  );
}

function PlayerListColumn(
  props: Readonly<{
    children: React.ReactElement | React.ReactElement[] | string;
  }>,
) {
  const { children } = props;
  return (
    <Column>
      <Card>{children}</Card>
    </Column>
  );
}

function LoadingListPlayerGroup(props: Readonly<{ amount: number }>) {
  const { amount } = props;
  return (
    <div>
      {Array.from({ length: amount }, (_, i) => i).map((_, i) => (
        <LoadingPlayer key={i} />
      ))}
    </div>
  );
}

function PlayerListMessage(props: {
  children: React.ReactElement | React.ReactElement[] | string;
}) {
  const { children } = props;
  return <div className={styles.PlayerListMessage}>{children}</div>;
}

function LoadingPlayer() {
  return (
    <div className={styles.PlayerRowLoading}>
      <span className={styles.LoadingText}></span>
    </div>
  );
}

function ListPlayerGroup(
  props: Readonly<{
    seederPlayers: Map<number, ISeederServerPlayer>;
    team: string;
    players: IServerPlayer[];
    sid: string;
    gameName: string | boolean;
    checkBanInfo: IManagerPlayers;
    checkBanLoading: boolean;
    checkBanError: boolean;
  }>,
): React.ReactElement {
  const { team, sid, gameName, seederPlayers } = props;
  let { players } = props;
  const [playerListRef, { width }] = useMeasure();
  const [playerListSort] = React.useContext(PageContext);

  const moveTeam = !!team ? (team === "0" ? "1" : "2") : false;
  players = players.sort(DynamicSort(playerListSort));
  return (
    <div ref={playerListRef}>
      {players.map((player: IServerPlayer, index: number) => (
        <Player
          seederPlayer={seederPlayers.get(player.playerId)}
          gameName={gameName}
          player={player}
          key={index}
          i={index}
          moveTeam={moveTeam}
          width={width}
          sid={sid}
          checkBanInfo={props.checkBanInfo}
          checkBanLoading={props.checkBanLoading}
          checkBanError={props.checkBanError}
        />
      ))}
    </div>
  );
}

function CheckBanHover(
  checkBanInfo: IManagerPlayers,
  playerId: number,
  t: useTranslation,
): { color: string; hoverText: string | undefined } {
  const playerInfo = checkBanInfo?.bfban[playerId];
  const bfeac = checkBanInfo?.bfeac?.includes(playerId);
  const vbanCount = Object.keys(checkBanInfo?.vban[playerId] || {})?.length;
  const usedNameCount = checkBanInfo?.otherNames[playerId]?.usedNames?.length;

  if (playerInfo?.status === 1) {
    return { color: "#DC143C", hoverText: t("checkban.hacker.bfban") };
  }
  if (bfeac) {
    return { color: "#DC143C", hoverText: t("checkban.hacker.bfeac") };
  }
  if (vbanCount > 0) {
    return {
      color: "#dc5314",
      hoverText: t("checkban.warn.vban", { amount: vbanCount }),
    };
  }
  if (usedNameCount > 5) {
    return {
      color: "#dc5314",
      hoverText: t("checkban.warn.nameChange", { amount: usedNameCount }),
    };
  }
  return { color: undefined, hoverText: undefined };
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
export function Player(
  props: Readonly<{
    player: IServerPlayer;
    seederPlayer: ISeederServerPlayer;
    i: number;
    sid: string;
    moveTeam: string | boolean;
    width: number;
    gameName: string | boolean;
    checkBanInfo: IManagerPlayers;
    checkBanLoading: boolean;
    checkBanError: boolean;
  }>,
): React.ReactElement {
  const { player, i, sid, moveTeam, width, gameName, seederPlayer } = props;
  const modal = useModal();
  const { t } = useTranslation();
  const dateAdded = new Date(player.joinTime / 1000);

  // Show player stats modal
  const showStats = () => {
    return modal.show(
      <PlayerStatsModal player={player.name} playerId={player.playerId} />,
    );
  };

  const checkban = CheckBanHover(props.checkBanInfo, player.playerId, t);
  const timeItem = JSON.parse(t("shortChange", { change: dateAdded }));

  return (
    <div className={styles.PlayerRow}>
      {width > 550 && (
        <span className={styles.PlayerIndex} value="slot">
          {i + 1}
        </span>
      )}

      <span className={styles.PlayerLevel} value="rank">
        {player.rank === null ? "??" : player.rank}
      </span>

      {seederPlayer && (
        <img
          height="14rem"
          style={{ marginRight: "0.2rem" }}
          src={seederPlayer.player_class?.white}
          loading="lazy"
        />
      )}

      <span
        style={{ color: checkban.color }}
        className={styles.PlayerName}
        onClick={showStats}
        title={checkban.hoverText}
        value="nickname"
      >
        {player.platoon === "" ? "" : `[${player.platoon}] `}
        {player.name}
      </span>
      {width > 360 && (
        <span
          className={styles.PlayerTimer}
          style={{ whiteSpace: "nowrap", overflow: "hidden" }}
          title=""
          value="jointime"
        >
          {t(
            `shortTimeItems.${timeItem?.token}.${timeItem?.count > 1 ? "other" : "one"
            }`,
            { count: timeItem?.count },
          )}
          {seederPlayer
            ? ` - ${seederPlayer?.score} score - ${seederPlayer?.kills}/${seederPlayer?.deaths} KD`
            : ""}
        </span>
      )}

      <span className={styles.PlayerNone} />

      <PlayerButtons
        gameName={gameName}
        player={player}
        sid={sid}
        moveTeam={moveTeam}
        width={width}
      />
      {width > 300 && <PlayerPing ping={player.ping} />}
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
function PlayerButtons(
  props: Readonly<{
    player: IServerPlayer;
    sid: string;
    moveTeam: string | boolean;
    width: number;
    gameName: string | boolean;
  }>,
) {
  const { player, sid, moveTeam, width, gameName } = props;
  const { t } = useTranslation();
  const modal = useModal();
  const movePlayer = useMovePlayer();

  // Show Ban player Modal
  const showBan = () => {
    modal.show(<ServerBanPlayer sid={sid} playerInfo={player} />);
  };

  // Show Kick player modal
  const showKick = () => {
    modal.show(
      <ServerKickPlayer
        sid={sid}
        eaid={player.name}
        playerId={player.playerId}
        userId={player.userId}
      />,
    );
  };

  // Try to move player
  const moveCallback = () => {
    movePlayer.mutate({
      sid,
      name: player.name,
      team: moveTeam,
      playerId: player.playerId,
    });
  };

  const playerOptions = [{ name: t("server.action.kick"), callback: showKick }];

  if (gameName !== "bfv") {
    playerOptions.push({ name: t("server.action.ban"), callback: showBan });
  }

  if (gameName === "bf1") {
    // If movable, add move button
    if (!!moveTeam) {
      playerOptions.push({
        name: t("server.action.move"),
        callback: moveCallback,
      });
    }
  }

  // If too small, show button listing instead
  if (width < 480) {
    return (
      <PlayerDropdownButton
        options={playerOptions}
        name="☰"
      ></PlayerDropdownButton>
    );
  }

  // Return Buttons in a row
  return (
    <div className={styles.PlayerButtons}>
      {playerOptions.map(({ name, callback }, key) => (
        <PlayerButton onClick={callback} key={key}>
          {name}
        </PlayerButton>
      ))}
    </div>
  );
}

/**
 * Player Button styled component
 * @param {Object} props
 * @param {React.ReactChild} props.children
 * @param {Function} props.onClick - callback
 * @returns React element
 */
function PlayerButton(props: {
  children: React.ReactElement | React.ReactElement[] | string;
  onClick: (args0: any) => void;
}): React.ReactElement {
  const { children, onClick } = props;
  return (
    <button className={styles.PlayerButton} onClick={onClick}>
      {children}
    </button>
  );
}

/**
 * Display player ping as an element with icon
 * @param {Object} props
 * @param {String} props.ping - Player Ping
 * @returns React element
 */
function PlayerPing(props: { ping: number }): React.ReactElement {
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
  );
}
