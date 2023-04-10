import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ServerUnbanPlayer, ServerUnvipPlayer } from "./Modals";
import { PageContext } from "./ServerGlobalContext";
import { useMeasure } from "react-use";
import noServerImg from "../assets/img/no-server-image.png";

import buttonStyle from "../components/Buttons.module.css";
import { Button, ButtonRow, ButtonUrl, TextInput } from "../components/Buttons";
import { DynamicSort } from "../components/Functions";
import { Row } from "../components/Flex";
import { useModal } from "../components/Card";
import { ClickableHead } from "../components/Table";

import { OperationsApi } from "../api/api";
import { bfvServerRegions } from "../Globals";
import "../locales/config";

import styles from "./Styles.module.css";

import { PlayerStatsModal } from "./Modals";
import {
  IBan,
  IBanList,
  IBfvPlayground,
  IBfvPlaygrounds,
  IFireStarter,
  IFirestarterList,
  IInfo,
  IInfoList,
  IInGameServerInfo,
  IPlayerLog,
  IPlayerLogPlayer,
  IPlayingScoreboard,
  IPlayingScoreboardPlayer,
  IServerInfo,
  IServerRotation,
} from "../api/ReturnTypes";
import { UseQueryResult } from "@tanstack/react-query/build/lib/types";

export function SmallText(props: {
  children: React.ReactElement | React.ReactElement[] | string;
}): React.ReactElement {
  return <span className={styles.SmallText}>{props.children}</span>;
}

