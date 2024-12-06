import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useMeasure } from "react-use";
import gamestatsLogo from "../assets/img/game-stats.png?format=webp&useResponsiveLoader=true";
import { supportedGames } from "../Globals";
import {
  GroupGlobalUnbanPlayer,
  GroupRemoveExclusionPlayer,
  GroupRemoveReason,
  GroupRemoveTrackedPlayer,
} from "./Modals";

import { OperationsApi } from "../api/api";
import "../locales/config";
import * as styles from "./Group.module.css";

import { UseMeasureRef } from "react-use/lib/useMeasure";
import { GametoolsApi } from "../api/GametoolsApi";
import { ICurrentServerInfo } from "../api/GametoolsReturnTypes";
import {
  IDevGroup,
  IGlobalGroupPlayerInfo,
  IGroupServer,
  IReason,
  IReasonList,
  ISeeder,
  ISeederInfo,
  ISeederServer,
  ITailUserLog,
  ITailUserLogInfo,
  ITotalCount,
  IUserInfo,
} from "../api/ReturnTypes";
import {
  Button,
  ButtonRow,
  ButtonUrl,
  IconNotSelected,
  IconSelected,
  ReasonDropdownButton,
  Switch,
  TextInput,
} from "../components/Buttons";
import { useModal } from "../components/Card";
import { DynamicSort } from "../components/Functions";
import { RowLoading } from "../components/User";
import { PlayerStatsModal } from "../Server/Modals";

export function GroupRow(props: { group: IDevGroup }): React.ReactElement {
  const { t } = useTranslation();
  const group = props.group;

  const [groupListRef, { width }] = useMeasure();
  return (
    <Link
      ref={groupListRef}
      className={styles.GroupRow}
      to={"/group/" + group.id}
    >
      <span className={styles.GroupName}>
        {group.groupName}&nbsp;
        <span className={styles.GroupInfo}>
          {t("dev.groupInfo", {
            totalAdmins: group?.totalAdmins,
            totalOwners: group?.totalOwners,
            totalServers: group?.totalServers,
          })}
        </span>
      </span>

      {width < 350 ? (
        <span></span>
      ) : (
        <span className={styles.manageDev}>{t("dev.manage")}</span>
      )}
    </Link>
  );
}

export function WorkerStatus(props: {
  worker: boolean;
  lastUpdate: string;
}): React.ReactElement {
  const { t } = useTranslation();
  const workerStatus = props.worker;
  return (
    <div style={{ marginBottom: "1rem" }}>
      {workerStatus ? (
        <span className={styles.serverBadgeOk}>
          {t("group.status.worker.in", {
            time: t("change", { change: new Date(props.lastUpdate) }),
          })}
        </span>
      ) : (
        <span className={styles.serverBadgePending}>
          {t("group.status.worker.queue")}
        </span>
      )}
    </div>
  );
}

export function ServerRow(props: {
  server: IGroupServer;
  button?:
  | React.ReactElement
  | boolean
  | React.ReactFragment
  | React.ReactPortal;
}): React.ReactElement {
  const server = props.server;
  const { t } = useTranslation();

  // If not yet setteled
  if (server.id === null) {
    return (
      <div className={styles.GroupRow}>
        <span className={styles.GroupName}>
          {server.name}
          <span className={styles.serverBadgePending}>
            {t("serverStatus.pending")}
          </span>
        </span>
        {props.button}
      </div>
    );
  }

  let serverStatus = (() => {
    switch (server.status) {
      case "noServer":
        return (
          <span className={styles.serverBadgeErr}>
            {t("serverStatus.noServer")}
          </span>
        );
      case "noAdmin":
        return (
          <span className={styles.serverBadgeErr}>
            {t("serverStatus.noAdmin")}
          </span>
        );
      case "pending":
        return (
          <span className={styles.serverBadgePending}>
            {t("serverStatus.pending")}
          </span>
        );
      default:
        return (
          <span className={styles.serverBadgeOk}>
            {t("serverStatus.running")}
            <span>
              {server.serverPlayers.playerAmount}/
              {server.serverPlayers.maxPlayerAmount}
            </span>
          </span>
        );
    }
  })();

  const directTo = supportedGames.includes(server.game)
    ? "/server/" + server.id
    : "/statusserver/" + server.id;
  serverStatus = supportedGames.includes(server.game) ? (
    serverStatus
  ) : (
    <span className={styles.serverBadgeEmpty}>
      {t("serverStatus.notSupported")}
    </span>
  );

  const noPlayers =
    server.serverPlayers.playerAmount === 0 &&
    server.serverPlayers.maxPlayerAmount !== 0;

  serverStatus = !noPlayers ? serverStatus : null;

  const status = (() => {
    switch (server.status) {
      case "noServer":
        return noPlayers ? "none" : "err";
      case "noAdmin":
        return noPlayers ? "none" : "err";
      case "pending":
        return "none";
      default:
        return noPlayers ? "none" : "ok";
    }
  })();

  return (
    <Link className={styles.GroupRow} to={directTo}>
      <Shield status={status} />
      <span className={styles.ServerNameText}>{server.name}</span>
      {serverStatus}
      <span className={styles.GrowNone}></span>
      <span className={styles.ServerAliasName}>
        {t("group.servers.alias", {
          alias:
            server.serverAlias !== "" ? server.serverAlias : t("notApplicable"),
        })}
      </span>
    </Link>
  );
}

function Shield(props: { status: string }) {
  const { status } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      className={
        status === "ok"
          ? styles.shieldOk
          : status === "none"
            ? styles.shieldNone
            : styles.shieldErr
      }
    >
      <path
        fill="currentColor"
        d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z"
      />
    </svg>
  );
}

export function GameStatsAd(): React.ReactElement {
  const { t } = useTranslation();
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={styles.gameStatsAd}
      href="https://discord.com/oauth2/authorize?client_id=714524944783900794&scope=bot&permissions=83968"
    >
      <img alt={t("imageAlts.gamestats")} src={gamestatsLogo.src} />
      <span>{t("group.discord.gamestats")}</span>
    </a>
  );
}

