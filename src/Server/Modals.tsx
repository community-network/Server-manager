import * as React from "react";
import {
  useQueryClient,
  useMutation,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { OperationsApi } from "../api/api";
import {
  useModal,
  Switch,
  ButtonRow,
  Button,
  TextInput,
  ReasonDropdownButton,
} from "../components";
import "../locales/config";

import { useUser } from "./Manager";

import styles from "./Styles.module.css";
import { IInGameServerInfo, IUserServer } from "../api/ReturnTypes";
import { GametoolsApi } from "../api/GametoolsApi";
import { getLanguage } from "../locales/config";

export function ServerKickPlayer(props: {
  eaid: string;
  playerId?: string | number;
  userId?: number;
  sid: string;
}): React.ReactElement {
  const { sid, eaid } = props;

  const modal = useModal();
  const { t } = useTranslation();
  const [reason, setReason] = React.useState("");
  const [kickApplyStatus, setKickApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });
  const queryClient = useQueryClient();
  const history = useNavigate();

  const KickPlayer = useMutation(
    (v: {
      sid: string;
      playername: string;
      reason: string;
      playerId: string | number;
      userId: number;
      eaid?: string;
    }) => OperationsApi.kickPlayer(v),
    {
      // When mutate is called:
      onMutate: async ({ sid, eaid }) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(["serverGame" + sid]);
        // Snapshot the previous value
        const previousGroup = queryClient.getQueryData(["serverGame" + sid]);
        // Optimistically update to the new value
        queryClient.setQueryData(
          ["serverGame" + sid],
          (old: IInGameServerInfo) => {
            old.data[0].players[0].players =
              old.data[0].players[0].players.filter(
                (e: { name: string }) => e.name !== eaid,
              );
            old.data[0].players[1].players =
              old.data[0].players[1].players.filter(
                (e: { name: string }) => e.name !== eaid,
              );
            return old;
          },
        );
        setKickApplyStatus(true);
        // Return a context object with the snapshotted value
        return { previousGroup, sid };
      },
      onSuccess: () => {
        setKickApplyStatus(null);
        modal.close(null);
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (
        error: React.SetStateAction<{ code: number; message: string }>,
        _newTodo,
        context,
      ) => {
        setKickApplyStatus(false);
        setError(error);
        setTimeout(() => setKickApplyStatus(null), 3000);
        queryClient.setQueryData(
          ["serverGame" + context.sid],
          context.previousGroup,
        );
      },
    },
  );

  const checkReason = (v: string) =>
    checkGameString(v) ? setReason(v) : false;

  return (
    <>
      <h2>{t("server.kickMenu.main", { name: props.eaid })}</h2>
      <h5 style={{ maxWidth: "400px", margin: "6px 0" }}>
        {t("server.kickMenu.reasonDescription")}
      </h5>
      <ButtonRow>
        <TextInput
          name={t("server.kickMenu.reason")}
          value={reason}
          callback={(e) => checkReason(e.target.value)}
        />
        <ReasonDropdownButton
          sid={sid}
          name={t("server.reasonMenu.select")}
          callback={(v) => checkReason(v)}
          style={{ maxWidth: "144px" }}
        />
      </ButtonRow>
      <ButtonRow>
        <Button
          status={kickApplyStatus}
          name={t("server.kickMenu.confirm")}
          disabled={reason === ""}
          callback={() => {
            KickPlayer.mutate({
              sid,
              eaid,
              reason,
              playername: props.eaid,
              playerId: props.playerId,
              userId: props.userId,
            });
            history(`/server/${props.sid}/`);
          }}
        />
        <h5
          style={{
            marginBottom: 0,
            alignSelf: "center",
            opacity: kickApplyStatus === false ? 1 : 0,
          }}
        >
          Error {errorUpdating.code}: {errorUpdating.message}
        </h5>
      </ButtonRow>
    </>
  );
}