export function ServerRotation(props: {
  server: IServerInfo;
  game: IInGameServerInfo;
  rotate: (arg0: string) => void;
}): React.ReactElement {
  const dbServer = props.server;
  const { t } = useTranslation();
  let server = null,
    game = null;
  if (props.game && props.game.data && props.game.data.length > 0) {
    server = props.game.data[0];
    game = server.info;
  }

  let server_status = (
    <span className={styles.serverBadgePending}>
      {t("serverStatus.pending")}
    </span>
  );

  if (server) {
    if (server.isAdmin) {
      server_status = (
        <span className={styles.serverBadgeOk}>
          <span className={styles.liveUpdate}></span>
          {t("serverStatus.running")}
        </span>
      );
    } else {
      server_status = (
        <span className={styles.serverBadgeErr}>
          {t("serverStatus.noAdmin")}
        </span>
      );
    }
    if (server.serverStatus === "noServer") {
      server_status = (
        <span className={styles.serverBadgeErr}>
          {t("serverStatus.noServer")}
        </span>
      );
    }
  }
  let update_timestamp = new Date();
  let worker_timestamp = new Date();
  if (server) {
    update_timestamp = new Date(server.update_timestamp);
    worker_timestamp = new Date(server.worker_timestamp);
  }
  const [rotationId, setRotationId] = React.useState("");
  const [playerListSort, setPlayerListSort] = React.useContext(PageContext);
  const [serverInfoRef, { width }] = useMeasure();

  return (
    <div
      ref={serverInfoRef}
      style={{ width: "100%" }}
      className={styles.ServerInfoColumn}
    >
      <div className={styles.ServerDescriptionRow}>
        <img
          className={styles.serverImage}
          alt="Server map"
          src={game ? game.url : noServerImg}
        />
        <div className={styles.GameInfo}>
          <span className={styles.ServerName}>
            {game ? game.prefix : t("loading")}
          </span>
          <SmallText>
            {game
              ? `${game.map.toUpperCase()} - ${t(
                  `gamemodes.${game.mode.toUpperCase()}`,
                )} - ${game.serverInfo} ${t("server.game.info", {
                  inQue: game.inQue,
                })}`
              : "-"}
          </SmallText>
          {width > 610 ? (
            <>
              <span className={styles.serverBadge}>
                {server_status} - {t("server.game.playerlistUpdate")}{" "}
                {t("change", { change: update_timestamp })} {t("server.ago")} -
                Last worker update {t("change", { change: worker_timestamp })}{" "}
                {t("server.ago")}
              </span>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
      {width <= 610 ? (
        <>
          <span className={styles.serverBadge}>
            {server_status} - {t("server.game.playerlistUpdate")}{" "}
            {t("change", { change: update_timestamp })} {t("server.ago")}
          </span>
          <span className={styles.serverBadge}>
            Last worker update {t("change", { change: worker_timestamp })}{" "}
            {t("server.ago")}
          </span>
          <div style={{ padding: "5px" }} />
        </>
      ) : (
        <div style={{ paddingTop: "5px" }} />
      )}
      {dbServer && dbServer.game === "bf1" ? (
        <>
          <ButtonRow>
            <Button
              name={t("server.game.restart")}
              disabled={!game}
              callback={() => props.rotate(game ? game.rotationId : null)}
            />
            <select
              className={styles.SwitchGame}
              value={rotationId}
              onChange={(e) => setRotationId(e.target.value)}
            >
              <option value="">{t("server.game.mapSwitch")}</option>
              {game
                ? game.rotation.map((value: IServerRotation, index: number) => (
                    <option value={value.index} key={index}>
                      {t(`maps.${value.mapname}`)} -{" "}
                      {t(`gamemodes.${value.mode.toUpperCase()}`)}
                    </option>
                  ))
                : ""}
            </select>
            {rotationId !== "" ? (
              <Button
                name={t("apply")}
                disabled={!game}
                callback={() => {
                  props.rotate(game ? rotationId : null);
                  setRotationId("");
                }}
              />
            ) : (
              ""
            )}
          </ButtonRow>
        </>
      ) : (
        <></>
      )}
      {dbServer && dbServer.game === "bfv" ? (
        <BfvServerManagement
          sid={dbServer.id}
          serverName={dbServer.serverName}
        />
      ) : (
        <></>
      )}
      <ButtonRow>
        <select
          className={styles.SwitchGame}
          value={playerListSort}
          onChange={(e) => setPlayerListSort(e.target.value)}
        >
          <option value="position">{t("server.players.sort.main")}</option>
          <option value="position">{t("server.players.sort.position")}</option>
          <option value="-ping">{t("server.players.sort.ping")}</option>
          <option value="name">{t("server.players.sort.name")}</option>
          <option value="-rank">{t("server.players.sort.rank")}</option>
          <option value="joinTime">{t("server.players.sort.joinTime")}</option>
        </select>
      </ButtonRow>
    </div>
  );
}

function BfvServerManagement(props: {
  sid: string;
  serverName: string;
}): React.ReactElement {
  const { sid, serverName } = props;
  const [playgroundId, setPlaygroundId] = React.useState("");
  const [checksum, setChecksum] = React.useState("");
  const [serverRegion, setServerRegion] = React.useState("");
  const [applyStatus, setApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState("Unknown");
  const { t } = useTranslation();

  const bfvCreateServer = useMutation(
    (_: {
      sid: string;
      playgroundId: string;
      checksum: string;
      serverRegion: string;
    }) =>
      OperationsApi.bfvCreateServer({
        sid,
        playgroundId,
        checksum,
        serverRegion,
      }),
    {
      onMutate: async () => {
        setApplyStatus(true);
      },
      onSuccess: async () => {
        setApplyStatus(null);
      },
      onError: async (error: React.SetStateAction<string>) => {
        setApplyStatus(false);
        setError(error);
        setTimeout(() => setApplyStatus(null), 2000);
      },
      onSettled: async () => {
        undefined;
      },
    },
  );

  const {
    isError,
    data: playgroundList,
    error,
  }: UseQueryResult<
    IBfvPlaygrounds,
    { code: number; message: string }
  > = useQuery(["bfvplaygrounds" + sid], () =>
    OperationsApi.getBfvPlaygrounds({ sid }),
  );
  if (!playgroundList) {
    // TODO: add fake item list on loading
    return <>{t("loading")}</>;
  }

  if (isError) {
    return <>{`Error ${error.code}: ${error.message}`}</>;
  }

  const isDisabled =
    checksum === "" || playgroundId === "" || serverRegion === "";

  return (
    <ButtonRow>
      <select
        className={styles.SwitchGame}
        value={playgroundId}
        onChange={(e) => {
          playgroundList.playgrounds.forEach((element: IBfvPlayground) => {
            if (element.playgroundId === e.target.value) {
              setChecksum(element.checksum);
            }
          });
          setPlaygroundId(e.target.value);
        }}
      >
        <option value="">{t("server.game.bfvPlaygroundSelect")}</option>
        {playgroundList.playgrounds.map((value: IBfvPlayground, i: number) => {
          if (!value.serverdesc.serverName.includes(serverName)) {
            return (
              <option
                style={{ color: "#ffb0b0" }}
                value={value.playgroundId}
                key={i}
              >{`${value.configName} -> ${value.serverdesc.serverName}`}</option>
            );
          } else {
            return (
              <option
                value={value.playgroundId}
                key={i}
              >{`${value.configName} -> ${value.serverdesc.serverName}`}</option>
            );
          }
        })}
      </select>
      <select
        className={styles.SwitchGame}
        value={serverRegion}
        onChange={(e) => setServerRegion(e.target.value)}
      >
        <option value="">{t("server.game.serverRegionSelect")}</option>
        {Object.keys(bfvServerRegions).map((value, i) => (
          <option value={bfvServerRegions[value]} key={i}>
            {value}
          </option>
        ))}
      </select>
      <Button
        name={t("server.game.startServer")}
        disabled={isDisabled}
        callback={() => {
          bfvCreateServer.mutate({ sid, playgroundId, checksum, serverRegion });
        }}
        status={applyStatus}
      />
      <h5
        style={{
          marginBottom: 0,
          alignSelf: "center",
          opacity: applyStatus === false ? 1 : 0,
        }}
      >
        {errorUpdating}
      </h5>
    </ButtonRow>
  );
}

export function ServerInfoHolder(props: {
  children: React.ReactElement | React.ReactElement[] | string;
}): React.ReactElement {
  return <div className={styles.ServerInfoRow}>{props.children}</div>;
}

export function BanList(props: { sid: string }): React.ReactElement {
  const { sid } = props;
  const { t } = useTranslation();
  const {
    isError,
    data: banList,
    error,
  }: UseQueryResult<IBanList, { code: number; message: string }> = useQuery(
    ["serverBanList" + sid],
    () => OperationsApi.getBanList({ sid }),
  );

  const [searchWord, setSearchWord] = React.useState("");
  const [sorting, setSorting] = React.useState("displayName");

  const modal = useModal();
  const showUnban = (e: { target: { dataset: any } }) => {
    const playerInfo = e.target.dataset;
    modal.show(<ServerUnbanPlayer sid={sid} playerInfo={playerInfo} />);
  };

  if (!banList) {
    // TODO: add fake item list on loading
    return <>{t("loading")}</>;
  } else {
    banList.data = banList.data.sort(DynamicSort(sorting));
  }

  if (isError) {
    return <>{`Error ${error.code}: {error.message}`}</>;
  }

  return (
    <div>
      <h5>
        {t("server.banList.description0")}
        <br />
        {t("server.banList.description1")}{" "}
        <b>
          {t("server.banList.description2", { number: banList.data.length })}
        </b>
        .{t("server.banList.description3")}
        <br />
        {t("server.banList.description4")}
      </h5>
      <ButtonRow>
        <TextInput
          name={t("search")}
          callback={(v) => setSearchWord(v.target.value)}
        />
        <ButtonUrl
          href={`https://manager-api.gametools.network/api/infoexcel?type=bannedList&serverid=${props.sid}`}
          name={t("export")}
        />
      </ButtonRow>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ position: "sticky", top: "0" }}>
            <ClickableHead
              current={sorting === "displayName"}
              onClick={() => setSorting("displayName")}
            >
              {t("server.banList.table.playerName")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "id"}
              onClick={() => setSorting("id")}
            >
              {t("server.banList.table.playerId")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "-reason"}
              onClick={() => setSorting("-reason")}
            >
              {t("server.banList.table.reason")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "-admin"}
              onClick={() => setSorting("-admin")}
            >
              {t("server.banList.table.admin")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "-unixBanTimeStamp"}
              onClick={() => setSorting("-unixBanTimeStamp")}
            >
              {t("server.banList.table.until")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "-unixBanUntilTimeStamp"}
              onClick={() => setSorting("-unixBanUntilTimeStamp")}
            >
              {t("server.banList.table.timestamp")}
            </ClickableHead>
            <th></th>
          </thead>
          <tbody>
            {banList.data
              .filter((p: { displayName: string }) =>
                p.displayName.toLowerCase().includes(searchWord.toLowerCase()),
              )
              .map((player: IBan, index: number) => (
                <BanRow player={player} key={index} callback={showUnban} />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BanRow(props: {
  player: IBan;
  callback: (args0: any) => void;
}): React.ReactElement {
  const player = props.player;
  const modal = useModal();
  const { t } = useTranslation();
  return (
    <tr
      className={styles.BanRow}
      onClick={(e: any) =>
        e.target.tagName === "TD"
          ? modal.show(
              <PlayerStatsModal
                player={player.displayName}
                playerId={player.id}
              />,
            )
          : null
      }
    >
      <td title={player.displayName} className={styles.VipName}>
        <div className={styles.VipRowImg}>
          <img src={player.avatar} alt="" />
        </div>
        <span>{player.displayName}</span>
      </td>
      {/* <td className={styles.BanDisplayName}>{player.displayName}</td> */}
      <td title={t("server.banList.table.playerId")}>{player.id}</td>
      <td>{player.reason}</td>
      <td>{player.admin}</td>
      <td>
        {player.banned_until !== ""
          ? t("dateTime", { date: new Date(player.banned_until) })
          : ""}
      </td>
      <td>
        {player.ban_timestamp !== ""
          ? t("dateTime", { date: new Date(player.ban_timestamp) })
          : ""}
      </td>
      <th
        className={styles.listButton}
        data-oid={player.oid}
        data-platform={player.platform}
        data-name={player.displayName}
        data-id={player.id}
        onClick={props.callback}
      >
        {t("server.action.unban")}
      </th>
    </tr>
  );
}

export function FireStarter(props: { sid: string }): React.ReactElement {
  const { sid } = props;
  const { t } = useTranslation();
  const {
    isError,
    data: starterList,
    error,
  }: UseQueryResult<
    IFirestarterList,
    { code: number; message: string }
  > = useQuery(["serverStarterList" + sid], () =>
    OperationsApi.getStarterList({ sid }),
  );

  const [searchWord, setSearchWord] = React.useState("");
  const [sorting, setSorting] = React.useState("-amount");

  if (!starterList) {
    // TODO: add fake item list on loading
    return <>{t("loading")}</>;
  } else {
    starterList.data = starterList.data.sort(DynamicSort(sorting));
  }

  if (isError) {
    return <>{`Error ${error.code}: {error.message}`}</>;
  }

  return (
    <div>
      <h5>
        {t("server.firestarterList.description0")}
        <br />
        {t("server.firestarterList.description1")}
      </h5>
      <ButtonRow>
        <TextInput
          name={t("search")}
          callback={(v) => setSearchWord(v.target.value)}
        />
        <ButtonUrl
          href={`https://manager-api.gametools.network/api/firestartersexcel?serverid=${props.sid}`}
          name={t("export")}
        />
      </ButtonRow>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ position: "sticky", top: "0" }}>
            <ClickableHead
              current={sorting === "playerName"}
              onClick={() => setSorting("playerName")}
            >
              {t("server.firestarterList.table.playerName")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "playerId"}
              onClick={() => setSorting("playerId")}
            >
              {t("server.firestarterList.table.playerId")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "-amount"}
              onClick={() => setSorting("-amount")}
            >
              {t("server.firestarterList.table.amount")}
            </ClickableHead>
          </thead>
          <tbody>
            {starterList.data
              .filter((p: { playerName: string }) =>
                p.playerName.toLowerCase().includes(searchWord.toLowerCase()),
              )
              .map((player: IFireStarter, index: number) => (
                <StarterRow player={player} key={index} />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StarterRow(props: { player: IFireStarter }): React.ReactElement {
  const player = props.player;
  const modal = useModal();
  const { t } = useTranslation();
  return (
    <tr
      className={styles.BanRow}
      onClick={() =>
        modal.show(
          <PlayerStatsModal
            player={player.playerName}
            playerId={player.playerId}
          />,
        )
      }
    >
      <td className={styles.BanDisplayName}>
        {player.platoon !== "" ? `[${player.platoon}] ` : null}
        {player.playerName}
      </td>
      <td title={t("server.firestarterList.table.playerId")}>
        {player.playerId}
      </td>
      <td>{player.amount}</td>
    </tr>
  );
}

export function PlayTime(props: { sid: string }): React.ReactElement {
  const { sid } = props;
  const { t } = useTranslation();
  const {
    isError,
    data: playTimeList,
    error,
  }: UseQueryResult<
    IPlayingScoreboard,
    { code: number; message: string }
  > = useQuery(["playTimeList" + sid], () =>
    OperationsApi.getPlayTimeList({ sid }),
  );

  const [searchWord, setSearchWord] = React.useState("");
  const [sorting, setSorting] = React.useState("-timePlayed");

  if (!playTimeList) {
    // TODO: add fake item list on loading
    return <>{t("loading")}</>;
  } else {
    playTimeList.data = playTimeList.data.sort(DynamicSort(sorting));
  }

  if (isError) {
    return <>{`Error ${error.code}: {error.message}`}</>;
  }

  return (
    <div>
      <h5>
        {t("server.playTimeList.description0")}
        <br />
        {t("server.playTimeList.description1")}
      </h5>
      <ButtonRow>
        <TextInput
          name={t("search")}
          callback={(v) => setSearchWord(v.target.value)}
        />
        <ButtonUrl
          href={`https://manager-api.gametools.network/api/playingscoreboardexcel?serverid=${props.sid}`}
          name={t("export")}
        />
      </ButtonRow>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ position: "sticky", top: "0" }}>
            <ClickableHead
              current={sorting === "name"}
              onClick={() => setSorting("name")}
            >
              {t("server.playTimeList.table.playerName")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "playerId"}
              onClick={() => setSorting("playerId")}
            >
              {t("server.playTimeList.table.playerId")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "-timePlayed"}
              onClick={() => setSorting("-timePlayed")}
            >
              {t("server.playTimeList.table.timePlayed")}
            </ClickableHead>
          </thead>
          <tbody>
            {playTimeList.data
              .filter((p: { name: string }) =>
                p.name.toLowerCase().includes(searchWord.toLowerCase()),
              )
              .map((player: IPlayingScoreboardPlayer, index: number) => (
                <PlayTimeRow player={player} key={index} />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlayTimeRow(props: {
  player: IPlayingScoreboardPlayer;
}): React.ReactElement {
  const { player } = props;
  const modal = useModal();
  const { t } = useTranslation();

  const hours = Math.floor(player.timePlayed / 3600);
  const onlyMins = player.timePlayed % 3600;
  const minutes = Math.floor(onlyMins / 60);

  // Local time
  const datetime = `${hours}:${("0" + minutes).slice(-2)}`;

  return (
    <tr
      className={styles.BanRow}
      onClick={() =>
        modal.show(
          <PlayerStatsModal player={player.name} playerId={player.playerId} />,
        )
      }
    >
      <td className={styles.BanDisplayName}>
        {player.platoon !== "" ? `[${player.platoon}] ` : null}
        {player.name}
      </td>
      <td title={t("server.playTimeList.table.playerId")}>{player.playerId}</td>
      <td>{datetime}</td>
    </tr>
  );
}

export function Spectator(props: { sid: string }): React.ReactElement {
  const sid = props.sid;
  const { t } = useTranslation();
  const {
    isError,
    data: spectatorList,
    error,
  }: UseQueryResult<any, { code: number; message: string }> = useQuery(
    ["serverSpectatorList" + sid],
    () => OperationsApi.getSpectatorList({ sid }),
  );

  const [searchWord, setSearchWord] = React.useState("");
  const [sorting, setSorting] = React.useState("name");

  if (!spectatorList) {
    // TODO: add fake item list on loading
    return <>{t("loading")}</>;
  } else {
    spectatorList.data = spectatorList.data.sort(DynamicSort(sorting));
  }

  if (isError) {
    return <>{`Error ${error.code}: {error.message}`}</>;
  }

  return (
    <div>
      <h5>
        {t("server.spectatorList.description0")}
        <br />
        {t("server.spectatorList.description1")}
        <br />
        {t("server.spectatorList.description2")}
      </h5>
      <ButtonRow>
        <TextInput
          name={t("search")}
          callback={(v) => setSearchWord(v.target.value)}
        />
        <ButtonUrl
          href={`https://manager-api.gametools.network/api/spectatorsexcel?serverid=${props.sid}`}
          name={t("export")}
        />
      </ButtonRow>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ position: "sticky", top: "0" }}>
            <ClickableHead
              current={sorting === "name"}
              onClick={() => setSorting("name")}
            >
              {t("server.spectatorList.table.playerName")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "playerId"}
              onClick={() => setSorting("playerId")}
            >
              {t("server.spectatorList.table.playerId")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "-unixTimeStamp"}
              onClick={() => setSorting("-unixTimeStamp")}
            >
              {t("server.spectatorList.table.time")}
            </ClickableHead>
          </thead>
          <tbody>
            {spectatorList.data
              .filter((p: { name: string }) =>
                p.name.toLowerCase().includes(searchWord.toLowerCase()),
              )
              .map((player: any, index: number) => (
                <SpectatorRow player={player} key={index} />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SpectatorRow(props: { player: any }): React.ReactElement {
  const player = props.player;
  const modal = useModal();
  const { t } = useTranslation();

  // var datetime = new Date(Date.parse(player.timeStamp));
  const datetime = new Date(player.timeStamp);
  // const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Local time
  // datetime = `${datetime.getUTCDate()} ${months[datetime.getMonth()]} ${datetime.getFullYear()} ${String(datetime.getHours()).padStart(2, '0')}:${String(datetime.getMinutes()).padStart(2, '0')}`;

  return (
    <tr
      className={styles.BanRow}
      onClick={() =>
        modal.show(
          <PlayerStatsModal player={player.name} playerId={player.playerId} />,
        )
      }
    >
      <td className={styles.BanDisplayName}>
        {player.platoon !== "" ? `[${player.platoon}] ` : null}
        {player.name}
      </td>
      <td title={t("server.spectatorList.table.playerId")}>
        {player.playerId}
      </td>
      <td>{t("dateTime", { date: datetime })}</td>
    </tr>
  );
}

export function Playerlogs(props: { sid: string }): React.ReactElement {
  const { sid } = props;
  const { t } = useTranslation();

  const [date, setDate] = React.useState("-");
  const [searchPlayer, setSearchPlayer] = React.useState("");
  const [searchField, setSearchField] = React.useState("");

  const {
    isError,
    data,
    error,
  }: UseQueryResult<IPlayerLog, { code: number; message: string }> = useQuery(
    ["serverPlayerLogList" + date + sid + searchPlayer],
    () => OperationsApi.getPlayerLogList({ sid, date, searchPlayer }),
  );

  return (
    <div>
      <h5>
        {t("server.playerLogs.description0")}
        <br />
        {t("server.playerLogs.description1")}
        <br />
        {t("server.playerLogs.description2")}
        <br />
        <br />
        {t("server.playerLogs.description3")}
      </h5>
      <Row>
        <TextInput
          id="textInput"
          name={t("server.playerLogs.filterPlayer")}
          style={{ marginRight: "12px" }}
          callback={(v) => setSearchField(v.target.value)}
        />
        <ButtonRow>
          <Button
            name="Search"
            disabled={searchField === ""}
            callback={() => setSearchPlayer(searchField)}
          />
          <Button
            name="Reset"
            disabled={searchPlayer === ""}
            callback={() => {
              setSearchPlayer("");
              setSearchField("");
              document.getElementsByTagName("input")[0].value = "";
            }}
          />
        </ButtonRow>
      </Row>

      <PlayerLogInfo
        data={data}
        setDate={setDate}
        sid={sid}
        date={date}
        error={error}
        isError={isError}
      />
    </div>
  );
}

function PlayerLogInfo(props: {
  data: IPlayerLog;
  isError: boolean;
  setDate: (arg0?: React.SetStateAction<string> | number) => void;
  sid: string;
  date: string;
  error: { code: number; message: string };
}): React.ReactElement {
  const { t } = useTranslation();
  const playerLogList = props.data;
  const [dateIndex, setDateIndex] = React.useState(0);
  const [searchWord, setSearchWord] = React.useState("");
  const [sorting, setSorting] = React.useState("name");

  if (props.isError) {
    return <>{`Error, no info found for that playername`}</>;
  }

  if (!playerLogList) {
    // TODO: add fake item list on loading
    return <>{t("loading")}</>;
  } else {
    playerLogList.data = playerLogList.data.sort(DynamicSort(sorting));
  }

  const arrowLeft = (
    <svg className={styles.uiIcion} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z"
      />
    </svg>
  );

  const arrowRight = (
    <svg className={styles.uiIcion} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
      />
    </svg>
  );

  return (
    <>
      <Row>
        <TextInput
          style={{ marginRight: "12px" }}
          name={t("server.playerLogs.search")}
          callback={(v) => setSearchWord(v.target.value)}
        />
        <ButtonRow>
          <Button
            name="Left"
            content={arrowLeft}
            disabled={dateIndex === 0}
            callback={() => {
              if (dateIndex > 0) {
                setDateIndex(dateIndex - 1);
                props.setDate(playerLogList.intDates[dateIndex]);
              }
            }}
          />
          <select
            className={buttonStyle.dropdownButton}
            value={dateIndex}
            onChange={(event) => {
              setDateIndex(parseInt(event.target.value));
              props.setDate(playerLogList.intDates[dateIndex]);
            }}
          >
            {playerLogList.dates.map((value: string, index: number) => {
              const datetime = new Date(value);
              return (
                <option value={index} key={index}>
                  {t("shortDateTime", { date: datetime })}
                </option>
              );
            })}
          </select>
          <Button
            name="Right"
            content={arrowRight}
            disabled={dateIndex === playerLogList.intDates.length}
            callback={() => {
              if (dateIndex !== playerLogList.intDates.length) {
                setDateIndex(dateIndex + 1);
                props.setDate(playerLogList.intDates[dateIndex]);
              }
            }}
          />
          <ButtonUrl
            href={`https://manager-api.gametools.network/api/playerloglistexcel?serverid=${props.sid}&date=${props.date}`}
            name={t("export")}
          />
        </ButtonRow>
      </Row>

      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ position: "sticky", top: "0" }}>
            <ClickableHead
              current={sorting === "name"}
              onClick={() => setSorting("name")}
            >
              {t("server.playerLogs.table.playerName")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "playerId"}
              onClick={() => setSorting("playerId")}
            >
              {t("server.playerLogs.table.playerId")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "-ping"}
              onClick={() => setSorting("-ping")}
            >
              {t("server.playerLogs.table.ping")}
            </ClickableHead>
            <ClickableHead
              current={sorting === "role"}
              onClick={() => setSorting("role")}
            >
              {t("server.playerLogs.table.role")}
            </ClickableHead>
          </thead>
          <tbody>
            {playerLogList.data
              .filter((p: IPlayerLogPlayer) =>
                p.name.toLowerCase().includes(searchWord.toLowerCase()),
              )
              .map((player: IPlayerLogPlayer, index: number) => (
                <PlayerlogsRow player={player} key={index} />
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PlayerlogsRow(props: {
  player: IPlayerLogPlayer;
}): React.ReactElement {
  const modal = useModal();
  const player = props.player;
  const { t } = useTranslation();

  return (
    <tr
      className={styles.BanRow}
      onClick={() =>
        modal.show(
          <PlayerStatsModal player={player.name} playerId={player.playerId} />,
        )
      }
    >
      <td className={styles.BanDisplayName}>
        {player.platoon !== "" ? `[${player.platoon}] ` : null}
        {player.name}
      </td>
      <td title={t("server.playerLogs.table.playerId")}>{player.playerId}</td>
      <td>{player.ping}</td>
      <td>{player.role}</td>
    </tr>
  );
}

export function VipList(props: {
  sid: string;
  game: IInGameServerInfo;
}): React.ReactElement {
  const sid = props.sid;
  const { t } = useTranslation();
  const {
    isError,
    data: vipList,
    error,
  }: UseQueryResult<IInfoList, { code: number; message: string }> = useQuery(
    ["serverVipList" + sid],
    () => OperationsApi.getVipList({ sid }),
  );

  const [searchWord, setSearchWord] = React.useState("");
  const [sorting, setSorting] = React.useState("displayName");

  let server = null;
  if (props.game && props.game.data && props.game.data.length > 0) {
    server = props.game.data[0];
  }
  const isOpsMode = server.info.mode.toLowerCase() === "operations";

  const modal = useModal();
  const showUnvip = (e: { target: { dataset: any } }) => {
    const playerInfo = e.target.dataset;
    modal.show(
      <ServerUnvipPlayer
        sid={sid}
        eaid={playerInfo.name}
        playerId={playerInfo.id}
      />,
    );
  };

  if (!vipList) {
    // TODO: add fake item list on loading
    return <>{t("loading")}</>;
  } else {
    vipList.data = vipList.data.sort(DynamicSort(sorting));
  }

  if (isError) {
    return <>{`Error ${error.code}: {error.message}`}</>;
  }

  return (
    <div>
      <div className={styles.VipHeader}>
        <ButtonRow>
          <TextInput
            name={t("search")}
            callback={(v) => setSearchWord(v.target.value)}
          />
          <ButtonUrl
            href={`https://manager-api.gametools.network/api/infoexcel?type=vipList&serverid=${props.sid}`}
            name={t("export")}
          />
        </ButtonRow>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h5 style={{ marginBottom: 0 }}>
            {t("server.vipList.description0")}
            <br />
            {t("server.vipList.description1")}
            <b>
              {t("server.vipList.description2", {
                number: vipList.data.length,
              })}
            </b>
            .
          </h5>
        </div>
      </div>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ position: "sticky", top: "0" }}>
            <tr>
              <ClickableHead
                current={sorting === "displayName"}
                onClick={() => setSorting("displayName")}
              >
                {t("server.vipList.table.playerName")}
              </ClickableHead>
              <ClickableHead
                current={sorting === "id"}
                onClick={() => setSorting("id")}
              >
                {t("server.vipList.table.playerId")}
              </ClickableHead>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vipList.data
              .filter((p: IInfo) =>
                p.displayName.toLowerCase().includes(searchWord.toLowerCase()),
              )
              .map((player: IInfo, i: number) => (
                <VipRow
                  player={player}
                  key={i}
                  callback={showUnvip}
                  isOpsMode={isOpsMode}
                />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VipRow(props: {
  player: IInfo;
  isOpsMode: boolean;
  callback: (args0: any) => void;
}): React.ReactElement {
  const player = props.player;
  const modal = useModal();
  const { t } = useTranslation();
  return (
    <tr
      className={styles.VipRow}
      onClick={(e: any) =>
        e.target.tagName === "TD"
          ? modal.show(
              <PlayerStatsModal
                player={player.displayName}
                playerId={player.id}
              />,
            )
          : null
      }
    >
      <td title={player.displayName} className={styles.VipName}>
        <div className={styles.VipRowImg}>
          <img src={player.avatar} alt="" />
        </div>
        <span>{player.displayName}</span>
      </td>
      <td title={t("server.vipList.table.playerId")}>{player.id}</td>
      {!props.isOpsMode ? (
        <th
          className={styles.listButton}
          data-name={player.displayName}
          data-id={player.id}
          onClick={props.callback}
        >
          {t("server.action.removeVip")}
        </th>
      ) : (
        <></>
      )}
    </tr>
  );
}

export function AdminList(props: { sid: string }): React.ReactElement {
  const { sid } = props;
  const { t } = useTranslation();
  const {
    isError,
    data: adminList,
    error,
  }: UseQueryResult<IInfoList, { code: number; message: string }> = useQuery(
    ["serverAdminList" + sid],
    () => OperationsApi.getAdminList({ sid }),
  );

  const [searchWord, setSearchWord] = React.useState("");
  const [sorting, setSorting] = React.useState("displayName");

  if (!adminList) {
    // TODO: add fake item list on loading
    return <>{t("loading")}</>;
  } else {
    adminList.data = adminList.data.sort(DynamicSort(sorting));
  }

  if (isError) {
    return <>{`Error ${error.code}: {error.message}`}</>;
  }

  return (
    <div>
      <div className={styles.VipHeader}>
        <ButtonRow>
          <TextInput
            name={t("search")}
            callback={(v) => setSearchWord(v.target.value)}
          />
          <ButtonUrl
            href={`https://manager-api.gametools.network/api/infoexcel?type=adminList&serverid=${props.sid}`}
            name={t("export")}
          />
        </ButtonRow>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h5 style={{ marginBottom: 0 }}>
            {t("server.adminList.description0")}
            <br />
            {t("server.adminList.description1")}
            <b>
              {t("server.adminList.description2", {
                number: adminList.data.length,
              })}
            </b>
            .
          </h5>
        </div>
      </div>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ position: "sticky", top: "0" }}>
            <tr>
              <ClickableHead
                current={sorting === "displayName"}
                onClick={() => setSorting("displayName")}
              >
                {t("server.adminList.table.playerName")}
              </ClickableHead>
              <ClickableHead
                current={sorting === "id"}
                onClick={() => setSorting("id")}
              >
                {t("server.adminList.table.playerId")}
              </ClickableHead>
            </tr>
          </thead>
          <tbody>
            {adminList.data
              .filter((p: { displayName: string }) =>
                p.displayName.toLowerCase().includes(searchWord.toLowerCase()),
              )
              .map((player: IInfo, i: number) => (
                <AdminRow player={player} key={i} />
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminRow(props: { player: IInfo }): React.ReactElement {
  const player = props.player;
  const modal = useModal();
  const { t } = useTranslation();
  return (
    <tr
      className={styles.VipRow}
      onClick={() =>
        modal.show(
          <PlayerStatsModal player={player.displayName} playerId={player.id} />,
        )
      }
    >
      <td title={player.displayName} className={styles.VipName}>
        <div className={styles.VipRowImg}>
          <img src={player.avatar} alt="" />
        </div>
        <span>{player.displayName}</span>
      </td>
      <td title={t("server.adminList.table.playerId")}>{player.id}</td>
    </tr>
  );
}