export function VBanList(props: {
  gid: string;
  user: IUserInfo;
}): React.ReactElement {
  const { gid } = props;
  const [searchWord, setSearchWord] = React.useState("");
  const [searchItem, setSearchItem] = React.useState("playerName");
  const { t } = useTranslation();

  const {
    data: totalCount,
  }: UseQueryResult<ITotalCount, { code: number; message: string }> = useQuery({
    queryKey: ["getAutoBanCount" + gid],
    queryFn: () => OperationsApi.getAutoBanCount({ gid }),
  });

  const {
    data,
    error: unknownErrorType,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["globalBanList" + gid, { searchWord, searchItem }],
    queryFn: ({ pageParam = 0 }) =>
      OperationsApi.getAutoBanList({ gid, pageParam, searchWord, searchItem }),
    getNextPageParam: (lastPage) => lastPage.offset,
    initialPageParam: 0,
  });

  const error = unknownErrorType as { code: number; message: string };
  const banList = React.useMemo(
    () => (data ? data?.pages.flatMap((item) => item.results) : []),
    [data],
  );

  const observer = React.useRef<IntersectionObserver>();
  const lastElementRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasNextPage],
  );

  const modal = useModal();
  const showGlobalUnban = (e: {
    target: { dataset: { [string: string]: string } };
  }) => {
    const playerInfo = e.target.dataset;
    modal.show(
      <GroupGlobalUnbanPlayer
        gid={gid}
        eaid={playerInfo.name}
        playerId={playerInfo.id}
      />,
    );
  };

  return (
    <div>
      <h2>{t("group.vban.main")}</h2>
      <h5>
        {t("group.vban.description0")}{" "}
        <b>{t("group.vban.description1", { number: totalCount?.total })}</b>.
      </h5>
      <ButtonRow>
        <TextInput
          name={t("search")}
          callback={(v) => setSearchWord(v.target.value)}
        />
        <select
          className={styles.SwitchGame}
          value={searchItem}
          onChange={(e) => setSearchItem(e.target.value)}
        >
          <option value="playerName">{t("group.vban.table.playerName")}</option>
          <option value="id">{t("group.vban.table.playerId")}</option>
          <option value="reason">{t("group.vban.table.reason")}</option>
          <option value="admin">{t("group.vban.table.admin")}</option>
        </select>
        <Button
          name={t("group.vban.add")}
          callback={() => modal.show(<VbanBanPlayer gid={gid} />)}
        />
        <ButtonUrl
          style={{ marginLeft: 0 }}
          href={`https://manager-api.gametools.network/api/autobanexcel?groupid=${gid}`}
          name={t("export")}
        />
      </ButtonRow>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ position: "sticky", top: "0" }}>
            <th>{t("group.vban.table.playerName")}</th>
            <th>{t("group.vban.table.playerId")}</th>
            <th>{t("group.vban.table.reason")}</th>
            <th>{t("group.vban.table.admin")}</th>
            <th>{t("group.vban.table.bannedUntil")}</th>
            <th>{t("group.vban.table.timestamp")}</th>
            <th></th>
          </thead>
          <tbody>
            {isError && <>{`Error ${error?.code}: ${error?.message}`}</>}
            {!isLoading &&
              !isError &&
              banList.map((player: IGlobalGroupPlayerInfo, i: number) => (
                <GlobalBanRow
                  player={player}
                  key={i}
                  callback={showGlobalUnban}
                  innerRef={banList.length === i + 1 ? lastElementRef : null}
                />
              ))}
            {isFetching && <RowLoading />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GlobalBanRow(props: {
  innerRef: UseMeasureRef<Element>;
  player: IGlobalGroupPlayerInfo;
  callback: (args0: any) => void;
}): React.ReactElement {
  const modal = useModal();
  const player = props.player;
  const { t } = useTranslation();
  return (
    <tr
      ref={props.innerRef}
      className={styles.BanRow}
      onClick={(e: any) =>
        e.target.tagName === "TD"
          ? modal.show(
            <PlayerStatsModal
              player={player.playerName}
              playerId={player.id}
            />,
          )
          : null
      }
    >
      <td>{player.playerName}</td>
      <td className={styles.ListPlayerId}>{player.id}</td>
      <td>{player.reason === "" ? t("group.vban.noReason") : player.reason}</td>
      <td>{player.admin}</td>
      <td>
        <div className={styles.ListFullDate}>
          {player.bannedUntil !== null && player.bannedUntil !== undefined
            ? t("dateTime", { date: new Date(player.bannedUntil) })
            : "-"}
        </div>
        <div className={styles.ListHalfDate}>
          {player.bannedUntil !== null && player.bannedUntil !== undefined
            ? t("date", { date: new Date(player.bannedUntil) })
            : "-"}
        </div>
      </td>
      <td>
        <div className={styles.ListFullDate}>
          {player.timeStamp !== undefined
            ? t("dateTime", { date: new Date(player.timeStamp) })
            : "-"}
        </div>
        <div className={styles.ListHalfDate}>
          {player.timeStamp !== undefined
            ? t("date", { date: new Date(player.timeStamp) })
            : "-"}
        </div>
      </td>
      <th
        className={styles.globalUnban}
        data-name={player.playerName}
        data-id={player.id}
        onClick={props.callback}
      >
        {t("group.vban.unban")}
      </th>
    </tr>
  );
}

export function GroupLogs(props: { gid: string }): React.ReactElement {
  const { gid } = props;
  const [withServers, setWithServers] = React.useState(false);
  const {
    isError,
    data: logList,
    error,
  }: UseQueryResult<ITailUserLog, { code: number; message: string }> = useQuery(
    {
      queryKey: ["groupogList" + gid + withServers],
      queryFn: () => OperationsApi.getGroupLogs({ gid, withServers }),
    },
  );
  const { t } = useTranslation();

  if (isError) {
    return <>{`Error ${error.code}: {error.message}`}</>;
  }

  if (logList) {
    logList.logs.sort(
      (a: { timeStamp: string }, b: { timeStamp: string }) =>
        Date.parse(b.timeStamp) - Date.parse(a.timeStamp),
    );
  }

  return (
    <div>
      <h2>{t("group.logs.main")}</h2>
      <h5>{t("group.logs.description")}</h5>
      <Switch
        checked={withServers}
        name={t("group.logs.serverLogs")}
        callback={(v) => setWithServers(v)}
      />
      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
        {logList
          ? logList.logs.map((log: ITailUserLogInfo, i: number) => (
            <LogRow log={log} key={i} />
          ))
          : Array.from({ length: 8 }, (_, id) => ({ id })).map((_, i) => (
            <EmptyRow key={i} />
          ))}
      </div>
    </div>
  );
}

function LogRow(props: { log: ITailUserLogInfo }): React.ReactElement {
  const { t } = useTranslation();
  const log = props.log;
  const modal = useModal();

  const datetime = new Date(log.timeStamp);
  if (log.userLog) {
    const action = (() => {
      switch (log.action) {
        case "add-autoban":
          return t("group.logs.reasons.addVban");
        case "remove-autoban":
          return t("group.logs.reasons.removeVban");
        case "editGroup":
          return t("group.logs.reasons.editGroup");
        case "addUser":
          return t("group.logs.reasons.addUser");
        case "addOwner":
          return t("group.logs.reasons.addOwner");
        case "addGroup":
          return t("group.logs.reasons.addGroup");
        case "removeOwner":
          return t("group.logs.reasons.removeOwner");
        case "removeUser":
          return t("group.logs.reasons.removeUser");
        default:
          return t("group.logs.reasons.magic");
      }
    })();

    return (
      <div className={styles.logRow}>
        <span className={styles.logAdmin}>{log.adminName}</span>
        <span className={styles.logAction}>{action}</span>
        <span className={styles.logAdmin}>{log.toPlayer}</span>
        <span className={styles.logReason}>{t("server.logs.reason")}</span>
        <span className={styles.groupLogReason}>{log.reason}</span>
        <span className={styles.logTime}>
          {t("shortDateTime", { date: datetime })}
        </span>
        <span className={styles.logShortTime}>
          {t("time", { date: datetime })}
        </span>
      </div>
    );
  } else {
    const action = (() => {
      switch (log.action) {
        case "addServerBan":
          return t("server.logs.reasons.addServerBan");
        case "kickPlayer":
          return t("server.logs.reasons.kickPlayer");
        case "removeServerBan":
          return t("server.logs.reasons.removeServerBan");
        case "addServerVip":
          return t("server.logs.reasons.addServerVip");
        case "movePlayer":
          return t("server.logs.reasons.movePlayer");
        case "removeServerVip":
          return t("server.logs.reasons.removeServerVip");
        default:
          return t("server.logs.reasons.magic");
      }
    })();

    if (log.action === "autokick-ping") {
      return (
        <div className={styles.logRow}>
          <span className={styles.logServer}>{log.serverName}: </span>
          <svg className={styles.logIcon} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19.5,5.5V18.5H17.5V5.5H19.5M12.5,10.5V18.5H10.5V10.5H12.5M21,4H16V20H21V4M14,9H9V20H14V9M7,14H2V20H7V14Z"
            />
          </svg>
          <span className={styles.logAdmin}>
            {t("server.logs.types.pingChecker")}
          </span>
          <span className={styles.logAction}>
            {t("server.logs.reasons.kickPlayer")}
          </span>
          <span
            className={styles.logPlayer}
            onClick={() =>
              modal.show(
                <PlayerStatsModal
                  player={log.toPlayer}
                  playerId={log.toPlayerId}
                />,
              )
            }
          >
            {log.toPlayer}
          </span>
          <span className={styles.logAction}>{log.reason}</span>
          <span className={styles.logReasonDetailed}></span>
          <span className={styles.logTime}>
            {t("shortDateTime", { date: datetime })}
          </span>
          <span className={styles.logShortTime}>
            {t("time", { date: datetime })}
          </span>
        </div>
      );
    }

    if (log.action === "autokick-globalBans") {
      return (
        <div className={styles.logRow}>
          <span className={styles.logServer}>{log.serverName}: </span>
          <svg className={styles.logIcon} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z"
            />
          </svg>
          <span className={styles.logAdmin}>{t("server.logs.types.vBan")}</span>
          <span className={styles.logAction}>
            {t("server.logs.reasons.kickPlayer")}
          </span>
          <span
            className={styles.logPlayer}
            onClick={() =>
              modal.show(
                <PlayerStatsModal
                  player={log.toPlayer}
                  playerId={log.toPlayerId}
                />,
              )
            }
          >
            {log.toPlayer}
          </span>
          <span className={styles.logReason}>{t("server.logs.reason")}</span>
          <span className={styles.logReasonDetailed}>{log.reason}</span>
          <span className={styles.logTime}>
            {t("shortDateTime", { date: datetime })}
          </span>
          <span className={styles.logShortTime}>
            {t("time", { date: datetime })}
          </span>
        </div>
      );
    }

    if (log.action === "autokick-bfban") {
      return (
        <div className={styles.logRow}>
          <span className={styles.logServer}>{log.serverName}: </span>
          <svg className={styles.logIcon} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2M12 4C10.1 4 8.4 4.6 7.1 5.7L18.3 16.9C19.3 15.5 20 13.8 20 12C20 7.6 16.4 4 12 4M16.9 18.3L5.7 7.1C4.6 8.4 4 10.1 4 12C4 16.4 7.6 20 12 20C13.9 20 15.6 19.4 16.9 18.3Z"
            />
          </svg>
          <span className={styles.logAdmin}>
            {t("server.logs.types.bfban")}
          </span>
          <span className={styles.logAction}>
            {t("server.logs.reasons.kickPlayer")}
          </span>
          <span
            className={styles.logPlayer}
            onClick={() =>
              modal.show(
                <PlayerStatsModal
                  player={log.toPlayer}
                  playerId={log.toPlayerId}
                />,
              )
            }
          >
            {log.toPlayer}
          </span>
          <span className={styles.logReason}>{t("server.logs.reason")}</span>
          <span className={styles.logReasonDetailed}>{log.reason}</span>
          <span className={styles.logTime}>
            {t("shortDateTime", { date: datetime })}
          </span>
          <span className={styles.logShortTime}>
            {t("time", { date: datetime })}
          </span>
        </div>
      );
    }

    if (action === "moved" && log.toPlayer === "server") {
      return (
        <div className={styles.logRow}>
          <span className={styles.logServer}>{log.serverName}: </span>
          <svg className={styles.logIcon} viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M15,19L9,16.89V5L15,7.11M20.5,3C20.44,3 20.39,3 20.34,3L15,5.1L9,3L3.36,4.9C3.15,4.97 3,5.15 3,5.38V20.5A0.5,0.5 0 0,0 3.5,21C3.55,21 3.61,21 3.66,20.97L9,18.9L15,21L20.64,19.1C20.85,19 21,18.85 21,18.62V3.5A0.5,0.5 0 0,0 20.5,3Z"
            />{" "}
          </svg>
          <span className={styles.logAdmin}>{log.adminName}</span>
          <span className={styles.logAction}>{log.reason}</span>
          <span className={styles.logReasonDetailed}></span>
          <span className={styles.logTime}>
            {t("shortDateTime", { date: datetime })}
          </span>
          <span className={styles.logShortTime}>
            {t("time", { date: datetime })}
          </span>
        </div>
      );
    }
    return (
      <div className={styles.logRow}>
        <span className={styles.logServer}>{log.serverName}: </span>
        <svg className={styles.logIcon} viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
          />
        </svg>
        <span className={styles.logAdmin}>{log.adminName}</span>
        <span className={styles.logAction}>{action}</span>
        <span
          className={styles.logPlayer}
          onClick={() =>
            modal.show(
              <PlayerStatsModal
                player={log.toPlayer}
                playerId={log.toPlayerId}
              />,
            )
          }
        >
          {log.toPlayer}
        </span>
        <span className={styles.logReason}>
          {log.reason === ""
            ? t("server.logs.noReason")
            : t("server.logs.reason")}
        </span>
        <span className={styles.logReasonDetailed}>{log.reason}</span>
        <span className={styles.logTime}>
          {t("shortDateTime", { date: datetime })}
        </span>
        <span className={styles.logShortTime}>
          {t("time", { date: datetime })}
        </span>
      </div>
    );
  }
}

export function EmptyRow() {
  return <div className={styles.logRow}></div>;
}

function VbanBanPlayer(props: { gid: string }): React.ReactElement {
  const modal = useModal();
  const { gid } = props;
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const [usePlayerId, setUsePlayerId] = React.useState(false);
  const [playerName, setPlayerName] = React.useState("");
  const [playerId, setPlayerId] = React.useState("");

  const [reason, setReason] = React.useState("");
  const [banTime, setBanTime] = React.useState("0");

  const [banApplyStatus, setBanApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });

  const {
    isError: userGettingError,
    data: user,
  }: UseQueryResult<IUserInfo, { code: number; message: string }> = useQuery({
    queryKey: ["user"],
    queryFn: () => OperationsApi.user,
  });

  const GlobalBanPlayer = useMutation({
    mutationFn: (v: {
      name: string;
      reason: string;
      gid: string;
      playerId: number;
      banTime: string;
    }) => OperationsApi.globalBanPlayer(v),

    onError: (
      error: React.SetStateAction<{ code: number; message: string }>,
    ) => {
      setBanApplyStatus(false);
      setError(error);
      setTimeout(() => setBanApplyStatus(null), 3000);
    },

    onSuccess: () => {
      setBanApplyStatus(null);
      modal.close(null);
    },

    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["globalBanList" + gid],
      });
      queryClient.invalidateQueries({
        queryKey: ["getAutoBanCount" + gid],
      });
    },
  });

  const isDisabled =
    reason === "" ||
    !(playerName !== "" || playerId !== "") ||
    banApplyStatus !== null ||
    userGettingError ||
    !user ||
    gid == null;

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>
        {t("server.vBanMenu.playerNameDescription")}{" "}
      </h2>
      <Switch
        checked={usePlayerId}
        name={t("server.vBanMenu.usePlayerId")}
        callback={(v) => setUsePlayerId(v)}
      />
      {usePlayerId ? (
        <TextInput
          value={playerId}
          name={t("server.vBanMenu.playerId")}
          callback={(e) => setPlayerId(e.target.value)}
        />
      ) : (
        <TextInput
          value={playerName}
          name={t("server.vBanMenu.playerName")}
          callback={(e) => setPlayerName(e.target.value)}
        />
      )}
      <h5 style={{ maxWidth: "300px" }}>
        {t("server.vBanMenu.reasonDescription")}
      </h5>
      <ButtonRow>
        <TextInput
          value={reason}
          name={t("server.vBanMenu.reason")}
          callback={(e) => setReason(e.target.value)}
        />
        <ReasonDropdownButton
          gid={gid}
          name={t("server.reasonMenu.select")}
          callback={(v) => setReason(v)}
          style={{ maxWidth: "144px" }}
        />
      </ButtonRow>
      <h5 style={{ maxWidth: "300px" }}>
        {t("server.banMenu.tempbanDesc0")}
        <br />
        {t("server.banMenu.tempbanDesc1")}
      </h5>
      <TextInput
        type={"text"}
        name={t("server.banMenu.tempbanAmount")}
        defaultValue={0}
        callback={(e) => setBanTime(e.target.value)}
      />
      <ButtonRow>
        <Button
          name={t("server.vBanMenu.confirm")}
          style={{ maxWidth: "144px" }}
          disabled={isDisabled}
          callback={() =>
            GlobalBanPlayer.mutate({
              gid,
              reason,
              name: usePlayerId ? undefined : playerName,
              playerId: usePlayerId ? Number.parseInt(playerId) : undefined,
              banTime,
            })
          }
          status={banApplyStatus}
        />
        <h5
          style={{
            marginBottom: 0,
            alignSelf: "center",
            opacity: banApplyStatus === false ? 1 : 0,
          }}
        >
          Error {errorUpdating.code}: {errorUpdating.message}
        </h5>
      </ButtonRow>
    </>
  );
}