export function ServerBanPlayer(props: {
  sid: string;
  playerInfo: any;
}): React.ReactElement {
  const { sid, playerInfo } = props;
  const { name, oid, platform } = playerInfo;

  const modal = useModal();
  const { t } = useTranslation();
  const [reason, setReason] = React.useState("");
  const [playerId, setPid] = React.useState(undefined);
  const [banTime, setBanTime] = React.useState(0);
  const [globalVsClassicBan, setGlobalVsClassicBan] = React.useState(false);
  const [banApplyStatus, setBanApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });
  const { isError: userGettingError, data: user } = useUser();

  React.useEffect(() => {
    if (playerId !== playerInfo.playerId) {
      setPid(playerInfo.playerId);
    }
  }, [playerId, playerInfo.playerId]);

  const BanPlayer = useMutation(
    (v: {
      name?: string;
      reason?: string;
      time?: number;
      sid?: string;
      playerId?: string;
      oid?: string;
      platformId?: string;
    }) => OperationsApi.banPlayer(v),
    {
      onMutate: async () => {
        setBanApplyStatus(true);
      },
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
    },
  );

  const GlobalBanPlayer = useMutation(
    (v: {
      name: string;
      reason: string;
      gid: string;
      playerId: string;
      banTime: string;
    }) => OperationsApi.globalBanPlayer(v),
    {
      onMutate: async () => {
        setBanApplyStatus(true);
      },
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
    },
  );

  let gid = null;

  if (user) {
    user.permissions.isAdminOf.forEach((group: IUserServer) => {
      for (const someSid of group.servers) {
        if (someSid === sid) {
          gid = group.id;
        }
      }
    });
  }

  const isDisabled =
    reason === "" ||
    banTime < 0 ||
    banApplyStatus !== null ||
    userGettingError ||
    !user ||
    gid == null;

  const checkReason = (v: string) =>
    checkGameString(v) ? setReason(v) : false;

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>
        {t("server.banMenu.main", { name })}{" "}
      </h2>
      <h5 style={{ maxWidth: "300px" }}>
        {t("server.banMenu.reasonDescription")}
      </h5>
      <ButtonRow>
        <TextInput
          value={reason}
          name={t("server.banMenu.reason")}
          callback={(e) => checkReason(e.target.value)}
        />
        <ReasonDropdownButton
          sid={sid}
          name={t("server.reasonMenu.select")}
          callback={(v) => checkReason(v)}
          style={{ maxWidth: "144px" }}
        />
      </ButtonRow>
      <Switch
        value={globalVsClassicBan}
        name={t("server.banMenu.vBanOption")}
        callback={(v) => setGlobalVsClassicBan(v)}
      />
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
          name={t("server.banMenu.confirm")}
          style={{ maxWidth: "144px" }}
          disabled={isDisabled}
          callback={() => {
            if (globalVsClassicBan) {
              GlobalBanPlayer.mutate({
                gid,
                reason,
                name,
                playerId,
                banTime: banTime.toString(),
              });
            } else {
              BanPlayer.mutate({
                sid,
                reason,
                name,
                time: banTime,
                playerId,
                oid,
                platformId: platform,
              });
            }
          }}
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

export function ServerMovePlayer(props: {
  callback: () => void;
  team: boolean;
  setTeam: (arg0: boolean) => void;
}): React.ReactElement {
  const modal = useModal();
  const onMovePlayer = () => {
    props.callback();
    modal.close(null);
  };
  return (
    <>
      <h2>Player is not found on the server!</h2>
      <p>Choose a side to move player to, if you think it is an error.</p>
      <ButtonRow>
        <h5 style={{ margin: "0 6px 0 12px" }}>Team 1</h5>
        <Switch checked={props.team} callback={props.setTeam} />
        <h5 style={{ margin: "0" }}>Team 2</h5>
      </ButtonRow>
      <Button name="Move" callback={onMovePlayer} />
    </>
  );
}

export function PlayerStatsModal(props: {
  player: string;
  playerId: string | number;
}): React.ReactElement {
  const { player, playerId } = props;

  let type = "playerid";
  let check: string | number = playerId;
  if (playerId === undefined) {
    type = "name";
    check = player;
  }
  const {
    isLoading,
    isError,
    data: stats,
  } = useQuery(["stats" + "bf1" + type + check], () =>
    GametoolsApi.stats({
      game: "bf1",
      type: "stats",
      getter: type,
      userName: check.toString(),
      lang: getLanguage(),
      platform: "pc",
    }),
  );
  const { t } = useTranslation();

  const statsBlock =
    !isLoading && !isError ? (
      <div className={styles.statsBlock}>
        <h5>
          {t("server.playerStats.skill")}
          {stats.skill}
        </h5>
        <h5>
          {t("server.playerStats.rank")}
          {stats.rank}
        </h5>
        <h5>
          {t("server.playerStats.killsPerMinute")}
          {stats.killsPerMinute}
        </h5>
        <h5>
          {t("server.playerStats.winPercent")}
          {stats.winPercent}
        </h5>
        <h5>
          {t("server.playerStats.accuracy")}
          {stats.accuracy}
        </h5>
        <h5>
          {t("server.playerStats.headshots")}
          {stats.headshots}
        </h5>
        <h5>
          {t("server.playerStats.killDeath")}
          {stats.killDeath}
        </h5>
        <h5>
          {t("server.playerStats.id")}
          {stats.id}
        </h5>
        <h5>
          {t("server.playerStats.currentName")}
          {stats.userName}
        </h5>
        <a
          href={
            "https://gametools.network/stats/pc/playerid/" +
            stats.id +
            "?name=" +
            player
          }
          target="_blank"
          rel="noreferrer"
        >
          {t("server.playerStats.toStatsPage")}
        </a>
      </div>
    ) : (
      t("server.playerStats.loading")
    );

  return (
    <>
      <h2>{t("server.playerStats.main", { player: player })}</h2>
      {statsBlock}
    </>
  );
}

