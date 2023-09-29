import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { checkGameString } from "../Server/Modals";

import { OperationsApi } from "../api/api";
import {
  Switch,
  useModal,
  ButtonRow,
  Button,
  TextInput,
  ButtonUrl,
} from "../components";
import "../locales/config";

import { useUser } from "../Server/Manager";
import {
  IGroupCookie,
  IGroupInfo,
  IGroupsInfo,
  IReasonList,
  IUserInfo,
} from "../api/ReturnTypes";

export function ChangeAccountModal(props: {
  group: IGroupInfo;
  gid: string;
  cookie: IGroupCookie;
  user: IUserInfo;
  callback: (args0?: string) => void;
}) {
  const { group, gid, cookie, user, callback } = props;
  let allowedTo = false;
  if (group && user) allowedTo = group.isOwner || user.auth.isDeveloper;

  const showDeleteAccount = () => {
    modal.show(<GroupRemoveAccount gid={gid} cookie={cookie} />);
  };

  const modal = useModal();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [sid, setSid] = React.useState("");
  const [remid, setRemid] = React.useState("");
  const [defaultCookie, setDefaultCookie] = React.useState(false);
  const [applyStatus, setApplyStatus] = React.useState(null);
  const currentDefault = group.defaultCookie === cookie.id;

  React.useEffect(() => {
    if (cookie) {
      if (remid !== cookie.remid) setRemid(cookie.remid);
      if (sid !== cookie.sid) setSid(cookie.sid);
      if (defaultCookie !== currentDefault) setDefaultCookie(currentDefault);
    }
  }, [cookie]);

  const editCookies = useMutation(
    (variables: {
      gid: string;
      sid: string;
      remid: string;
      id: string;
      defaultCookie: boolean;
    }) => OperationsApi.editCookie(variables),
    {
      onMutate: async () => {
        setApplyStatus(true);
      },
      onSuccess: async () => {
        setApplyStatus(null);
      },
      onError: async () => {
        setApplyStatus(false);
        setTimeout(() => setApplyStatus(null), 2000);
      },
      onSettled: async () => {
        queryClient.invalidateQueries(["groupId" + gid]);
        callback(null);
      },
    },
  );

  const updateGamesAccount = useMutation(
    (variables: { gid: string; id: string }) =>
      OperationsApi.updateCookieGames(variables),
    {
      onMutate: async () => {
        setApplyStatus(true);
      },
      onSuccess: async () => {
        setApplyStatus(null);
      },
      onError: async () => {
        setApplyStatus(false);
        setTimeout(() => setApplyStatus(null), 2000);
      },
      onSettled: async () => {
        queryClient.invalidateQueries(["groupId" + gid]);
        callback(null);
      },
    },
  );

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>
        {t("group.account.main")}: {cookie.username}
      </h2>
      <h5>{t("cookie.sid")}</h5>
      <TextInput
        type="password"
        autocomplete="new-password"
        disabled={!allowedTo}
        callback={(e) => setSid(e.target.value)}
        defaultValue={sid}
        name={"Sid"}
      />
      <h5>{t("cookie.remid")}</h5>
      <TextInput
        type="password"
        autocomplete="new-password"
        disabled={!allowedTo}
        callback={(e) => setRemid(e.target.value)}
        defaultValue={remid}
        name={"Remid"}
      />
      <Switch
        checked={defaultCookie}
        name={t("cookie.setDefaultCookie")}
        callback={(v) => setDefaultCookie(v)}
      />
      <ButtonRow>
        <ButtonUrl href={`/cookieinfo`} name={t("cookieInfo.link")} />
      </ButtonRow>
      <ButtonRow>
        <Button
          style={{ color: "#FF7575" }}
          name={t("cookie.delete")}
          callback={showDeleteAccount}
          disabled={!allowedTo || currentDefault}
        />
        <Button
          name={t("cookie.supportedGames.update")}
          disabled={!allowedTo || applyStatus !== null}
          callback={() =>
            updateGamesAccount.mutate({
              gid: gid,
              id: cookie.id,
            })
          }
          status={applyStatus}
        />
        {group &&
        (sid !== cookie.sid ||
          remid !== cookie.remid ||
          defaultCookie !== currentDefault) ? (
          <Button
            name={t("apply")}
            disabled={!allowedTo || applyStatus !== null}
            callback={() =>
              editCookies.mutate({
                gid: gid,
                sid: sid,
                remid: remid,
                id: cookie.id,
                defaultCookie: defaultCookie,
              })
            }
            status={applyStatus}
          />
        ) : (
          ""
        )}
      </ButtonRow>
    </>
  );
}