function SelectableRow(props: {
  selected: boolean;
  callback: (args0?: string) => void;
  children?:
  | React.ReactElement
  | boolean
  | React.ReactFragment
  | React.ReactPortal;
}): React.ReactElement {
  return (
    <div
      className={
        props.selected ? styles.selectableRowSelected : styles.selectableRow
      }
      onClick={() => props.callback()}
    >
      {props.selected ? <IconSelected /> : <IconNotSelected />}
      {props.children}
    </div>
  );
}

export function SeederStRow(props: {
  server: IGroupServer;
  callback: (args0?: string) => void;
  selected: boolean;
  selectedCount: number;
}): React.ReactElement {
  const server = props.server;

  return (
    <SelectableRow callback={props.callback} selected={props.selected}>
      <div className={styles.DiscordName} style={{ display: "flex" }}>{server.name}{props.selected && props.selectedCount !== null && (<div className={styles.numberCircle}>{props.selectedCount}</div>)}</div>
    </SelectableRow>
  );
}

export function SeederStCustom(props: {
  callback: (arg0?: string) => void;
  selected: boolean;
  onClick: (args0?: string) => void;
  selectedCount: number;
}): React.ReactElement {
  const { t } = useTranslation();
  const [textContent, setTextContent] = React.useState("");

  return (
    <SelectableRow callback={props.callback} selected={props.selected}>
      <TextInput
        style={{ height: "32px" }}
        name={t("group.seeding.custom")}
        value={textContent}
        callback={(e) => {
          setTextContent(e.target.value);
          props.callback(textContent);
        }}
      />
      <Button
        style={{ height: "32px" }}
        name={t("group.seeding.other.add")}
        callback={() => props.onClick(textContent)}
      // callback={}
      />
      {props.selected && props.selectedCount !== null && (<div className={styles.numberCircle}>{props.selectedCount}</div>)}
    </SelectableRow>
  );
} // callback={(e) => setReason(e.target.value)}