/*
    Checks string to not have special characters and be les or 30 symbols in length
*/
export function checkGameString(v: string) {
  // Not sure wich ones should work, this seems right, maybe some else
  const allowed_keys = "abcdefghijklmnopqrstuvwxyz0123456789_-.: &?!";
  for (const l of v) {
    if (!allowed_keys.includes(l.toLowerCase())) return false;
  }
  return v.length <= 30;
}

export function ServerUnbanPlayer(props: {
  sid: string;
  playerInfo: { name: string; playerId: string; oid: string; platform: number };
}): React.ReactElement {
  const { sid, playerInfo } = props;
  const { name, playerId, oid, platform } = playerInfo;

  const modal = useModal();
  const { t } = useTranslation();
  const [reason, setReason] = React.useState("");
  const [banApplyStatus, setBanApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });
  const { isError: userGettingError, data: user } = useUser();

  const UnbanPlayer = useMutation(
    (v: {
      name: string;
      reason: string;
      sid: string;
      playerId: string;
      oid: string;
      platformId: number;
    }) => OperationsApi.unbanPlayer(v),
    {
      onMutate: async () => {
        setBanApplyStatus(true);
      },
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
    },
  );

  let gid = null;

  if (user) {
    user.permissions.isAdminOf.forEach((group: IUserServer) => {
      for (const someSid of group.servers) {
        if (someSid === sid) {
          gid = group.id;
        }
      }
    });
  }

  const isDisabled =
    reason === "" ||
    banApplyStatus !== null ||
    userGettingError ||
    !user ||
    gid == null;

  const checkReason = (v: string) =>
    checkGameString(v) ? setReason(v) : false;

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>
        {t("server.unbanMenu.main", { name })}{" "}
      </h2>
      <h5 style={{ maxWidth: "300px" }}>
        {t("server.unbanMenu.reasonDescription")}
      </h5>
      <ButtonRow>
        <TextInput
          value={reason}
          name={t("server.unbanMenu.reason")}
          callback={(e) => checkReason(e.target.value)}
        />
        <ReasonDropdownButton
          sid={sid}
          name={t("server.reasonMenu.select")}
          callback={(v) => checkReason(v)}
          style={{ maxWidth: "144px" }}
        />
      </ButtonRow>
      <ButtonRow>
        <Button
          name={t("server.unbanMenu.confirm")}
          style={{ maxWidth: "144px" }}
          disabled={isDisabled}
          callback={() => {
            UnbanPlayer.mutate({
              sid,
              reason,
              name,
              playerId,
              oid,
              platformId: platform,
            });
          }}
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

export function ServerUnvipPlayer(props: {
  eaid: string;
  sid?: string;
  playerId?: string;
}): React.ReactElement {
  const { sid, eaid, playerId } = props;

  const modal = useModal();
  const { t } = useTranslation();
  const [reason, setReason] = React.useState("");
  const [banApplyStatus, setBanApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });
  const { isError: userGettingError, data: user } = useUser();

  const UnvipPlayer = useMutation(
    (v: {
      sid: string;
      name: string;
      reason: string;
      eaid: string;
      playerId: string;
    }) => OperationsApi.removeVip(v),
    {
      onMutate: async () => {
        setBanApplyStatus(true);
      },
      onError: (
        error: React.SetStateAction<{ code: number; message: string }>,
      ) => {
        setBanApplyStatus(false);
        setError(error);
        setTimeout((_) => setBanApplyStatus(null), 3000);
      },
      onSuccess: () => {
        setBanApplyStatus(null);
        modal.close(null);
      },
    },
  );

  let gid = null;

  if (user) {
    user.permissions.isAdminOf.forEach((group: IUserServer) => {
      for (const someSid of group.servers) {
        if (someSid === sid) {
          gid = group.id;
        }
      }
    });
  }

  const isDisabled =
    reason === "" ||
    banApplyStatus !== null ||
    userGettingError ||
    !user ||
    gid == null;

  const checkReason = (v: string) =>
    checkGameString(v) ? setReason(v) : false;

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>
        {t("server.unvipMenu.main", { name: props.eaid })}{" "}
      </h2>
      <h5 style={{ maxWidth: "300px" }}>
        {t("server.unvipMenu.reasonDescription")}
      </h5>
      <TextInput
        value={reason}
        name={t("server.unvipMenu.reason")}
        callback={(e) => checkReason(e.target.value)}
      />
      <ButtonRow>
        <Button
          name={t("server.unvipMenu.confirm")}
          style={{ maxWidth: "144px" }}
          disabled={isDisabled}
          callback={() => {
            UnvipPlayer.mutate({
              sid,
              eaid,
              reason,
              name: props.eaid,
              playerId,
            });
          }}
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