export function AddAccountModal(props: {
  group: IGroupInfo;
  gid: string;
  user: IUserInfo;
  callback: (args0?: string) => void;
}) {
  const { group, gid, user, callback } = props;
  let allowedTo = false;
  if (group && user) allowedTo = group.isOwner || user.auth.isDeveloper;

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [sid, setSid] = React.useState("");
  const [remid, setRemid] = React.useState("");
  const [removeApplyStatus, setRemoveApplyStatus] = React.useState(null);
  const [defaultCookie, setDefaultCookie] = React.useState(false);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });

  const addCookies = useMutation(
    (variables: {
      gid: string;
      sid: string;
      remid: string;
      defaultCookie: boolean;
    }) => OperationsApi.addCookie(variables),
    {
      onMutate: async () => {
        setRemoveApplyStatus(true);
      },
      onSuccess: async () => {
        setRemoveApplyStatus(null);
        callback(null);
      },
      onError: async (
        error: React.SetStateAction<{ code: number; message: string }>,
      ) => {
        setRemoveApplyStatus(false);
        setError(error);
        setTimeout(() => setRemoveApplyStatus(null), 2000);
      },
      onSettled: async () => {
        queryClient.invalidateQueries(["groupId" + gid]);
      },
    },
  );

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>{t("group.account.main")}</h2>
      <h5>{t("cookie.sid")}</h5>
      <TextInput
        type="password"
        autocomplete="new-password"
        disabled={!allowedTo}
        callback={(e) => setSid(e.target.value)}
        defaultValue={sid}
        name={"Sid"}
      />
      <h5>{t("cookie.remid")}</h5>
      <TextInput
        type="password"
        autocomplete="new-password"
        disabled={!allowedTo}
        callback={(e) => setRemid(e.target.value)}
        defaultValue={remid}
        name={"Remid"}
      />
      <Switch
        checked={defaultCookie}
        name={t("cookie.setDefaultCookie")}
        callback={(v) => setDefaultCookie(v)}
      />
      <ButtonRow>
        <ButtonUrl href={`/cookieinfo`} name={t("cookieInfo.link")} />
      </ButtonRow>
      <ButtonRow>
        {group && sid !== "" && remid !== "" ? (
          <Button
            name={t("cookie.add")}
            disabled={!allowedTo || removeApplyStatus !== null}
            callback={() =>
              addCookies.mutate({
                gid: gid,
                sid: sid,
                remid: remid,
                defaultCookie: defaultCookie,
              })
            }
            status={removeApplyStatus}
          />
        ) : (
          ""
        )}
        <h5
          style={{
            marginBottom: 0,
            alignSelf: "center",
            opacity: removeApplyStatus === false ? 1 : 0,
          }}
        >
          Error {errorUpdating.code}: {errorUpdating.message}
        </h5>
      </ButtonRow>
    </>
  );
}