export function SeederStCustomRow(props: {
  server: ISeederServer;
  callback: (args0?: string) => void;
  selected: boolean;
  onClick: (args0?: string) => void;
  selectedCount: number;
}): React.ReactElement {
  const { t } = useTranslation();
  const server = props.server;

  return (
    <SelectableRow callback={props.callback} selected={props.selected}>
      <div className={styles.DiscordName} style={{ display: "flex" }}>{server.name}{props.selected && props.selectedCount !== null && (<div className={styles.numberCircle}>{props.selectedCount}</div>)}</div>
      <Button
        style={{ height: "32px" }}
        name={t("group.seeding.other.remove")}
        callback={() => props.onClick(server.name)}
      // callback={}
      />
    </SelectableRow>
  );
}

export function SeederRow(props: {
  seeder: ISeeder;
  seedingInfo: ISeederInfo;
}): React.ReactElement {
  const { t } = useTranslation();
  const seeder = props.seeder;
  const datetime = new Date(seeder.timeStamp);

  return (
    <div className={styles.SeedRow}>
      <span className={styles.seedingRow}>{seeder.seederName}</span>
      {seeder.isRunning ? (
        props.seedingInfo.keepAliveSeeders &&
          props.seedingInfo.keepAliveSeeders[seeder.seederName] !== undefined ? (
          <span className={styles.serverBadgeOk}>
            {t("group.seeding.seeders.true")} -{" "}
            {t("group.seeding.status.seedServer", {
              serverName:
                props.seedingInfo.keepAliveSeeders[seeder.seederName]
                  .serverName,
            })}
          </span>
        ) : (
          <span className={styles.serverBadgeOk}>
            {t("group.seeding.seeders.true")} -{" "}
            {t("group.seeding.seeders.defaultDescription")}
          </span>
        )
      ) : (
        <span className={styles.serverBadgePending}>
          {t("group.seeding.seeders.false")}
        </span>
      )}
      <span className={styles.logTimeSeed}>
        {t("dateTime", { date: datetime })}
      </span>
    </div>
  );
}

