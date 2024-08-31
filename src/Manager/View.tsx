import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import { OperationsApi } from "../api/api";
import {
  IManGroup,
  IManGroupCookie,
  IManGroupOwner,
  IManGroups,
  IManGroupServer,
} from "../api/ReturnTypes";
import {
  Button,
  ButtonRow,
  Card,
  Column,
  Header,
  Row,
  Switch,
  TextInput,
} from "../components";
import "../locales/config";
import * as styles from "./View.module.css";

export function GroupRow(props: { group: IManGroup }): React.ReactElement {
  const { t } = useTranslation();
  const group = props.group;

  const queryClient = useQueryClient();
  const [groupState, setGroupState] = React.useState(null);
  const [canApply, setCanApply] = React.useState(false);
  const [applyStatus, setApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });

  React.useEffect(() => {
    if (group) {
      const { makeOperations } = group;
      const originalGroupState = { makeOperations };
      if (groupState === null) {
        setGroupState(originalGroupState);
      } else {
        let newCanApply = false;
        for (const i in originalGroupState) {
          newCanApply ||= groupState[i] !== originalGroupState[i];
        }
        setCanApply(newCanApply);
      }
    }
  }, [group, groupState]);

  const editGroupSettings = useMutation({
    mutationFn: (variables: string) =>
      OperationsApi.manEditGroup({ value: variables, gid: group.id }),

    onMutate: async () => {
      setApplyStatus(true);
    },

    onSuccess: async () => {
      setApplyStatus(null);
    },

    onError: async (
      error: React.SetStateAction<{ code: number; message: string }>,
    ) => {
      setApplyStatus(false);
      setError(error);
      setTimeout(() => setApplyStatus(null), 2000);
    },

    onSettled: async () => {
      queryClient.invalidateQueries({
        queryKey: ["server" + group.id]
      });
    }
  });

  const changeGroupState = (v: { makeOperations: boolean }) => {
    setGroupState((s: any) => ({ ...s, ...v }));
  };

  const getGroupValue = (key: string) => {
    if (group && key in group) {
      return group[key];
    }
    return "";
  };
  // const [groupListRef, { width }] = useMeasure();
  //  ref={groupListRef}
  return (
    <div className={styles.GroupRow}>
      <div className={styles.GroupHeader}>
        <span className={styles.GroupName}>{group.groupName}</span>
        <span>{group?.totalAdmins} {t("man.admins.main")} -&nbsp;</span>
        {/* {width < 350? <span></span>: */}
        {/* } */}
        <span className={styles.manageDev}>
          {group.createdAt !== undefined
            ? t("dateTime", { date: new Date(group.createdAt) })
            : "-"}
        </span>
      </div>
      <table className={styles.ManagementTable}>
        <thead>
          <tr className={styles.tableHeaders}>
            <th>{t("man.worker.main")}: {group?.cookieInfo?.length}</th>
            <th>{t("man.worker.lastUpdate")}</th>
          </tr>
        </thead>
        <tbody>
          {group?.cookieInfo &&
            group.cookieInfo.map((account: IManGroupCookie, i: number) => (
              <tr key={i} className={styles.BanRow}>
                <td>
                  <span>{account.cookieAcc}</span>
                </td>
                <td>
                  <span>
                    {account.lastUpdate !== undefined
                      ? t("dateTime", {
                        date: new Date(account.lastUpdate),
                      })
                      : "-"}
                  </span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <table className={styles.ManagementTable}>
        <thead>
          <tr className={styles.tableHeaders}>
            <th>{t("man.owners.main")}: {group?.owners?.length}</th>
            <th>{t("man.owners.createdAt")}</th>
          </tr>
        </thead>
        <tbody>
          {group?.owners &&
            group.owners.map((player: IManGroupOwner, i: number) => (
              <tr key={i} className={styles.BanRow}>
                <td title={player.displayName} className={styles.row}>
                  <div className={styles.AvatarImg}>
                    <img src={player.avatar} alt="" />
                  </div>
                  <span>{player.nickName}</span>
                </td>
                <td>
                  <span>
                    {player.createdAt !== undefined
                      ? t("dateTime", { date: new Date(player.createdAt) })
                      : "-"}
                  </span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <table className={styles.ManagementTable}>
        <thead>
          <tr className={styles.tableHeaders}>
            <th>{t("man.servers.main")}: {group?.servers?.length}</th>
            <th>{t("man.servers.game")}</th>
            <th>{t("man.servers.status")}</th>
            <th>{t("man.servers.autoPingKick")}</th>
            <th>{t("man.servers.autoBanKick")}</th>
            <th>{t("man.servers.autoBfbanKick")}</th>
            <th>{t("man.servers.lastUpdate")}</th>
            <th>{t("man.servers.createdAt")}</th>
          </tr>
        </thead>
        <tbody>
          {group?.servers &&
            group.servers.map((server: IManGroupServer, i: number) => (
              <tr
                key={i}
                className={styles.BanRow}
                style={{
                  color: server?.noUpdateFor30Days ? "#ff6666" : "#d0d0d0",
                }}
              >
                <td>
                  <span>{server.serverName}</span>
                </td>
                <td>
                  <span>{server.game}</span>
                </td>
                <td>
                  <span>
                    {server
                      ? server.isAdmin
                        ? t("serverStatus.running")
                        : t("serverStatus.noAdmin")
                      : t("serverStatus.noServer")}
                  </span>
                </td>
                <td>
                  <span>
                    {server.autoPingKick !== 0
                      ? t("boolean.enabled")
                      : t("boolean.disabled")}
                  </span>
                </td>
                <td>
                  <span>
                    {server.autoBanKick
                      ? t("boolean.enabled")
                      : t("boolean.disabled")}
                  </span>
                </td>
                <td>
                  <span>
                    {server.autoBfbanKick
                      ? t("boolean.enabled")
                      : t("boolean.disabled")}
                  </span>
                </td>
                <td>
                  <span>
                    {server.lastUpdate !== undefined
                      ? t("dateTime", {
                        date: new Date(server.lastUpdate * 1000),
                      })
                      : "-"}
                  </span>
                </td>
                <td>
                  <span>
                    {server.createdAt !== undefined
                      ? t("dateTime", { date: new Date(server.createdAt) })
                      : "-"}
                  </span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <br />
      <h5 className={styles.ManagementTitles}>{t("man.settings.main")}</h5>
      <Switch
        checked={getGroupValue("makeOperations")}
        name={t("man.settings.makeOperations")}
        callback={(v) => changeGroupState({ makeOperations: v })}
      />
      {group && canApply ? (
        <ButtonRow>
          <Button
            name={t("apply")}
            disabled={applyStatus !== null}
            callback={() => editGroupSettings.mutate(groupState)}
            status={applyStatus}
          />
          <h5
            style={{
              marginBottom: 0,
              alignSelf: "center",
              opacity: applyStatus === false ? 1 : 0,
            }}
          >
            Error {errorUpdating.code}: {errorUpdating.message}
          </h5>
        </ButtonRow>
      ) : (
        ""
      )}
    </div>
  );
}

export default function Manager() {
  const { t } = useTranslation();
  document.title = `${t("pageTitle.main")} | ${t("man.main")}`;
  const [searchWord, setSearchWord] = React.useState("");
  const {
    isLoading,
    isError,
    data,
  }: UseQueryResult<IManGroups, { code: number; message: string }> = useQuery({
    queryKey: ["devGroups"],
    queryFn: () => OperationsApi.getManGroups()
  });

  const groups = [];

  if (!isLoading && !isError && data) {
    data.data
      .filter((p: { groupName: string }) =>
        p.groupName.toLowerCase().includes(searchWord.toLowerCase()),
      )
      .forEach((g: IManGroup, i: number) => {
        groups.push(<GroupRow key={i} group={g} />);
      });
  } else if (isError) {
    return <Navigate to="/" />;
  }

  return (
    <Row>
      <Column>
        <Header>
          <h2>{t("man.main")}</h2>
        </Header>
        <Card style={{ paddingTop: "5px" }}>
          <ButtonRow>
            <h2 style={{ marginTop: "8px", marginRight: "10px" }}>
              {t("man.listGroups")}
            </h2>
            <TextInput
              name={t("search")}
              callback={(v) => setSearchWord(v.target.value)}
            />
          </ButtonRow>
          <>{groups}</>
        </Card>
      </Column>
      <Column></Column>
    </Row>
  );
}