export function GroupGlobalUnbanPlayer(props: {
  eaid: string;
  gid?: string;
  playerId?: string;
}): React.ReactElement {
  const { gid, eaid, playerId } = props;

  const queryClient = useQueryClient();

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
      gid: string;
      eaid: string;
      playerId: string;
      reason: string;
    }) => OperationsApi.globalUnbanPlayer(v),
    {
      onError: (
        err: React.SetStateAction<{ code: number; message: string }>,
      ) => {
        setBanApplyStatus(false);
        setError(err);
        setTimeout(() => setBanApplyStatus(null), 3000);
      },
      onSuccess: () => {
        setBanApplyStatus(null);
        modal.close(null);
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(["getAutoBanCount" + gid]);
        queryClient.invalidateQueries(["globalBanList" + gid]);
      },
    },
  );

  let perm = null;

  if (user) {
    user.permissions.isAdminOf.forEach((group) => {
      if (gid === group.id) {
        perm = gid;
      }
    });
  }

  const isDisabled =
    reason === "" ||
    banApplyStatus !== null ||
    userGettingError ||
    !user ||
    perm == null;

  const checkReason = (v: string) =>
    checkGameString(v) ? setReason(v) : false;

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>
        {t("server.vUnbanMenu.main", { name: props.eaid })}{" "}
      </h2>
      <h5 style={{ maxWidth: "300px" }}>
        {t("server.vUnbanMenu.reasonDescription")}
      </h5>
      <TextInput
        value={reason}
        name={t("server.vUnbanMenu.reason")}
        callback={(e) => checkReason(e.target.value)}
      />
      <ButtonRow>
        <Button
          name={t("server.vUnbanMenu.confirm")}
          style={{ maxWidth: "144px" }}
          disabled={isDisabled}
          callback={() => {
            UnbanPlayer.mutate({
              gid,
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

export function GroupRemoveAccount(props: {
  gid: string;
  cookie: IGroupCookie;
}): React.ReactElement {
  const { gid, cookie } = props;

  const queryClient = useQueryClient();

  const modal = useModal();
  const { t } = useTranslation();
  const [removeApplyStatus, setRemoveApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });
  const { isError: userGettingError, data: user } = useUser();

  const RemoveAccount = useMutation(
    (v: { gid: string; id: string }) => OperationsApi.removeCookie(v),
    {
      onMutate: async ({ gid, id }) => {
        setRemoveApplyStatus(true);
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(["groupId" + gid]);
        // Snapshot the previous value
        const previousGroup = queryClient.getQueryData(["groupId" + gid]);

        queryClient.setQueryData(["groupId" + gid], (old: IGroupsInfo) => {
          old.data[0].cookies = old.data[0].cookies.filter(
            (item: { id: string }) => item.id !== id,
          );
          return old;
        });
        // Return a context object with the snapshotted value
        return { previousGroup, gid };
      },
      onError: (
        err: React.SetStateAction<{ code: number; message: string }>,
        newTodo,
        context,
      ) => {
        setRemoveApplyStatus(false);
        setError(err);
        setTimeout(() => setRemoveApplyStatus(null), 3000);
        queryClient.setQueryData(
          ["groupId" + context.gid],
          context.previousGroup,
        );
      },
      onSuccess: () => {
        setRemoveApplyStatus(null);
        modal.close(null);
      },
      // Always refetch after error or success:
      onSettled: (data, error, variables, context) => {
        queryClient.invalidateQueries(["groupId" + context.gid]);
      },
    },
  );

  let perm = null;

  if (user) {
    user.permissions.isAdminOf.forEach((group) => {
      if (gid === group.id) {
        perm = gid;
      }
    });
  }

  const isDisabled =
    removeApplyStatus !== null || userGettingError || !user || perm == null;

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>
        {t("cookie.removeMenu.main", { name: cookie.username })}{" "}
      </h2>
      <ButtonRow>
        <Button
          name={t("cookie.removeMenu.confirm")}
          style={{ maxWidth: "144px" }}
          disabled={isDisabled}
          callback={() => {
            RemoveAccount.mutate({ gid, id: cookie.id });
          }}
          status={removeApplyStatus}
        />
        <h5
          style={{
            marginBottom: 0,
            alignSelf: "center",
            opacity: removeApplyStatus === false ? 1 : 0,
          }}
        >
          Error {errorUpdating.code}: {errorUpdating.message}
        </h5>
      </ButtonRow>
    </>
  );
}

export function GroupRemoveExclusionPlayer(props: {
  eaid: string;
  gid?: string;
  playerId?: string;
}): React.ReactElement {
  const { gid, eaid, playerId } = props;

  const queryClient = useQueryClient();

  const modal = useModal();
  const { t } = useTranslation();
  const [reason, setReason] = React.useState("");
  const [excludeApplyStatus, setExcludeApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });
  const { isError: userGettingError, data: user } = useUser();

  const RemoveExcludedPlayer = useMutation(
    (v: {
      name: string;
      eaid: string;
      gid: string;
      playerId: string;
      reason: string;
    }) => OperationsApi.globalRemoveExcludePlayer(v),
    {
      onError: (
        err: React.SetStateAction<{ code: number; message: string }>,
      ) => {
        setExcludeApplyStatus(false);
        setError(err);
        setTimeout(() => setExcludeApplyStatus(null), 3000);
      },
      onSuccess: () => {
        setExcludeApplyStatus(null);
        modal.close(null);
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(["globalExclusionList" + gid]);
        queryClient.invalidateQueries(["getExcludedPlayersCount" + gid]);
      },
    },
  );

  let perm = null;

  if (user) {
    user.permissions.isAdminOf.forEach((group) => {
      if (gid === group.id) {
        perm = gid;
      }
    });
  }

  const isDisabled =
    reason === "" ||
    excludeApplyStatus !== null ||
    userGettingError ||
    !user ||
    perm == null;

  const checkReason = (v: string) =>
    checkGameString(v) ? setReason(v) : false;

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>
        {t("server.removeExclusionsMenu.main", { name: props.eaid })}{" "}
      </h2>
      <h5 style={{ maxWidth: "300px" }}>
        {t("server.removeExclusionsMenu.reasonDescription")}
      </h5>
      <TextInput
        value={reason}
        name={t("server.removeExclusionsMenu.reason")}
        callback={(e) => checkReason(e.target.value)}
      />
      <ButtonRow>
        <Button
          name={t("server.removeExclusionsMenu.confirm")}
          style={{ maxWidth: "144px" }}
          disabled={isDisabled}
          callback={() => {
            RemoveExcludedPlayer.mutate({
              gid,
              eaid,
              reason,
              name: props.eaid,
              playerId,
            });
          }}
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

export function GroupRemoveTrackedPlayer(props: {
  eaid: string;
  gid?: string;
  playerId?: string;
}): React.ReactElement {
  const { gid, eaid, playerId } = props;

  const queryClient = useQueryClient();

  const modal = useModal();
  const { t } = useTranslation();
  const [reason, setReason] = React.useState("");
  const [excludeApplyStatus, setExcludeApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });
  const { isError: userGettingError, data: user } = useUser();

  const RemoveTrackedPlayer = useMutation(
    (v: {
      name: string;
      eaid: string;
      gid: string;
      playerId: string;
      reason: string;
    }) => OperationsApi.globalRemoveTrackedPlayer(v),
    {
      onError: (
        err: React.SetStateAction<{ code: number; message: string }>,
      ) => {
        setExcludeApplyStatus(false);
        setError(err);
        setTimeout(() => setExcludeApplyStatus(null), 3000);
      },
      onSuccess: () => {
        setExcludeApplyStatus(null);
        modal.close(null);
      },
      // Always refetch after error or success:
      onSettled: () => {
        queryClient.invalidateQueries(["globalTrackingList" + gid]);
        queryClient.invalidateQueries(["getTrackedPlayersCount" + gid]);
      },
    },
  );

  let perm = null;

  if (user) {
    user.permissions.isAdminOf.forEach((group) => {
      if (gid === group.id) {
        perm = gid;
      }
    });
  }

  const isDisabled =
    reason === "" ||
    excludeApplyStatus !== null ||
    userGettingError ||
    !user ||
    perm == null;

  const checkReason = (v: string) =>
    checkGameString(v) ? setReason(v) : false;

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>
        {t("server.removeTrackingMenu.main", { name: props.eaid })}{" "}
      </h2>
      <h5 style={{ maxWidth: "300px" }}>
        {t("server.removeTrackingMenu.reasonDescription")}
      </h5>
      <TextInput
        value={reason}
        name={t("server.removeTrackingMenu.reason")}
        callback={(e) => checkReason(e.target.value)}
      />
      <ButtonRow>
        <Button
          name={t("server.removeTrackingMenu.confirm")}
          style={{ maxWidth: "144px" }}
          disabled={isDisabled}
          callback={() => {
            RemoveTrackedPlayer.mutate({
              gid,
              eaid,
              reason,
              name: props.eaid,
              playerId,
            });
          }}
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

export function GroupRemoveReason(props: {
  eaid?: string;
  gid?: string;
  reasonId?: string;
}): React.ReactElement {
  const { gid, reasonId } = props;

  const queryClient = useQueryClient();

  const modal = useModal();
  const { t } = useTranslation();
  const [reasonApplyStatus, setReasonApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });
  const { isError: userGettingError, data: user } = useUser();

  const RemoveReason = useMutation(
    (v: { gid: string; reasonId: string }) => OperationsApi.delReason(v),
    {
      onMutate: async ({ gid, reasonId }) => {
        setReasonApplyStatus(true);

        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(["globalReasonList" + gid]);
        // Snapshot the previous value
        const previousReasonlist = queryClient.getQueryData([
          "globalReasonList" + gid,
        ]);

        queryClient.setQueryData(
          ["globalReasonList" + gid],
          (old: IReasonList) => {
            old.data = old.data.filter(
              (item: { id: string }) => item.id !== reasonId,
            );
            return old;
          },
        );
        // Return a context object with the snapshotted value
        return { previousReasonlist, gid };
      },
      onError: (
        err: React.SetStateAction<{ code: number; message: string }>,
        newTodo,
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
      onSettled: (data, error, variables, context) => {
        queryClient.invalidateQueries(["globalReasonList" + context.gid]);
      },
    },
  );

  let perm = null;

  if (user) {
    user.permissions.isAdminOf.forEach((group) => {
      if (gid === group.id) {
        perm = gid;
      }
    });
  }

  const isDisabled =
    reasonApplyStatus !== null || userGettingError || !user || perm == null;

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>
        {t("server.removeReasonMenu.main", { name: props.eaid })}{" "}
      </h2>
      <ButtonRow>
        <Button
          name={t("server.removeReasonMenu.confirm")}
          style={{ maxWidth: "144px" }}
          disabled={isDisabled}
          callback={() => {
            RemoveReason.mutate({ gid, reasonId });
          }}
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