export function KeepAliveRow(props: {
  seeder: string;
  gid: string;
  sid: string;
}): React.ReactElement {
  const { t } = useTranslation();
  const seeder = props.seeder;
  const modal = useModal();

  return (
    <div className={styles.keepAlive}>
      <span className={styles.keepAliveRow}>{seeder}</span>
      <span
        onClick={() =>
          modal.show(
            <DelKeepAlive
              gid={props.gid}
              sid={props.sid}
              hostname={seeder}
              callback={modal.close}
            />,
          )
        }
        className={styles.keepAliveRemove}
      >
        {t("group.seeding.keepalive.remove")}
      </span>
    </div>
  );
}

export function ServerAliasRow(props: {
  servername: string;
  serverId: string;
  serveraliasinfo: {
    [string: string]: {
      joined: number;
      other: number;
    };
  };
}): React.ReactElement {
  const serveralias = props.servername;
  const serverId = props.serverId;
  const currentServer = props.serveraliasinfo[serveralias];

  if (currentServer !== undefined) {
    return (
      <div className={styles.SeedRow}>
        <span className={styles.seedingRow}>{serverId}</span>
        <a
          style={{ textDecoration: "initial" }}
          href={`https://gametools.network/servers/bf1/name/${encodeURIComponent(
            serveralias,
          )}/pc`}
          target="_blank"
          rel="noreferrer"
        >
          <span className={styles.serverBadgeOk}>{serveralias}</span>
        </a>
        <span style={{ marginLeft: "20px" }} className={styles.seedingRow}>
          {currentServer.joined}/{currentServer.joined + currentServer.other}{" "}
          Seeders
        </span>
      </div>
    );
  }
  return <></>;
}

export function DelKeepAlive(props: {
  gid: string;
  hostname: string;
  sid: string;
  callback: (args0?: string) => void;
}): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const AddGroupAdminExecute = useMutation({
    mutationFn: (variables: { serverId: string; hostname: string }) =>
      OperationsApi.delKeepAlive(variables),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["seeding" + props.gid],
      });
    },
  });

  return (
    <>
      <h2>{t("group.seeding.keepalive.remove")}</h2>
      <h2>
        {t("group.seeding.keepalive.currentHostname", {
          hostname: props.hostname,
        })}
      </h2>
      <ButtonRow>
        <Button
          name={t(`group.seeding.popup.confirm`)}
          callback={() => {
            AddGroupAdminExecute.mutate({
              serverId: props.sid,
              hostname: props.hostname,
            });
            props.callback(null);
          }}
        />
      </ButtonRow>
    </>
  );
}

export function ExclusionList(props: {
  gid: string;
  user: IUserInfo;
}): React.ReactElement {
  const { gid } = props;
  const [searchWord, setSearchWord] = React.useState("");
  const [searchItem, setSearchItem] = React.useState("playerName");
  const { t } = useTranslation();

  const {
    data: totalCount,
  }: UseQueryResult<ITotalCount, { code: number; message: string }> = useQuery({
    queryKey: ["getExcludedPlayersCount" + gid],
    queryFn: () => OperationsApi.getExcludedPlayersCount({ gid }),
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["globalExclusionList" + gid, { searchWord, searchItem }],
    queryFn: ({ pageParam = 0 }) =>
      OperationsApi.getExcludedPlayers({
        gid,
        pageParam,
        searchWord,
        searchItem,
      }),
    getNextPageParam: (lastPage) => lastPage.offset,
    initialPageParam: 0,
  });

  const excludeList = React.useMemo(
    () => (data ? data?.pages.flatMap((item) => item.results) : []),
    [data],
  );

  const observer = React.useRef<IntersectionObserver>();
  const lastElementRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasNextPage],
  );

  const modal = useModal();
  const showRemoveExclusion = (e: { target: { dataset: any } }) => {
    const playerInfo = e.target.dataset;
    modal.show(
      <GroupRemoveExclusionPlayer
        gid={gid}
        eaid={playerInfo.name}
        playerId={playerInfo.id}
      />,
    );
  };

  return (
    <div>
      <h2>{t("group.exclusions.main")}</h2>
      <h5>
        {t("group.exclusions.description0")}{" "}
        <b>
          {t("group.exclusions.description1", {
            number: totalCount?.total,
          })}
        </b>
        .
      </h5>
      <ButtonRow>
        <TextInput
          name={t("search")}
          callback={(v) => setSearchWord(v.target.value)}
        />
        <select
          className={styles.SwitchGame}
          value={searchItem}
          onChange={(e) => setSearchItem(e.target.value)}
        >
          <option value="playerName">{t("group.vban.table.playerName")}</option>
          <option value="id">{t("group.vban.table.playerId")}</option>
          <option value="reason">{t("group.vban.table.reason")}</option>
          <option value="admin">{t("group.vban.table.admin")}</option>
        </select>
        <Button
          name={t("group.exclusions.add")}
          callback={() => modal.show(<ExclusionPlayer gid={gid} />)}
        />
        <ButtonUrl
          style={{ marginLeft: 0 }}
          href={`https://manager-api.gametools.network/api/excludedplayersexcel?groupid=${gid}`}
          name={t("export")}
        />
      </ButtonRow>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ position: "sticky", top: "0" }}>
            <th>{t("group.exclusions.table.playerName")}</th>
            <th>{t("group.exclusions.table.playerId")}</th>
            <th>{t("group.exclusions.table.reason")}</th>
            <th>{t("group.exclusions.table.admin")}</th>
            <th>{t("group.exclusions.table.bannedUntil")}</th>
            <th>{t("group.exclusions.table.timestamp")}</th>
            <th></th>
          </thead>
          <tbody>
            {isError && <>{`Error ${error?.code}: ${error?.message}`}</>}
            {!isLoading &&
              !isError &&
              excludeList.map((player: IGlobalGroupPlayerInfo, i: number) => (
                <ExclusionListRow
                  player={player}
                  key={i}
                  callback={showRemoveExclusion}
                  innerRef={
                    excludeList.length === i + 1 ? lastElementRef : null
                  }
                />
              ))}
            {isFetching && <RowLoading />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExclusionListRow(props: {
  innerRef: UseMeasureRef<Element>;
  player: IGlobalGroupPlayerInfo;
  callback: (args0?: any) => void;
}): React.ReactElement {
  const modal = useModal();
  const { player } = props;
  const { t } = useTranslation();
  return (
    <tr
      ref={props.innerRef}
      className={styles.BanRow}
      onClick={(e: any) =>
        e.target.tagName === "TD"
          ? modal.show(
            <PlayerStatsModal
              player={player.playerName}
              playerId={player.id}
            />,
          )
          : null
      }
    >
      <td>{player.playerName}</td>
      <td className={styles.ListPlayerId}>{player.id}</td>
      <td>
        {player.reason === "" ? t("group.exclusions.noReason") : player.reason}
      </td>
      <td>{player.admin}</td>
      <td>
        <div className={styles.ListFullDate}>
          {player.bannedUntil !== null && player.bannedUntil !== undefined
            ? t("dateTime", { date: new Date(player.bannedUntil) })
            : "-"}
        </div>
        <div className={styles.ListHalfDate}>
          {player.bannedUntil !== null && player.bannedUntil !== undefined
            ? t("date", { date: new Date(player.bannedUntil) })
            : "-"}
        </div>
      </td>
      <td>
        <div className={styles.ListFullDate}>
          {player.timeStamp !== undefined
            ? t("dateTime", { date: new Date(player.timeStamp) })
            : "-"}
        </div>
        <div className={styles.ListHalfDate}>
          {player.timeStamp !== undefined
            ? t("date", { date: new Date(player.timeStamp) })
            : "-"}
        </div>
      </td>
      <th
        className={styles.globalUnban}
        data-name={player.playerName}
        data-id={player.id}
        onClick={props.callback}
      >
        {t("group.exclusions.remove")}
      </th>
    </tr>
  );
}

function ExclusionPlayer(props: { gid: string }): React.ReactElement {
  const modal = useModal();
  const { gid } = props;
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const [playerName, setPlayerName] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [excludeTime, setExcludeTime] = React.useState(0);

  const [excludeApplyStatus, setExcludeApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });

  const {
    isError: userGettingError,
    data: user,
  }: UseQueryResult<IUserInfo, { code: number; message: string }> = useQuery({
    queryKey: ["user"],
    queryFn: () => OperationsApi.user,
  });

  const GlobalExcludePlayer = useMutation({
    mutationFn: (v: {
      name: string;
      reason: string;
      gid: string;
      playerId: string;
      excludeTime: number;
    }) => OperationsApi.globalExcludePlayer(v),

    onError: (
      error: React.SetStateAction<{ code: number; message: string }>,
    ) => {
      setExcludeApplyStatus(false);
      setError(error);
      setTimeout(() => setExcludeApplyStatus(null), 3000);
    },

    onSuccess: () => {
      setExcludeApplyStatus(null);
      modal.close(null);
    },

    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["globalExclusionList" + gid],
      });
      queryClient.invalidateQueries({
        queryKey: ["getExcludedPlayersCount" + gid],
      });
    },
  });

  const isDisabled =
    reason === "" ||
    playerName === "" ||
    excludeApplyStatus !== null ||
    userGettingError ||
    !user ||
    gid == null;

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>
        {t("server.exclusionsMenu.playerNameDescription")}{" "}
      </h2>
      <TextInput
        value={playerName}
        name={t("server.exclusionsMenu.playerName")}
        callback={(e) => setPlayerName(e.target.value)}
      />
      <h5 style={{ maxWidth: "300px" }}>
        {t("server.exclusionsMenu.reasonDescription")}
      </h5>
      <ButtonRow>
        <TextInput
          value={reason}
          name={t("server.exclusionsMenu.reason")}
          callback={(e) => setReason(e.target.value)}
        />
        <ReasonDropdownButton
          gid={gid}
          name={t("server.reasonMenu.select")}
          callback={(v) => setReason(v)}
          style={{ maxWidth: "144px" }}
        />
      </ButtonRow>
      <h5 style={{ maxWidth: "300px" }}>
        {t("server.exclusionsMenu.excludeDesc0")}
        <br />
        {t("server.exclusionsMenu.excludeDesc1")}
      </h5>
      <TextInput
        type={"text"}
        name={t("server.exclusionsMenu.excludeAmount")}
        defaultValue={0}
        callback={(e) => setExcludeTime(e.target.value)}
      />
      <ButtonRow>
        <Button
          name={t("server.exclusionsMenu.confirm")}
          style={{ maxWidth: "144px" }}
          disabled={isDisabled}
          callback={() =>
            GlobalExcludePlayer.mutate({
              gid,
              reason,
              name: playerName,
              playerId: undefined,
              excludeTime,
            })
          }
          status={excludeApplyStatus}
        />
        <h5
          style={{
            marginBottom: 0,
            alignSelf: "center",
            opacity: excludeApplyStatus === false ? 1 : 0,
          }}
        >
          Error {errorUpdating.code}: {errorUpdating.message}
        </h5>
      </ButtonRow>
    </>
  );
}

export function TrackingList(props: {
  gid: string;
  user: IUserInfo;
}): React.ReactElement {
  const { gid } = props;
  const [searchWord, setSearchWord] = React.useState("");
  const [searchItem, setSearchItem] = React.useState("playerName");
  const { t } = useTranslation();

  const {
    data: totalCount,
  }: UseQueryResult<ITotalCount, { code: number; message: string }> = useQuery({
    queryKey: ["getTrackedPlayersCount" + gid],
    queryFn: () => OperationsApi.getTrackedPlayersCount({ gid }),
  });

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["globalTrackingList" + gid, { searchWord, searchItem }],
    queryFn: ({ pageParam = 0 }) =>
      OperationsApi.getTrackedPlayers({
        gid,
        pageParam,
        searchWord,
        searchItem,
      }),
    getNextPageParam: (lastPage) => lastPage.offset,
    initialPageParam: 0,
  });

  const excludeList = React.useMemo(
    () => (data ? data?.pages.flatMap((item) => item.results) : []),
    [data],
  );

  const playerIds: string[] = excludeList.map((player) => player.id);

  const { data: currentServer } = useQuery({
    queryKey: ["currentServer" + playerIds],
    queryFn: () => GametoolsApi.currentServer({ playerIds }),
    staleTime: 30000,
  });

  const observer = React.useRef<IntersectionObserver>();
  const lastElementRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetching) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasNextPage],
  );

  const modal = useModal();
  const showRemoveExclusion = (e: { target: { dataset: any } }) => {
    const playerInfo = e.target.dataset;
    modal.show(
      <GroupRemoveTrackedPlayer
        gid={gid}
        eaid={playerInfo.name}
        playerId={playerInfo.id}
      />,
    );
  };

  return (
    <div>
      <h2>{t("group.tracking.main")}</h2>
      <h5>
        {t("group.tracking.description0")}{" "}
        <b>
          {t("group.tracking.description1", {
            number: totalCount?.total,
          })}
        </b>
        .
      </h5>
      <ButtonRow>
        <TextInput
          name={t("search")}
          callback={(v) => setSearchWord(v.target.value)}
        />
        <select
          className={styles.SwitchGame}
          value={searchItem}
          onChange={(e) => setSearchItem(e.target.value)}
        >
          <option value="playerName">{t("group.vban.table.playerName")}</option>
          <option value="id">{t("group.vban.table.playerId")}</option>
          <option value="reason">{t("group.vban.table.reason")}</option>
          <option value="admin">{t("group.vban.table.admin")}</option>
        </select>
        <Button
          name={t("group.tracking.add")}
          callback={() => modal.show(<TrackingPlayer gid={gid} />)}
        />
        <ButtonUrl
          style={{ marginLeft: 0 }}
          href={`https://manager-api.gametools.network/api/trackedplayersexcel?groupid=${gid}`}
          name={t("export")}
        />
      </ButtonRow>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ position: "sticky", top: "0" }}>
            <th>{t("group.tracking.table.playerName")}</th>
            <th>{t("group.tracking.table.currentServer")}</th>
            <th>{t("group.tracking.table.playerId")}</th>
            <th>{t("group.tracking.table.reason")}</th>
            <th>{t("group.tracking.table.admin")}</th>
            <th>{t("group.tracking.table.timestamp")}</th>
            <th></th>
          </thead>
          <tbody>
            {isError && <>{`Error ${error?.code}: ${error?.message}`}</>}
            {!isLoading &&
              !isError &&
              excludeList.map((player: IGlobalGroupPlayerInfo, i: number) => (
                <TrackingListRow
                  player={player}
                  currentServer={currentServer && currentServer[player.id]}
                  key={i}
                  callback={showRemoveExclusion}
                  innerRef={
                    excludeList.length === i + 1 ? lastElementRef : null
                  }
                />
              ))}
            {isFetching && <RowLoading />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrackingListRow(props: {
  innerRef: UseMeasureRef<Element>;
  currentServer?: ICurrentServerInfo;
  player: IGlobalGroupPlayerInfo;
  callback: (args0?: any) => void;
}): React.ReactElement {
  const modal = useModal();
  const { player, currentServer } = props;
  const { t } = useTranslation();
  return (
    <tr
      ref={props.innerRef}
      className={styles.BanRow}
      onClick={(e: any) =>
        e.target.tagName === "TD"
          ? modal.show(
            <PlayerStatsModal
              player={player.playerName}
              playerId={player.id}
            />,
          )
          : null
      }
    >
      <td>{player.playerName}</td>
      <td>
        {currentServer?.name === ""
          ? t("group.tracking.noServer")
          : currentServer?.name}
      </td>
      <td className={styles.ListPlayerId}>{player.id}</td>
      <td>
        {player.reason === "" ? t("group.tracking.noReason") : player.reason}
      </td>
      <td>{player.admin}</td>
      <td>
        <div className={styles.ListFullDate}>
          {player.timeStamp !== undefined
            ? t("dateTime", { date: new Date(player.timeStamp) })
            : "-"}
        </div>
        <div className={styles.ListHalfDate}>
          {player.timeStamp !== undefined
            ? t("date", { date: new Date(player.timeStamp) })
            : "-"}
        </div>
      </td>
      <th
        className={styles.globalUnban}
        data-name={player.playerName}
        data-id={player.id}
        onClick={props.callback}
      >
        {t("group.tracking.remove")}
      </th>
    </tr>
  );
}

function TrackingPlayer(props: { gid: string }): React.ReactElement {
  const modal = useModal();
  const { gid } = props;
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const [playerName, setPlayerName] = React.useState("");
  const [reason, setReason] = React.useState("");

  const [trackingApplyStatus, setTrackingApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });

  const {
    isError: userGettingError,
    data: user,
  }: UseQueryResult<IUserInfo, { code: number; message: string }> = useQuery({
    queryKey: ["user"],
    queryFn: () => OperationsApi.user,
  });

  const GlobalTrackPlayer = useMutation({
    mutationFn: (v: {
      name: string;
      reason: string;
      gid: string;
      playerId: string;
    }) => OperationsApi.globalTrackPlayer(v),

    onError: (
      error: React.SetStateAction<{ code: number; message: string }>,
    ) => {
      setTrackingApplyStatus(false);
      setError(error);
      setTimeout(() => setTrackingApplyStatus(null), 3000);
    },

    onSuccess: () => {
      setTrackingApplyStatus(null);
      modal.close(null);
    },

    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["globalTrackingList" + gid],
      });
      queryClient.invalidateQueries({
        queryKey: ["getTrackedPlayersCount" + gid],
      });
    },
  });

  const isDisabled =
    reason === "" ||
    playerName === "" ||
    trackingApplyStatus !== null ||
    userGettingError ||
    !user ||
    gid == null;

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>
        {t("server.trackingMenu.playerNameDescription")}{" "}
      </h2>
      <TextInput
        value={playerName}
        name={t("server.trackingMenu.playerName")}
        callback={(e) => setPlayerName(e.target.value)}
      />
      <h5 style={{ maxWidth: "300px" }}>
        {t("server.trackingMenu.reasonDescription")}
      </h5>
      <ButtonRow>
        <TextInput
          value={reason}
          name={t("server.trackingMenu.reason")}
          callback={(e) => setReason(e.target.value)}
        />
        <ReasonDropdownButton
          gid={gid}
          name={t("server.reasonMenu.select")}
          callback={(v) => setReason(v)}
          style={{ maxWidth: "144px" }}
        />
      </ButtonRow>
      <ButtonRow>
        <Button
          name={t("server.trackingMenu.confirm")}
          style={{ maxWidth: "144px" }}
          disabled={isDisabled}
          callback={() =>
            GlobalTrackPlayer.mutate({
              gid,
              reason,
              name: playerName,
              playerId: undefined,
            })
          }
          status={trackingApplyStatus}
        />
        <h5
          style={{
            marginBottom: 0,
            alignSelf: "center",
            opacity: trackingApplyStatus === false ? 1 : 0,
          }}
        >
          Error {errorUpdating.code}: {errorUpdating.message}
        </h5>
      </ButtonRow>
    </>
  );
}

export function ReasonList(props: {
  gid: string;
  user: IUserInfo;
}): React.ReactElement {
  const gid = props.gid;
  const {
    isError,
    data: reasonList,
    error,
  }: UseQueryResult<IReasonList, { code: number; message: string }> = useQuery({
    queryKey: ["globalReasonList" + gid],
    queryFn: () => OperationsApi.getReasonList({ gid, sid: undefined }),
  });

  const [searchWord, setSearchWord] = React.useState("");
  const { t } = useTranslation();

  const modal = useModal();
  const showRemoveReason = (e: { target: { dataset: any } }) => {
    const reason = e.target.dataset;
    modal.show(<GroupRemoveReason gid={gid} reasonId={reason.id} />);
  };

  if (reasonList) {
    reasonList.data = reasonList.data.sort(DynamicSort("item"));
  }

  if (isError) {
    return <>{`Error ${error.code}: {error.message}`}</>;
  }

  return (
    <div>
      <h2>{t("group.reasonList.main")}</h2>
      <h5>{t("group.reasonList.description0")}</h5>
      <ButtonRow>
        <TextInput
          name={t("search")}
          callback={(v) => setSearchWord(v.target.value)}
        />
        <Button
          name={t("group.reasonList.add")}
          callback={() => modal.show(<ReasonListPlayer gid={gid} />)}
        />
        <ButtonUrl
          style={{ marginLeft: 0 }}
          href={`https://manager-api.gametools.network/api/reasonlistexcel?groupid=${gid}`}
          name={t("export")}
        />
      </ButtonRow>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <tbody>
            {reasonList ? (
              reasonList.data
                .filter((p: { item: string }) =>
                  p.item.toLowerCase().includes(searchWord.toLowerCase()),
                )
                .map((reason: IReason, index: number) => (
                  <ReasonListRow
                    reason={reason}
                    key={index}
                    callback={showRemoveReason}
                  />
                ))
            ) : (
              <RowLoading />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReasonListRow(props: {
  reason: IReason;
  callback: (args0?: any) => void;
}): React.ReactElement {
  const reason = props.reason;
  const { t } = useTranslation();
  return (
    <tr className={styles.BanRow}>
      <td>{reason.item}</td>
      <th
        className={styles.globalUnban}
        data-id={reason.id}
        onClick={props.callback}
      >
        {t("group.reasonList.remove")}
      </th>
    </tr>
  );
}

function ReasonListPlayer(props: { gid: string }): React.ReactElement {
  const modal = useModal();
  const { gid } = props;
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const [reason, setReason] = React.useState("");

  const [reasonApplyStatus, setReasonApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });

  const {
    isError: userGettingError,
    data: user,
  }: UseQueryResult<IUserInfo, { code: number; message: string }> = useQuery({
    queryKey: ["user"],
    queryFn: () => OperationsApi.user,
  });

  const GlobalAddReason = useMutation({
    mutationFn: (v) => OperationsApi.addReason(v),

    onMutate: async ({ gid, reason }: { gid: string; reason: string }) => {
      setReasonApplyStatus(true);

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["globalReasonList" + gid],
      });
      // Snapshot the previous value
      const previousReasonlist = queryClient.getQueryData([
        "globalReasonList" + gid,
      ]);

      queryClient.setQueryData(
        ["globalReasonList" + gid],
        (old: IReasonList) => {
          old?.data?.push({ item: reason });
          return old;
        },
      );
      // Return a context object with the snapshotted value
      return { previousReasonlist, gid };
    },

    onError: (
      err: React.SetStateAction<{ code: number; message: string }>,
      _newTodo,
      context,
    ) => {
      setReasonApplyStatus(false);
      setError(err);
      setTimeout(() => setReasonApplyStatus(null), 3000);
      queryClient.setQueryData(
        ["globalReasonList" + context.gid],
        context.previousReasonlist,
      );
    },

    onSuccess: () => {
      setReasonApplyStatus(null);
      modal.close(null);
    },

    // Always refetch after error or success:
    onSettled: (_data, _error, _variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["globalReasonList" + context.gid],
      });
    },
  });

  const isDisabled =
    reason === "" ||
    reasonApplyStatus !== null ||
    userGettingError ||
    !user ||
    gid == null;

  return (
    <>
      <h5 style={{ maxWidth: "300px" }}>
        {t("server.reasonMenu.reasonDescription")}
      </h5>
      <TextInput
        value={reason}
        name={t("server.reasonMenu.reason")}
        callback={(e) => setReason(e.target.value)}
      />
      <ButtonRow>
        <Button
          name={t("server.reasonMenu.confirm")}
          style={{ maxWidth: "144px" }}
          disabled={isDisabled}
          callback={() => GlobalAddReason.mutate({ gid, reason })}
          status={reasonApplyStatus}
        />
        <h5
          style={{
            marginBottom: 0,
            alignSelf: "center",
            opacity: reasonApplyStatus === false ? 1 : 0,
          }}
        >
          Error {errorUpdating.code}: {errorUpdating.message}
        </h5>
      </ButtonRow>
    </>
  );
}
