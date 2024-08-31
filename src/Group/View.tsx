import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import cryptoRandomString from "crypto-random-string";
import * as React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useMeasure } from "react-use";
import { IGroupGet, OperationsApi } from "../api/api";
import { statusOnlyGames } from "../Globals";

import { PlayerInfo, StatsPieChart } from "./Charts";
import {
  EmptyRow,
  ExclusionList,
  GameStatsAd,
  GroupLogs,
  ReasonList,
  SeederRow,
  SeederStCustom,
  SeederStCustomRow,
  SeederStRow,
  ServerAliasRow,
  ServerRow,
  TrackingList,
  VBanList,
  WorkerStatus,
} from "./Group";
import * as styles from "./Group.module.css";

import { useTranslation } from "react-i18next";
import { GametoolsApi } from "../api/GametoolsApi";
import {
  IPlatoonApplicant,
  IPlatoonApplicants,
  IPlatoonPlayer,
  IPlatoonResult,
  IPlatoonSearchResult,
  IPlatoonStats,
} from "../api/GametoolsReturnTypes";
import {
  IGroupCookie,
  IGroupInfo,
  IGroupServer,
  IGroupsInfo,
  IGroupStats,
  IGroupUser,
  IGroupUsers,
  ISeeder,
  ISeederInfo,
  ISeederList,
  ISeederServer,
  ISeederServerAliasName,
  IServerStats,
  IUserInfo,
} from "../api/ReturnTypes";
import {
  Button,
  ButtonLink,
  ButtonRow,
  ButtonUrl,
  Card,
  Column,
  DynamicSort,
  FakeUserStRow,
  Header,
  PageCard,
  Row,
  ScrollRow,
  SelectableRow,
  Switch,
  TextInput,
  useModal,
  UserStRow,
} from "../components";
import { IconNotSelected } from "../components/Buttons";
import { ListsLoading } from "../components/User";
import "../locales/config";
import { getLanguage } from "../locales/config";
import { AddAccountModal, ChangeAccountModal } from "./Modals";

// unused
// const deleteIcon = (
//     <svg viewBox="0 0 24 24" style={{ width: '16px' }}>
//         <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
//     </svg>
// );

export function Group(): React.ReactElement {
  const params = useParams();
  const { gid } = params;

  const queryClient = useQueryClient();

  const {
    error: groupError,
    data: groups,
  }: UseQueryResult<IGroupsInfo, { code: number; message: string }> = useQuery({
    queryKey: ["groupId" + gid],
    queryFn: () => OperationsApi.getGroup(gid),
    staleTime: 30000
  });
  const {
    error: userError,
    data: user,
  }: UseQueryResult<IUserInfo, { code: number; message: string }> = useQuery({
    queryKey: ["user"],
    queryFn: () => OperationsApi.user
  });

  const removeAdmin = useMutation({
    mutationFn: (variables: { gid: string; uid: string }) =>
      OperationsApi.removeGroupAdmin(variables),

    // When mutate is called:
    onMutate: async ({ gid, uid }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["groupUsers" + gid]
      });
      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(["groupUsers" + gid]);

      queryClient.setQueryData(["groupUsers" + gid], (old: IGroupUsers) => {
        old.data[0].admins = old.data[0].admins.filter(
          (admin: { id: string }) => admin.id !== uid,
        );
        return old;
      });
      // Return a context object with the snapshotted value
      return { previousUsers, gid };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(
        ["groupUsers" + context.gid],
        context.previousUsers,
      );
    },

    // Always refetch after error or success:
    onSettled: (_data, _error, _variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["groupUsers" + context.gid]
      });
    }
  });

  const removeOwner = useMutation({
    mutationFn: (variables: { gid: string; uid: string }) =>
      OperationsApi.removeGroupOwner(variables),

    // When mutate is called:
    onMutate: async ({ gid, uid }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["groupUsers" + gid]
      });
      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(["groupUsers" + gid]);

      queryClient.setQueryData(["groupUsers" + gid], (old: IGroupUsers) => {
        old.data[0].owners = old.data[0].owners.filter(
          (admin: { id: string }) => admin.id !== uid,
        );
        return old;
      });
      // Return a context object with the snapshotted value
      return { previousUsers, gid };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(
        ["groupUsers" + context.gid],
        context.previousUsers,
      );
    },

    // Always refetch after error or success:
    onSettled: (_data, _error, _variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["groupUsers" + context.gid]
      });
    }
  });

  const group = groups?.data?.length > 0 ? groups?.data[0] : null;
  const [listing, setListing] = React.useState("servers");
  const [settingsListing, setSettingsListing] = React.useState("account");
  const { t } = useTranslation();
  document.title = `${t("pageTitle.main")} ${t("group.main")} | ${group?.groupName || t("loading")
    }`;

  const catListing = {
    owners: (
      <GroupOwners group={group} user={user} gid={gid} onDelete={removeOwner} />
    ),
    admins: (
      <GroupAdmins group={group} user={user} gid={gid} onDelete={removeAdmin} />
    ),
    servers: <GroupServers group={group} user={user} gid={gid} />,
    vbanlist: <VBanList user={user} gid={gid} />,
    exclusionlist: <ExclusionList user={user} gid={gid} />,
    trackinglist: <TrackingList user={user} gid={gid} />,
    reasonList: <ReasonList user={user} gid={gid} />,
    platoons: <GroupPlatoons group={group} user={user} gid={gid} />,
    seeding: <Seeding group={group} user={user} gid={gid} />,
  };

  const catSettings = {
    account: <GroupServerAccount gid={gid} user={user} group={group} />,
    discord: <GroupDiscordSettings gid={gid} user={user} group={group} />,
    settings: <GroupSettings gid={gid} user={user} group={group} />,
    status: <GroupStatus gid={gid} user={user} group={group} />,
    danger: <GroupDangerZone gid={gid} user={user} group={group} />,
    grouplogs: <GroupLogs gid={gid} />,
  };

  const pageCycle = [
    {
      name: t("group.servers.main"),
      callback: () => setListing("servers"),
    },
    {
      name: t("group.platoons.main"),
      callback: () => setListing("platoons"),
    },
    {
      name: t("group.admins.main"),
      callback: () => setListing("admins"),
    },
    {
      name: t("group.owners.main"),
      callback: () => setListing("owners"),
    },
    {
      name: t("group.vban.main"),
      callback: () => setListing("vbanlist"),
    },
    {
      name: t("group.exclusions.main"),
      callback: () => setListing("exclusionlist"),
    },
    {
      name: t("group.tracking.main"),
      callback: () => setListing("trackinglist"),
    },
    {
      name: t("group.reasonList.main"),
      callback: () => setListing("reasonList"),
    },
    {
      name: t("group.seeding.main"),
      callback: () => setListing("seeding"),
    },
  ];

  const settingsCycle = [
    {
      name: t("group.account.main"),
      callback: () => setSettingsListing("account"),
    },
    {
      name: t("group.discord.main"),
      callback: () => setSettingsListing("discord"),
    },
    {
      name: t("group.settings.main"),
      callback: () => setSettingsListing("settings"),
    },
    {
      name: t("group.status.main"),
      callback: () => setSettingsListing("status"),
    },
    {
      name: t("group.danger.main"),
      callback: () => setSettingsListing("danger"),
    },
  ];

  if (group?.isOwner || user?.auth?.isDeveloper) {
    settingsCycle.push({
      name: t("group.logs.main"),
      callback: () => setSettingsListing("grouplogs"),
    });
  }

  if (groupError || userError || groups?.data?.length === 0) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Row>
        <Column>
          <PageCard buttons={settingsCycle} maxWidth={1150}>
            {catSettings[settingsListing]}
          </PageCard>
        </Column>
      </Row>
      <Row>
        <Column>
          <PageCard buttons={pageCycle} maxWidth={1150}>
            {catListing[listing]}
          </PageCard>
        </Column>
      </Row>
    </>
  );
}
function GroupAdmins(props: {
  group: IGroupInfo;
  user: IUserInfo;
  onDelete: { mutate: (arg0?: { gid: string; uid: string }) => void };
  gid: string;
}): React.ReactElement {
  const {
    data: groupUsers,
  }: UseQueryResult<IGroupUsers, { code: number; message: string }> = useQuery({
    queryKey: ["groupUsers" + props.group?.id],
    queryFn: () => OperationsApi.getUsers(props.group?.id),
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });

  const modal = useModal();

  let hasRights = false;
  const [selected, setSelected] = React.useState([]);
  const { t } = useTranslation();

  if (props.group && props.user)
    hasRights = props.group.isOwner || props.user.auth.isDeveloper;

  const fakeListing = [1, 1, 1];

  let adminList: IGroupUser[];
  if (groupUsers) {
    adminList = [...groupUsers.data[0].admins];
    adminList.sort(
      (a: { addedAt: string }, b: { addedAt: string }) =>
        Date.parse(b.addedAt) - Date.parse(a.addedAt),
    );
  }

  const isSelected = selected.length > 0;

  const changeSelected = (v: string, id: number) => {
    setSelected((b) => (!v ? b.filter((item) => item !== id) : [...b, id]));
  };

  const removeAdmins = () => {
    setSelected([]);
    selected.map((o) => props.onDelete.mutate({ gid: props.gid, uid: o }));
  };

  return (
    <>
      <h2>{t("group.admins.main")}</h2>
      <h5>
        {t("group.admins.description0")}
        <br />
        {t("group.admins.description1")}
      </h5>
      {isSelected ? (
        <h5>
          <b>{t("group.admins.selected", { number: selected.length })}</b>
        </h5>
      ) : (
        <h5>{t("group.admins.select")}</h5>
      )}
      <ButtonRow>
        <Button
          name={hasRights ? t("group.admins.add") : t("denied")}
          content={t("group.admins.add")}
          disabled={!hasRights}
          callback={() =>
            modal.show(
              <AddGroupAdmin gid={props.group?.id} callback={modal.close} />,
            )
          }
        />
        <Button
          name={
            hasRights && isSelected
              ? t("group.admins.removeSelected")
              : t("group.admins.remove")
          }
          disabled={!(hasRights && isSelected)}
          callback={removeAdmins}
        />
      </ButtonRow>
      {adminList
        ? adminList.map((admin: IGroupUser, i: number) => (
          <UserStRow
            user={admin}
            callback={(v) => changeSelected(v, admin.id)}
            key={admin.id || i}
          />
        ))
        : fakeListing.map((_, i) => <FakeUserStRow key={i} />)}
    </>
  );
}

function ServerLists(props: { servers: IGroupServer[] }) {
  const { servers } = props;
  const { t } = useTranslation();

  const bf1Servers = servers.filter((s: { game: string }) => s.game === "bf1");
  const bf1Rows = bf1Servers.map((server: IGroupServer, i: number) => (
    <ServerRow server={server} key={i} />
  ));

  const bf5Servers = servers.filter((s: { game: string }) => s.game === "bfv");
  const bf5Rows = bf5Servers.map((server: IGroupServer, i: number) => (
    <ServerRow server={server} key={i} />
  ));

  const bf2042Servers = servers.filter(
    (s: { game: string }) => s.game === "bf2042",
  );
  const bf2042Rows = bf2042Servers.map((server: IGroupServer, i: number) => (
    <ServerRow server={server} key={i} />
  ));

  const bf4Servers = servers.filter((s: { game: string }) => s.game === "bf4");
  const bf4Rows = bf4Servers.map((server: IGroupServer, i: number) => (
    <ServerRow server={server} key={i} />
  ));

  /* <img style={{maxHeight: '14px', marginRight: '15px'}} alt={t("games.bfv")} src={`/img/gameIcons/bfv.png`}/> */

  return (
    <>
      {bf1Rows.length === 0 ? null : (
        <h2 className={styles.ShownGame}>{t("games.bf1")}</h2>
      )}
      {bf1Rows}
      {bf5Rows.length === 0 ? null : (
        <h2 className={styles.ShownGame}>{t("games.bfv")}</h2>
      )}
      {bf5Rows}
      {bf2042Rows.length === 0 ? null : (
        <h2 className={styles.ShownGame}>{t("games.bf2042")}</h2>
      )}
      {bf2042Rows}
      {bf4Rows.length === 0 ? null : (
        <h2 className={styles.ShownGame}>{t("games.bf4")}</h2>
      )}
      {bf4Rows}
    </>
  );
}

function GroupServers(props: {
  group: IGroupInfo;
  user: IUserInfo;
  gid: string;
}): React.ReactElement {
  let hasRights = false;

  if (props.group && props.user)
    hasRights = props.group.isOwner || props.user.auth.isDeveloper;

  const { t } = useTranslation();

  return (
    <>
      <h2>{t("group.servers.main")}</h2>
      <h5>
        {t("group.servers.description0")}
        <br />
        {t("group.servers.description1")}
      </h5>
      {props.group ? (
        <ServerLists servers={props.group.servers} />
      ) : (
        <ListsLoading amount={3} />
      )}
      <ButtonRow>
        {hasRights ? (
          <ButtonLink
            name={t("group.servers.add")}
            to={"/group/" + props.gid + "/add/server"}
          />
        ) : (
          <Button
            disabled={true}
            name={t("denied")}
            content={t("group.servers.add")}
          />
        )}
      </ButtonRow>
    </>
  );
}

function GroupPlatoons(props: {
  group: IGroupInfo;
  user: IUserInfo;
  gid: string;
}): React.ReactElement {
  let hasRights = false;

  const queryClient = useQueryClient();

  const changePlatoon = useMutation({
    mutationFn: (variables: {
      request: string;
      gid: string;
      platoonid: string;
      pid: string;
      memberInfo: IPlatoonPlayer;
    }) => OperationsApi.platoonActions(variables),

    // When mutate is called:
    onMutate: async ({ request, gid, platoonid, pid, memberInfo }) => {
      // Snapshot the previous value
      const previousPlatoonInfo = queryClient.getQueryData([
        "platoonDetails" + gid + platoonid,
      ]);
      const previousGroup = queryClient.getQueryData([
        "platoonApplicants" + gid + platoonid,
      ]);

      if (request == "acceptApplicant") {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries({
          queryKey: ["platoonDetails" + gid + platoonid]
        });
        queryClient.setQueryData(
          ["platoonDetails" + gid + platoonid],
          (old: IPlatoonStats) => {
            old.members.push({ ...memberInfo, role: "Private" });
            return old;
          },
        );
      }
      if (request == "kickMember") {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries({
          queryKey: ["platoonDetails" + gid + platoonid]
        });
        queryClient.setQueryData(
          ["platoonDetails" + gid + platoonid],
          (old: IPlatoonStats) => {
            old.members = old.members.filter(
              (member: { id: string }) => member.id !== pid,
            );
            return old;
          },
        );
      }

      if (["acceptApplicant", "rejectApplicant"].includes(request)) {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries({
          queryKey: [
            "platoonApplicants" + gid + platoonid,
          ]
        });
        queryClient.setQueryData(
          ["platoonApplicants" + gid + platoonid],
          (old: IPlatoonApplicants) => {
            old.result = old.result.filter(
              (applicant: { id: string }) => applicant.id !== pid,
            );
            return old;
          },
        );
      }
      // Return a context object with the snapshotted value
      return { previousGroup, gid, platoonid, request, previousPlatoonInfo };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newTodo, context) => {
      if (["acceptApplicant", "kickMember"].includes(context.request)) {
        queryClient.setQueryData(
          ["platoonDetails" + context.gid, context.platoonid],
          context.previousPlatoonInfo,
        );
      }
      if (["acceptApplicant", "rejectApplicant"].includes(context.request)) {
        queryClient.setQueryData(
          ["platoonApplicants" + context.gid, context.platoonid],
          context.previousGroup,
        );
      }
    },

    // Always refetch after error or success:
    onSettled: (_data, _error, _variables, context) => {
      if (["acceptApplicant", "kickMember"].includes(context.request)) {
        queryClient.invalidateQueries({
          queryKey: [
            "platoonDetails" + context.gid,
            context.platoonid,
          ]
        });
      }
      if (["acceptApplicant", "rejectApplicant"].includes(context.request)) {
        queryClient.invalidateQueries({
          queryKey: [
            "platoonApplicants" + context.gid,
            context.platoonid,
          ]
        });
      }
    }
  });

  const [applicants, setApplicants] = React.useState([]);
  const [members, setMembers] = React.useState([]);
  const [memberSearch, setMemberSearch] = React.useState("");
  const [applicantSearch, setApplicantSearch] = React.useState("");
  if (props.group && props.user)
    hasRights = props.group?.isAdmin || props.user?.auth?.isDeveloper;

  const { t } = useTranslation();

  const platoonIds = props.group ? Object.keys(props.group?.platoons) : [];

  const {
    isLoading,
    isError,
    data: platoons,
  } = useQuery({
    queryKey: ["platoonsDetails" + props.group?.id + platoonIds],

    queryFn: () =>
      GametoolsApi.platoons({
        ids: platoonIds,
        platform: "pc",
        lang: getLanguage(),
      }),

    staleTime: 30000
  });

  return (
    <>
      <h2>{t("group.platoons.main")}</h2>
      <h5>{t("group.platoons.description0")}</h5>
      {props.group && !isLoading && !isError ? (
        Object.keys(props.group?.platoons).length > 0 && (
          <>
            <ButtonRow>
              <h2>{t("group.platoons.applicants.main")}</h2>
              <TextInput
                name={t("search")}
                callback={(v) => setApplicantSearch(v.target.value)}
              />
            </ButtonRow>
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                marginTop: "8px",
              }}
            >
              {Object.keys(props.group.platoons).map((platoonId, index) => {
                return (
                  <PlatoonApplicants
                    group={props.group}
                    platoonId={platoonId}
                    platoonInfo={platoons[platoonId]}
                    applicantSearch={applicantSearch}
                    callback={(v, platoonId, member) =>
                      setApplicants((b) =>
                        !v
                          ? b.filter(
                            (item) =>
                              item?.playerId !== member.id &&
                              item?.platoonId != platoonId,
                          )
                          : [
                            ...b,
                            {
                              playerId: member.id,
                              platoonId: platoonId,
                              memberInfo: member,
                            },
                          ],
                      )
                    }
                    key={index}
                  />
                );
              })}
            </div>
            <ButtonRow>
              {hasRights && applicants?.length > 0 ? (
                <>
                  <Button
                    name={t("group.platoons.applicants.accept")}
                    callback={() => {
                      applicants.map((o) =>
                        changePlatoon.mutate({
                          request: "acceptApplicant",
                          gid: props.gid,
                          platoonid: o.platoonId,
                          pid: o.playerId,
                          memberInfo: o.memberInfo,
                        }),
                      );
                      setApplicants([]);
                    }}
                  />
                  <Button
                    name={t("group.platoons.applicants.decline")}
                    callback={() => {
                      applicants.map((o) =>
                        changePlatoon.mutate({
                          request: "rejectApplicant",
                          gid: props.gid,
                          platoonid: o.platoonId,
                          pid: o.playerId,
                          memberInfo: o.memberInfo,
                        }),
                      );
                      setApplicants([]);
                    }}
                  />
                </>
              ) : (
                <>
                  <Button
                    disabled={true}
                    name={t("group.platoons.applicants.accept")}
                  />
                  <Button
                    disabled={true}
                    name={t("group.platoons.applicants.decline")}
                  />
                </>
              )}
            </ButtonRow>
            <ButtonRow>
              <h2>{t("group.platoons.members.main")}</h2>
              <TextInput
                name={t("search")}
                callback={(v) => setMemberSearch(v.target.value)}
              />
            </ButtonRow>
            <div
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                marginTop: "8px",
              }}
            >
              {Object.values(platoons)
                .map((platoon: IPlatoonStats) =>
                  platoon.members.map((player: IPlatoonPlayer) => {
                    player.platoon = platoon.name;
                    player.platoonId = platoon.id;
                    return player;
                  }),
                )
                .flat()
                .filter(
                  (p) =>
                    p?.name?.toLowerCase().includes(memberSearch.toLowerCase()),
                )
                .sort(DynamicSort("name"))
                .map((player, memberIndex) => {
                  return (
                    <SelectableRow
                      key={memberIndex}
                      callback={(v) =>
                        setMembers((b) =>
                          !v
                            ? b.filter(
                              (item) =>
                                item?.playerId !== player.id &&
                                item?.platoonId != player.platoonId,
                            )
                            : [
                              ...b,
                              {
                                playerId: player.id,
                                platoonId: player.platoonId,
                                memberInfo: player,
                              },
                            ],
                        )
                      }
                    >
                      <div className={styles.DiscordName}>{player.name}</div>
                      <div className={styles.ServerAliasName}>
                        {player.role}
                      </div>
                      <div className={styles.ServerAliasName}>
                        {player.platoon}
                      </div>
                    </SelectableRow>
                  );
                })}
            </div>
            <ButtonRow>
              {hasRights && members.length > 0 ? (
                <Button
                  name={t("group.platoons.members.remove")}
                  callback={() => {
                    members.map((o) =>
                      changePlatoon.mutate({
                        request: "kickMember",
                        gid: props.gid,
                        platoonid: o.platoonId,
                        pid: o.playerId,
                        memberInfo: o.memberInfo,
                      }),
                    );
                    setMembers([]);
                  }}
                />
              ) : (
                <Button
                  disabled={true}
                  name={t("group.platoons.members.remove")}
                />
              )}
            </ButtonRow>
          </>
        )
      ) : (
        <>{t("loading")}</>
      )}
      <PlatoonList
        isError={isError}
        isLoading={isLoading}
        platoons={platoons}
        gid={props.gid}
        group={props.group}
        user={props.user}
      />
    </>
  );
}

function PlatoonList(props: {
  platoons: { [name: string]: IPlatoonStats };
  isError: boolean;
  isLoading: boolean;
  gid: string;
  group: IGroupInfo;
  user: IUserInfo;
}): React.ReactElement {
  const { platoons, isError, isLoading } = props;
  const [selected, setSelected] = React.useState([]);
  const { t } = useTranslation();

  let hasRights = false;
  if (props.group && props.user)
    hasRights = props.group.isOwner || props.user.auth.isDeveloper;

  const removePlatoons = useMutation({
    mutationFn: // {
      //   // When mutate is called:
      //   onMutate: async ({ gid, platoonIds }) => {
      //     // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      //     await queryClient.cancelQueries(["groupId" + gid]);
      //     // Snapshot the previous value
      //     const previousGroup = queryClient.getQueryData(["groupId" + gid]);
      //     queryClient.setQueryData(["groupId" + gid], (old: IGroupsInfo) => {
      //       old.data[0].platoons = Object.fromEntries(
      //         Object.entries(old.data[0].platoons).filter(
      //           ([key]) => !platoonIds.includes(key),
      //         ),
      //       );
      //       return old;
      //     });
      //     // Return a context object with the snapshotted value
      //     return { previousGroup, gid };
      //   },
      //   // If the mutation fails, use the context returned from onMutate to roll back
      //   onError: (_err, _newTodo, context) => {
      //     queryClient.setQueryData(
      //       ["groupId" + context.gid],
      //       context.previousGroup,
      //     );
      //   },
      //   // Always refetch after error or success:
      //   onSettled: (_data, _error, _variables, context) => {
      //     queryClient.invalidateQueries(["groupId" + context.gid]);
      //   },
      // },
      (variables: { gid: string; platoonIds: string[] }) =>
        OperationsApi.removeGroupPlatoons(variables)
  });

  return (
    <>
      <h2>{t("group.platoons.main")}</h2>
      {!isLoading && !isError ? (
        Object.values(platoons).map((platoon: IPlatoonStats, index: number) => {
          return (
            <SelectableRow
              key={index}
              callback={(v) => {
                setSelected((b) =>
                  !v
                    ? b.filter((item) => item !== platoon.id)
                    : [...b, platoon.id],
                );
              }}
            >
              <div className={styles.DiscordName}>{platoon.name}</div>
            </SelectableRow>
          );
        })
      ) : (
        <>{t("loading")}</>
      )}
      <ButtonRow>
        {hasRights ? (
          <ButtonLink
            name={t("group.platoons.add")}
            to={"/group/" + props.gid + "/add/platoon"}
          />
        ) : (
          <Button
            disabled={true}
            name={t("denied")}
            content={t("group.platoons.add")}
          />
        )}
        {hasRights && selected.length > 0 ? (
          <Button
            name={t("group.platoons.remove")}
            callback={() => {
              removePlatoons.mutate({ gid: props.gid, platoonIds: selected });
              setSelected([]);
            }}
          />
        ) : (
          <Button disabled={true} name={t("group.platoons.remove")} />
        )}
      </ButtonRow>
    </>
  );
}

function PlatoonApplicants(props: {
  group: IGroupInfo;
  platoonId: string;
  platoonInfo: IPlatoonStats;
  applicantSearch: string;
  callback?: (
    selected: boolean,
    platoonId: string,
    player: IPlatoonApplicant,
  ) => void;
}): React.ReactElement {
  const { group, platoonId, platoonInfo, applicantSearch } = props;
  const {
    isLoading,
    isError,
    data: applicants,
  } = useQuery({
    queryKey: ["platoonApplicants" + group.id + platoonId],
    queryFn: () => GametoolsApi.platoonApplicants({ groupId: group.id, platoonId }),
    staleTime: 30000
  });
  const { t } = useTranslation();

  if (!isLoading && !isError) {
    return (
      <>
        {applicants?.result
          ?.filter(
            (p) =>
              p?.name?.toLowerCase().includes(applicantSearch.toLowerCase()),
          )
          .map((key: IPlatoonApplicant, index: number) => {
            return (
              <SelectableRow
                key={index}
                callback={(v) => props.callback(v, platoonId, key)}
              >
                <div className={styles.DiscordName}>{key.name}</div>
                <div className={styles.DateAdded}>
                  {t("date", { date: new Date(key.timeStamp * 1000) })}
                </div>
                <div className={styles.ServerAliasName}>
                  {platoonInfo?.name}
                </div>
              </SelectableRow>
            );
          })}
      </>
    );
  }
  return <></>;
}

function Seeding(props: {
  group: IGroupInfo;
  user: IUserInfo;
  gid: string;
}): React.ReactElement {
  const modal = useModal();

  let hasRights = false;
  const [selected, setSelected] = React.useState(null);
  const [customServerName, setCustomServerName] = React.useState("");
  const [broadcast, setBroadcast] = React.useState("");
  const [serverAliases, setServerAliases] = React.useState({});
  const [notJoining, setNotJoining] = React.useState("");
  const [game, setGame] = React.useState("bf1");

  const [hour, setHour] = React.useState("7");
  const [minute, setMinute] = React.useState("0");
  const [rejoin, setRejoin] = React.useState(undefined);
  const { t } = useTranslation();

  if (props.group && props.user)
    hasRights =
      props.group.isOwner || props.group.isAdmin || props.user.auth.isDeveloper;
  const {
    data: seedingInfo,
  }: UseQueryResult<ISeederInfo, { code: number; message: string }> = useQuery({
    queryKey: ["seeding" + props.gid + game],
    queryFn: () => OperationsApi.getSeeding(props.gid, game),
    staleTime: 30000
  });
  const {
    data: seeders,
  }: UseQueryResult<ISeederList, { code: number; message: string }> = useQuery({
    queryKey: ["seeders" + props.gid + game],
    queryFn: () => OperationsApi.getSeeders(props.gid, game),
    staleTime: 30000
  });
  const {
    data: serverAliasNames,
  }: UseQueryResult<ISeederServerAliasName, { code: number; message: string }> =
    useQuery({
      queryKey: ["serveraliasname" + props.gid + game],
      queryFn: () => OperationsApi.getServerAliases(props.gid, game),
      staleTime: 30000
    });
  const queryClient = useQueryClient();
  const fakeListing = [1, 1, 1];

  let ingameAmount = 0;
  if (seeders) {
    ingameAmount = seeders.seeders.filter(
      (seeder: ISeeder) => seeder.isRunning,
    ).length;
  }

  let serverList: IGroupServer[];
  let seederServerList: ISeederServer[];
  if (props.group) {
    serverList = [...props.group.servers];
    serverList.sort((a: { name }, b: { name }) => b.name - a.name);
    serverList = serverList.filter((a: { game: string }) => a.game === game);

    if (props.group.seederServers != undefined) {
      seederServerList = [...props.group.seederServers];
      seederServerList.sort((a: { name }, b: { name }) => b.name - a.name);
      seederServerList = seederServerList.filter(
        (a: { game: string }) => a.game === game,
      );
    }
  }

  React.useEffect(() => {
    if (seedingInfo) {
      if (rejoin === undefined) {
        setRejoin(seedingInfo.rejoin);
      }

      if (serverAliasNames && seeders) {
        const seederlist = {};
        let playerNotJoining = "";

        seeders.seeders.map(
          (value: ISeeder) => (seederlist[value.seederName] = value.isRunning),
        );

        const serverAlias: { [string: string]: { joined: 0; other: 0 } } = {};
        Object.entries(serverAliasNames).map(
          ([, value]) => (serverAlias[value] = { joined: 0, other: 0 }),
        );
        Object.entries(seedingInfo.keepAliveSeeders).map(([key, value]) => {
          const server = serverAlias[value?.serverName];
          if (server)
            seederlist[key]
              ? (server.joined += 1)
              : ((server.other += 1), (playerNotJoining += `${key}, `));
        });

        setNotJoining(playerNotJoining);
        setServerAliases(serverAlias);
      }
    }
  }, [seedingInfo, serverAliasNames]);

  const isSelected = selected !== undefined;

  const changeSelected = (i: number, e: string) => {
    if (i === 90) {
      if (e) {
        setCustomServerName(e);
      }
      setSelected(i);
    } else {
      setSelected(() => (i !== selected ? i : undefined));
    }
  };

  const joinServer = () => {
    let server: IGroupServer;
    if (selected === 90) {
      server = { name: customServerName, id: "" };
    } else if (selected >= 900) {
      server = { name: seederServerList.at(selected - 900)?.name, id: "" };
    } else {
      server = props.group.servers[selected];
    }
    OperationsApi.setSeeding({
      serverName: server.name,
      serverId: server.id,
      action: "joinServer",
      groupId: props.gid,
      rejoin: rejoin,
      message: "",
      game: game,
    });
    setSelected(undefined);
    let timeout = 300;
    if (selected === 90) {
      timeout = 1000;
    }
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ["seeding" + props.gid + game]
      });
    }, timeout);
  };

  const addSeederServer = (servername) => {
    OperationsApi.addSeederServer({
      servername: servername,
      groupId: props.gid,
      game: game,
    });
    setSelected(undefined);
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ["groupId" + props.gid]
      });
    }, 150);
  };

  const removeSeederServer = (servername) => {
    OperationsApi.delSeederServer({
      servername: servername,
      groupId: props.gid,
      game: game,
    });
    setSelected(undefined);
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ["groupId" + props.gid]
      });
    }, 150);
  };

  const scheduleSeed = () => {
    let server: IGroupServer;
    if (selected === 90) {
      server = { name: customServerName, id: "" };
    } else {
      server = props.group.servers[selected];
    }
    OperationsApi.scheduleSeeding({
      timeStamp: `${hour}:${minute}0`,
      serverName: server.name,
      groupId: props.gid,
    });
    setSelected(undefined);
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ["seeding" + props.gid]
      });
    }, 1000);
  };

  return (
    <>
      <h2>{t("group.seeding.main")}</h2>
      <h5>
        {t("group.seeding.description0")}
        <br />
        {t("group.seeding.description2")}
        <br />
        <a
          alt=""
          href="https://github.com/community-network/bf1-seeder"
          rel="noreferrer"
          target="_blank"
        >
          {t("group.seeding.app")}
        </a>
      </h5>
      {seedingInfo &&
        (seedingInfo.startServer !== null ? (
          <h5 style={{ marginBottom: "0px", marginTop: "10px" }}>
            <b>
              {t("group.seeding.scheduled.true", {
                serverName: seedingInfo.startServer,
                startTime: seedingInfo.startTime,
              })}
            </b>
          </h5>
        ) : (
          <h5 style={{ marginBottom: "0px", marginTop: "10px" }}>
            {t("group.seeding.scheduled.false")}
          </h5>
        ))}
      <ButtonRow>
        <select
          className={styles.SwitchGame}
          value={hour}
          onChange={(e) => setHour(e.target.value)}
        >
          {[...Array(24)].map((_, i) => {
            return (
              <option key={i} value={i}>
                {i}
              </option>
            );
          })}
        </select>
        <select
          className={styles.SwitchGame}
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
        >
          <option value="0">0</option>
          <option value="3">30</option>
        </select>
        {hasRights && isSelected ? (
          <Button
            name={t("group.seeding.actions.schedule")}
            callback={scheduleSeed}
          />
        ) : (
          <Button disabled={true} name={t("group.seeding.actions.schedule")} />
        )}
        {hasRights && seedingInfo && seedingInfo.startTime !== null ? (
          <Button
            name={t("group.seeding.actions.undoSchedule")}
            callback={() =>
              modal.show(
                <UnscheduleSeed gid={props.group.id} callback={modal.close} />,
              )
            }
          />
        ) : (
          <Button
            disabled={true}
            name={t("denied")}
            content={t("group.seeding.actions.undoSchedule")}
          />
        )}
      </ButtonRow>
      <h2 style={{ marginBottom: "0px", marginTop: "16px" }}>
        {t("group.seeding.main")}
      </h2>
      {seedingInfo &&
        (seedingInfo.action === "joinServer" ? (
          <h5>
            {t("group.seeding.status.main")}
            <b>
              {t("group.seeding.status.seedServer", {
                serverName: seedingInfo.serverName,
              })}
            </b>
          </h5>
        ) : seedingInfo.action === "broadcastMessage" ? (
          <h5>
            {t("group.seeding.status.main")}
            <b>
              {t("group.seeding.status.broadcastMessage", {
                message: seedingInfo.gameId,
              })}
            </b>
          </h5>
        ) : (
          <h5>
            {t("group.seeding.status.main")}
            <b>{t(`group.seeding.status.${seedingInfo.action}`)}</b>
          </h5>
        ))}
      <ButtonRow>
        <select
          className={styles.SwitchGame}
          value={game}
          onChange={(e) => setGame(e.target.value)}
        >
          <option value="bf1">{t("group.seeding.game.bf1")}</option>
          <option value="bf4">{t("group.seeding.game.bf4")}</option>
        </select>
        <select
          className={styles.SwitchGame}
          value={rejoin}
          onChange={(e) => setRejoin(e.target.value === "true")}
        >
          <option value="true">{t("group.seeding.auto-rejoin.true")}</option>
          <option value="false">{t("group.seeding.auto-rejoin.false")}</option>
        </select>
        {hasRights && isSelected ? (
          <Button
            name={t("group.seeding.actions.joinSelected")}
            callback={joinServer}
          />
        ) : (
          <Button
            disabled={true}
            name={t("group.seeding.actions.joinSelected")}
          />
        )}
        {hasRights ? (
          <Button
            name={t("group.seeding.actions.leave")}
            callback={() =>
              modal.show(
                <LeaveServer
                  gid={props.group.id}
                  textItem={"leave"}
                  option={"leaveServer"}
                  callback={modal.close}
                  rejoin={rejoin}
                  game={game}
                />,
              )
            }
          />
        ) : (
          <Button
            disabled={true}
            name={t("denied")}
            content={t("group.seeding.actions.leave")}
          />
        )}
        {hasRights ? (
          <Button
            name={t("group.seeding.actions.shutdownWindows")}
            callback={() =>
              modal.show(
                <LeaveServer
                  gid={props.group.id}
                  textItem={"shutdownWindows"}
                  option={"shutdownPC"}
                  callback={modal.close}
                  rejoin={rejoin}
                  game={game}
                />,
              )
            }
          />
        ) : (
          <Button
            disabled={true}
            name={t("denied")}
            content={t("group.seeding.actions.shutdownWindows")}
          />
        )}
      </ButtonRow>
      {props.group
        ? serverList.map((server: IGroupServer, i: number) => (
          <SeederStRow
            server={server}
            selected={selected === i}
            callback={() => changeSelected(i, undefined)}
            key={server.id || i}
          />
        ))
        : fakeListing.map((_, i) => <FakeUserStRow key={i} />)}
      <h2 style={{ marginTop: "6px" }}>{t("group.seeding.other.main")}</h2>
      {props.group
        ? seederServerList.map((server: ISeederServer, i: number) => (
          <SeederStCustomRow
            server={server}
            selected={selected === i + 900}
            onClick={removeSeederServer}
            callback={() => changeSelected(i + 900, server.name)}
            key={i + 900}
          />
        ))
        : fakeListing.map((_, i) => <FakeUserStRow key={i} />)}
      <SeederStCustom
        selected={selected === 90}
        callback={(e) => changeSelected(90, e)}
        onClick={addSeederServer}
        key={90}
      />
      <h2 style={{ marginBottom: "4px", marginTop: "16px" }}>
        {t("group.seeding.broadcast.main")}
      </h2>
      <Row>
        <TextInput
          callback={(e) => setBroadcast(e.target.value)}
          defaultValue={broadcast}
          name={t("group.seeding.broadcast.message")}
        />
        {hasRights && broadcast !== "" ? (
          <Button
            name={t("group.seeding.broadcast.sendMessage")}
            callback={() =>
              modal.show(
                <SeederBroadcast
                  gid={props.group.id}
                  message={broadcast}
                  callback={modal.close}
                  rejoin={rejoin}
                  game={game}
                />,
              )
            }
          />
        ) : (
          <Button
            disabled={true}
            name={t("denied")}
            content={t("group.seeding.broadcast.sendMessage")}
          />
        )}
      </Row>
      <h2 style={{ marginBottom: "4px", marginTop: "16px" }}>
        {t("group.seeding.seeders.main", {
          seeders: seeders ? seeders.seeders.length : 0,
          ingame: ingameAmount,
        })}
      </h2>
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {seeders && seedingInfo && props.group
          ? seeders.seeders.map((seeder: ISeeder, i: number) => (
            <SeederRow seeder={seeder} key={i} seedingInfo={seedingInfo} />
          ))
          : Array.from({ length: 8 }, (_, id) => ({ id })).map((_, i) => (
            <EmptyRow key={i} />
          ))}
      </div>
      {serverAliasNames && (
        <>
          <h2 style={{ marginBottom: "4px", marginTop: "16px" }}>
            Keepalive server list
          </h2>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {Object.entries(serverAliasNames).map(([key, value], i) =>
              key !== "groupId" ? (
                <ServerAliasRow
                  servername={value}
                  serverId={key}
                  key={i}
                  serveraliasinfo={serverAliases}
                />
              ) : (
                <div key={i}></div>
              ),
            )}
          </div>
          <h5 style={{ marginBottom: "4px", marginTop: "16px" }}>
            Failed to multialive:
            <br />
            {notJoining}
          </h5>
        </>
      )}
    </>
  );
}

function GroupOwners(props: {
  group: IGroupInfo;
  user: IUserInfo;
  onDelete: { mutate: (arg0?: { gid: string; uid: string }) => void };
  gid: string;
}): React.ReactElement {
  const modal = useModal();
  const [selected, setSelected] = React.useState([]);
  const { t } = useTranslation();

  const {
    data: groupUsers,
  }: UseQueryResult<IGroupUsers, { code: number; message: string }> = useQuery({
    queryKey: ["groupUsers" + props.group?.id],
    queryFn: () => OperationsApi.getUsers(props.group?.id),
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });

  let hasRights = false;
  if (props.group && props.user)
    hasRights = props.group.isOwner || props.user.auth.isDeveloper;

  const fakeListing = [1, 1, 1];

  let ownerList: IGroupUser[];
  if (groupUsers) {
    ownerList = [...groupUsers.data[0].owners];
    ownerList.sort(
      (a: { addedAt: string }, b: { addedAt: string }) =>
        Date.parse(b.addedAt) - Date.parse(a.addedAt),
    );
  }

  const isSelected = selected.length > 0;

  const changeSelected = (v: string, id: number) => {
    setSelected((b) => (!v ? b.filter((item) => item !== id) : [...b, id]));
  };

  const removeOwners = () => {
    setSelected([]);
    selected.map((o) => props.onDelete.mutate({ gid: props.gid, uid: o }));
  };

  return (
    <>
      <h2>{t("group.owners.main")}</h2>
      <h5>
        {t("group.owners.description0")}
        <br />
        {t("group.owners.description1")}
      </h5>
      {isSelected ? (
        <h5>
          <b>{t("group.owners.selected", { number: selected.length })}</b>
        </h5>
      ) : (
        <h5>{t("group.owners.select")}</h5>
      )}
      <ButtonRow>
        <Button
          name={hasRights ? t("group.owners.add") : t("denied")}
          disabled={!hasRights}
          content={t("group.owners.add")}
          callback={() =>
            modal.show(
              <AddGroupOwner gid={props.group?.id} callback={modal.close} />,
            )
          }
        />
        <Button
          name={
            hasRights && isSelected
              ? t("group.owners.removeSelected")
              : t("group.owners.remove")
          }
          callback={removeOwners}
          disabled={!(hasRights && isSelected)}
        />
      </ButtonRow>
      {ownerList
        ? ownerList.map((owner: IGroupUser, i: number) => (
          <UserStRow
            user={owner}
            callback={(v) => changeSelected(v, owner.id)}
            key={owner.id || i}
          />
        ))
        : fakeListing.map((_, i) => <FakeUserStRow key={i} />)}
    </>
  );
}

function GroupServerAccount(
  props: JSX.IntrinsicAttributes & {
    group: IGroupInfo;
    gid: string;
    user: IUserInfo;
    cookie?: IGroupCookie;
  },
): React.ReactElement {
  let hasRights = false;

  if (props.group && props.user)
    hasRights = props.group?.isOwner || props.user?.auth?.isDeveloper;

  const { t } = useTranslation();
  const modal = useModal();

  return (
    <>
      <h2>
        {t("group.name")} -{" "}
        {!!props.group ? props.group.groupName : t("pending")}
      </h2>
      <h5 className={styles.GroupId}>
        {t("group.id")}
        <span className={styles.GroupIdentity}>{props.gid}</span>
      </h5>

      <h2>Accounts used for group</h2>
      <h5 style={{ marginTop: "0px" }}>
        {t("createGroup.cookieDescription2")}
      </h5>
      <ScrollRow>
        {props?.group?.cookies?.map((cookie: IGroupCookie, index: number) => {
          return (
            <div key={index}>
              <AccountInfo {...props} cookie={cookie} />
            </div>
          );
        })}
      </ScrollRow>

      <ButtonRow>
        <Button
          name={hasRights ? t("cookie.add") : t("denied")}
          content={t("cookie.add")}
          disabled={!hasRights}
          callback={() =>
            modal.show(
              <AddAccountModal
                gid={props.gid}
                group={props.group}
                user={props.user}
                callback={modal.close}
              />,
            )
          }
        />
      </ButtonRow>
    </>
  );
}

function AccountInfo(props: {
  group: IGroupInfo;
  gid: string;
  user: IUserInfo;
  cookie: IGroupCookie;
}) {
  const { group, gid, user, cookie } = props;
  const { t } = useTranslation();
  const modal = useModal();
  return (
    <>
      <div
        className={styles.AccountInfo}
        onClick={() =>
          modal.show(
            <ChangeAccountModal
              gid={gid}
              group={group}
              cookie={cookie}
              user={user}
              callback={modal.close}
            />,
          )
        }
      >
        <h2>
          {!group
            ? t("cookie.status.loading")
            : !cookie?.username
              ? t("cookie.status.pending")
              : cookie?.username}
          {group && !cookie?.validCookie && (
            <span style={{ color: "#FF7575" }}>
              {" - "}
              {t("cookie.invalid")}
            </span>
          )}
        </h2>
        <h5 style={{ marginTop: "0px" }}>
          {t("group.account.description0")}
          <br />
          {t("group.account.description1")}
          <i>accounts.ea.com</i>
        </h5>
        <h5 style={{ marginTop: "0px" }}>
          {t("cookie.supportedGames.main")}
          {cookie?.supportedGames
            .sort()
            .map((supportedGame: string, i: number) => {
              if (cookie.supportedGames.length - 1 !== i) {
                return ` ${t(`games.${supportedGame}`)},`;
              } else {
                return ` ${t(`games.${supportedGame}`)}`;
              }
            })}
        </h5>
        <h5 style={{ marginTop: "0px" }}>
          {group?.defaultCookie === cookie?.id
            ? t("cookie.accountType.default")
            : t("cookie.accountType.extra")}
        </h5>
      </div>
    </>
  );
}

function GroupDiscordSettings(props: {
  group: IGroupInfo;
  user: IUserInfo;
  gid: string;
}): React.ReactElement {
  let allowedTo = false;
  if (props.group && props.user)
    allowedTo = props.group.isOwner || props.user.auth.isDeveloper;

  const queryClient = useQueryClient();

  const [adminId, setAdminId] = React.useState("");
  const [modId, setModId] = React.useState("");
  const [serverId, setServerId] = React.useState("");
  const [applyStatus, setApplyStatus] = React.useState(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (props.group) {
      if (serverId !== props.group.discordGroupId)
        setServerId(props.group.discordGroupId);

      if (modId !== props.group.discordModRoleId)
        setModId(props.group.discordModRoleId);

      if (adminId !== props.group.discordAdminRoleId)
        setAdminId(props.group.discordAdminRoleId);
    }
  }, [props.group]);

  const editDiscordDetails = useMutation({
    mutationFn: (variables: {
      gid: string;
      type?: string;
      value: {
        [string: string]: string | number | boolean;
      };
    }) => OperationsApi.editGroup(variables),

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
      queryClient.invalidateQueries({
        queryKey: ["groupId" + props.gid]
      });
    }
  });

  return (
    <>
      <GameStatsAd />
      <h5 style={{ marginTop: "8px" }}>
        {t("group.discord.description0")}
        <br />
        {t("group.discord.description1")}
      </h5>
      <h5>{t("group.discord.commandList")}</h5>
      <Row>
        <TextInput
          disabled={!allowedTo}
          callback={(e) => setServerId(e.target.value)}
          defaultValue={serverId}
          name={t("discord.id")}
        />
        <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
          {t("discord.idDescription")}
        </p>
      </Row>
      <h5 style={{ marginTop: "8px" }}>
        {t("group.discord.permDescription0")}
        <br />
        {t("group.discord.permDescription1")}
      </h5>
      <Row>
        <TextInput
          disabled={!allowedTo}
          callback={(e) => setAdminId(e.target.value)}
          defaultValue={adminId}
          name={t("discord.adminId")}
        />
        <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
          {t("discord.adminIdDescription")}
        </p>
      </Row>
      <Row>
        <TextInput
          disabled={!allowedTo}
          callback={(e) => setModId(e.target.value)}
          defaultValue={modId}
          name={t("discord.modId")}
        />
        <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
          {t("discord.modIdDescription")}
        </p>
      </Row>
      {props.group &&
        (serverId !== props.group.discordGroupId ||
          modId !== props.group.discordModRoleId ||
          adminId !== props.group.discordAdminRoleId) ? (
        <ButtonRow>
          <Button
            name={t("apply")}
            disabled={!allowedTo || applyStatus !== null}
            callback={() =>
              editDiscordDetails.mutate({
                gid: props.gid,
                value: {
                  discordGroupId: serverId,
                  discordModRoleId: modId,
                  discordAdminRoleId: adminId,
                },
              })
            }
            status={applyStatus}
          />
        </ButtonRow>
      ) : (
        ""
      )}
    </>
  );
}

function GroupSettings(props: {
  group: IGroupInfo;
  user: IUserInfo;
  gid: string;
}): React.ReactElement {
  let allowedTo = false;
  if (props.group && props.user)
    allowedTo = props.group.isOwner || props.user.auth.isDeveloper;

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [tokenDisabled, setTokenDisabled] = React.useState(
    props.group ? props.group.tokenUsed : false,
  );
  const [groupState, setGroupState] = React.useState(null);
  const [canApply, setCanApply] = React.useState(false);
  const [applyStatus, setApplyStatus] = React.useState(null);

  React.useEffect(() => {
    if (props.group) {
      const { visableBans, cookieLocale } = props.group;
      let token: string;
      const originalGroupState = {
        visableBans,
        cookieLocale,
        token: props.group.tokenUsed ? "-" : "",
      };
      if (groupState === null) {
        setGroupState(originalGroupState);
        setTokenDisabled(token !== "");
      } else {
        let newCanApply = false;
        for (const i in originalGroupState) {
          newCanApply ||= groupState[i] !== originalGroupState[i];
        }
        if (groupState.token === "") setTokenDisabled(false);
        setCanApply(newCanApply);
      }
    }
  }, [props.group, groupState]);

  const changeGroupState = (v: {
    visableBans?: boolean;
    cookieLocale?: string;
    token?: string;
  }) => {
    setGroupState((s) => ({ ...s, ...v }));
  };

  const editGroupSettings = useMutation({
    mutationFn: (variables: { [string: string]: string | number | boolean }) =>
      OperationsApi.editGroup({ value: variables, gid: props.gid }),

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
      queryClient.invalidateQueries({
        queryKey: ["groupId" + props.gid]
      });
    }
  });

  const getGroupValue = (key: string) => {
    if (props.group && key in props.group) {
      return props.group[key];
    }
    return "";
  };

  return (
    <>
      <h5>{t("group.settings.visableBansDesc")}</h5>
      <Switch
        checked={getGroupValue("visableBans")}
        name={t("group.settings.visableBans")}
        callback={(v) => changeGroupState({ visableBans: v })}
      />
      <h5 style={{ marginTop: "8px" }}>
        {t("group.settings.localeDescription0")}
        <br />
        {t("group.settings.localeDescription1")}
        <a
          href="https://www.oracle.com/java/technologies/javase/jdk8-jre8-suported-locales.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Oracle.com
        </a>
      </h5>
      <Row>
        <TextInput
          type="text"
          disabled={!allowedTo}
          callback={(e) => changeGroupState({ cookieLocale: e.target.value })}
          defaultValue={getGroupValue("cookieLocale")}
          name={t("cookie.locale")}
        />
        <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
          {t("cookie.locale")}
        </p>
      </Row>
      <h5 style={{ paddingTop: "1rem" }}>
        {t("group.settings.tokenDescription0")}
        <br />
        {t("group.settings.tokenDescription1")}
      </h5>
      <Switch
        checked={tokenDisabled}
        name={t("group.settings.tokenEnable")}
        callback={(v) => {
          let token = "";
          setTokenDisabled(v);
          !v ? (token = "") : (token = cryptoRandomString({ length: 40 }));
          document.getElementsByTagName("input")[1].value = token;
          changeGroupState({ token: token });
        }}
      />
      <Row>
        <TextInput
          type="text"
          disabled={!allowedTo || !tokenDisabled}
          callback={(e) => changeGroupState({ token: e.target.value })}
          defaultValue={getGroupValue("token")}
          name={t("group.settings.token")}
        />
        <Button
          name={t("group.settings.tokenGen")}
          callback={() => {
            const token = cryptoRandomString({ length: 40 });
            changeGroupState({ token: token });
            document.getElementsByTagName("input")[1].value = token;
          }}
        />
      </Row>
      <ButtonRow>
        <ButtonUrl
          href={`https://manager-api.gametools.network/docs/`}
          name={t("ApiInfo.link")}
        />
      </ButtonRow>
      {props.group && canApply ? (
        <ButtonRow>
          <Button
            name={t("apply")}
            disabled={!allowedTo || applyStatus !== null}
            callback={() => editGroupSettings.mutate(groupState)}
            status={applyStatus}
          />
        </ButtonRow>
      ) : (
        ""
      )}
    </>
  );
}

function GroupStatus(props: {
  gid: string;
  group: IGroupInfo;
  user: IUserInfo;
}): React.ReactElement {
  const [statusRef, { width }] = useMeasure();
  const { t } = useTranslation();
  const [serverNum, setServerNum] = React.useState("0");
  let groupId = "";
  let serverId = "";
  if (props.group) {
    groupId = props.group.id;
    if (props.group.servers.length !== 0) {
      serverId = props.group.servers[serverNum]?.id;
    }
  }
  const {
    data: groupStats,
  }: UseQueryResult<IGroupStats, { code: number; message: string }> = useQuery({
    queryKey: ["groupStats" + groupId],
    queryFn: () => OperationsApi.getStats(groupId),
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });
  const {
    data: serverStats,
  }: UseQueryResult<IServerStats, { code: number; message: string }> = useQuery({
    queryKey: ["serverStats" + serverId],
    queryFn: () => OperationsApi.getServerStats(serverId),
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });

  return (
    <div ref={statusRef}>
      {props.group ? (
        <>
          <h5 style={{ marginTop: "0px" }}>{t("group.status.worker.main")}</h5>
          <WorkerStatus
            worker={props.group.inWorker}
            lastUpdate={props.group.lastUpdate}
          />
          <h5>{t("group.status.cookiecheck.main")}</h5>
          {props.group.lastCookieCheck !== null ? (
            <h5>
              {t("time", { date: new Date(props.group.lastCookieCheck) })}
            </h5>
          ) : (
            <h5>{t("group.status.cookiecheck.never")}</h5>
          )}
        </>
      ) : (
        ""
      )}
      <h5 style={{ marginTop: "15px", marginBottom: "0px" }}>
        {t("group.status.stats.main")}
      </h5>
      {groupStats ? (
        <div style={{ paddingLeft: "10px" }}>
          <h5 style={{ margin: "3px 20px" }}>
            {t("group.status.stats.autoKickPingAmount", {
              amount: groupStats.autoKickPingAmount,
            })}
          </h5>
          <h5 style={{ margin: "3px 20px" }}>
            {t("group.status.stats.bfbanAmount", {
              amount: groupStats.bfbanAmount,
            })}
          </h5>
          <h5 style={{ margin: "3px 20px" }}>
            {t("group.status.stats.moveAmount", {
              amount: groupStats.moveAmount,
            })}
          </h5>
          <h5 style={{ margin: "3px 20px" }}>
            {t("group.status.stats.kickAmount", {
              amount: groupStats.kickAmount,
            })}
          </h5>
          <h5 style={{ margin: "3px 20px" }}>
            {t("group.status.stats.banAmount", {
              amount: groupStats.banAmount,
            })}
          </h5>
          <h5 style={{ margin: "3px 20px" }}>
            {t("group.status.stats.globalBanKickAmount", {
              amount: groupStats.globalBanKickAmount,
            })}
          </h5>
        </div>
      ) : (
        <h5 style={{ margin: "3px 20px" }}>{t("loading")}</h5>
      )}

      <h5 style={{ marginTop: "15px", marginBottom: "5px" }}>
        {t("group.status.stats.servers.main")}
      </h5>
      {props.group ? (
        <ButtonRow>
          <select
            className={styles.SmallSwitch}
            style={{ marginLeft: "20px", marginBottom: "10px" }}
            value={serverNum}
            onChange={(e) => setServerNum(e.target.value)}
          >
            {props.group.servers.map(
              (
                element: {
                  name: string;
                },
                index: number,
              ) => {
                return (
                  <option key={index} value={index}>
                    {element.name}
                  </option>
                );
              },
            )}
          </select>
        </ButtonRow>
      ) : (
        <h5 style={{ margin: "3px 20px" }}>{t("loading")}</h5>
      )}
      {serverStats ? (
        <div style={{ paddingLeft: "10px" }}>
          {serverStats.data.playerAmounts.length > 0 ? (
            <>
              {width < 760 ? (
                <>
                  <StatsPieChart stats={serverStats.data} />
                  <PlayerInfo stats={serverStats.data} />
                </>
              ) : (
                <div style={{ display: "flex" }}>
                  <StatsPieChart stats={serverStats.data} />
                  <PlayerInfo stats={serverStats.data} />
                </div>
              )}
            </>
          ) : (
            <>
              <h5 style={{ marginBottom: "5px" }}>
                {/* TODO: Test */}
                {serverStats.data.serverName}
              </h5>
              <h5 style={{ margin: "0px 25px" }}>
                {t("group.status.stats.servers.none")}
              </h5>
              <br />
            </>
          )}
        </div>
      ) : (
        <h5 style={{ margin: "3px 20px" }}>{t("loading")}</h5>
      )}
    </div>
  );
}

function GroupDangerZone(props: {
  group: IGroupInfo;
  user: IUserInfo;
  gid: string;
}): React.ReactElement {
  let allowedTo = false;
  let canSetUpOps = false;

  if (props.group && props.user)
    allowedTo = props.group.isOwner || props.user.auth.isDeveloper;
  if (props.group && props.user)
    canSetUpOps = props.group.makeOperations && props.group.isOwner;

  const queryClient = useQueryClient();

  const [groupName, setGroupName] = React.useState("");
  const [applyStatus, setApplyStatus] = React.useState(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (props.group && groupName !== props.group.groupName) {
      setGroupName(props.group.groupName);
    }
  }, [props.group]);

  const editGroupName = useMutation({
    mutationFn: (variables: {
      gid: string;
      type?: string;
      value: {
        [string: string]: string | number | boolean;
      };
    }) => OperationsApi.editGroup(variables),

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
      queryClient.invalidateQueries({
        queryKey: ["groupId" + props.gid]
      });
    }
  });

  return (
    <>
      <h5 style={{ marginTop: "0px" }}>{t("group.danger.nameChange")}</h5>
      <TextInput
        disabled={!allowedTo}
        callback={(e) => setGroupName(e.target.value)}
        defaultValue={groupName}
        name={t("group.name")}
      />
      {props.group && groupName !== props.group.groupName ? (
        <ButtonRow>
          <Button
            name={t("apply")}
            disabled={!allowedTo || applyStatus !== null}
            callback={() =>
              editGroupName.mutate({
                gid: props.gid,
                value: {
                  groupName,
                },
              })
            }
            status={applyStatus}
          />
        </ButtonRow>
      ) : (
        ""
      )}
      <h5 style={{ marginTop: "8px" }}>
        {t("group.danger.deleteInfo0")}
        <br />
        {t("group.danger.deleteInfo1")}
      </h5>
      <ButtonRow>
        <ButtonLink
          style={{ color: "#FF7575" }}
          name={t("group.danger.delete")}
          to={`/group/${props.gid}/delete/`}
          disabled={!allowedTo}
        />
        <ButtonLink
          name={t("sidebar.makeOperations")}
          to={`/makeops/${props.gid}/`}
          disabled={!canSetUpOps}
        />
      </ButtonRow>
    </>
  );
}

export function AddGroupOwner(props: {
  gid: string;
  callback: any;
}): React.ReactElement {
  const gid = props.gid;

  const [addAdminState, changeState] = React.useState({
    uid: "",
    nickname: "",
    canAdd: false,
  });
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const AddGroupOwnerExecute = useMutation({
    mutationFn: (variables: { gid: string; uid: string; nickname: string }) =>
      OperationsApi.addGroupOwner(variables),

    // When mutate is called:
    onMutate: async ({ gid, uid, nickname }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["groupUsers" + gid]
      });
      // Snapshot the previous value
      const previousGroup = queryClient.getQueryData(["groupId" + gid]);
      // Optimistically update to the new value
      const UTCNow = new Date(Date.now()).toUTCString();

      queryClient.setQueryData(["groupUsers" + gid], (old: IGroupUsers) => {
        old.data[0].owners.push({ id: uid, name: nickname, addedAt: UTCNow });
        old.data[0].admins.push({ id: uid, name: nickname, addedAt: UTCNow });
        return old;
      });
      // Return a context object with the snapshotted value
      return { previousGroup, gid };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(
        ["groupUsers" + context.gid],
        context.previousGroup,
      );
    },

    // Always refetch after error or success:
    onSettled: (_data, _error, _variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["groupUsers" + context.gid]
      });
    }
  });

  const updateState = (values: { nickname?: string; uid?: string }) => {
    const newState = {
      ...addAdminState,
      ...values,
    };
    newState.canAdd = newState.uid !== "" && newState.nickname !== "";
    changeState(newState);
  };

  return (
    <>
      <h2>{t("group.owners.addNew")}</h2>
      <TextInput
        name={t("group.addMenu.nickname")}
        callback={(e) => updateState({ nickname: e.target.value })}
      />
      <TextInput
        name={t("group.addMenu.id")}
        callback={(e) => updateState({ uid: e.target.value })}
      />
      <ButtonRow>
        <Button
          name={t("group.owners.add")}
          disabled={!addAdminState.canAdd}
          callback={() => {
            AddGroupOwnerExecute.mutate({
              gid,
              uid: addAdminState.uid,
              nickname: addAdminState.nickname,
            });
            props.callback(null);
          }}
        />
      </ButtonRow>
    </>
  );
}

export function AddGroupAdmin(props: { gid: string }): React.ReactElement {
  const gid = props.gid;

  const [addAdminState, changeState] = React.useState({
    uid: "",
    nickname: "",
    canAdd: false,
  });
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const AddGroupAdminExecute = useMutation({
    mutationFn: (variables: { gid: string; uid: string; nickname: string }) =>
      OperationsApi.addGroupAdmin(variables),

    // When mutate is called:
    onMutate: async ({ gid, uid, nickname }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["groupUsers" + gid]
      });
      // Snapshot the previous value
      const previousGroup = queryClient.getQueryData(["groupId" + gid]);
      // Optimistically update to the new value
      const UTCNow = new Date(Date.now()).toUTCString();

      queryClient.setQueryData(["groupUsers" + gid], (old: IGroupUsers) => {
        old.data[0].admins.push({ id: uid, name: nickname, addedAt: UTCNow });
        return old;
      });
      // Return a context object with the snapshotted value
      return { previousGroup, gid };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(
        ["groupUsers" + context.gid],
        context.previousGroup,
      );
    },

    // Always refetch after error or success:
    onSettled: (_data, _error, _variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["groupUsers" + context.gid]
      });
    }
  });

  const updateState = (values: { nickname?: string; uid?: string }) => {
    const newState = {
      ...addAdminState,
      ...values,
    };
    newState.canAdd = newState.uid !== "" && newState.nickname !== "";
    changeState(newState);
  };

  return (
    <>
      <h2>{t("group.admins.addNew")}</h2>
      <TextInput
        name={t("group.addMenu.nickname")}
        callback={(e) => updateState({ nickname: e.target.value })}
      />
      <TextInput
        name={t("group.addMenu.id")}
        callback={(e) => updateState({ uid: e.target.value })}
      />
      <ButtonRow>
        <Button
          name={t("group.admins.add")}
          disabled={!addAdminState.canAdd}
          callback={() => {
            AddGroupAdminExecute.mutate({
              gid,
              uid: addAdminState.uid,
              nickname: addAdminState.nickname,
            });
            props.callback();
          }}
        />
      </ButtonRow>
    </>
  );
}

export function AddGroup(): React.ReactElement {
  const [addGroupState, changeState] = React.useState({
    variables: {
      groupName: "",
      discordId: "",
      adminRole: "",
      modRole: "",
      remid: "",
      sid: "",
    },
    roleDisplay: false,
    canAdd: false,
  });
  const { t } = useTranslation();
  document.title = `${t("pageTitle.main")} | ${t("createGroup.main")}`;

  const [applyStatus, setApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });
  const queryClient = useQueryClient();
  const history = useNavigate();

  const AddNewGroupExecute = useMutation({
    mutationFn: (variables: {
      groupName: string;
      discordId: string;
      modRole: string;
      adminRole: string;
      sid: string;
      remid: string;
    }) => OperationsApi.addGroup(variables),

    onMutate: async () => {
      setApplyStatus(true);
      await queryClient.cancelQueries({
        queryKey: ["user"]
      });

      return {};
    },

    onSuccess: async (variables) => {
      setApplyStatus(null);

      queryClient.setQueryData(["user"], (old: IUserInfo) => {
        if (old) {
          old.permissions.isAdminOf.push({
            groupName: addGroupState.variables.groupName,
            id: variables.id,
          });
        }
        return old;
      });

      history(`/group/${variables.id}`);
    },

    onError: async (
      error: React.SetStateAction<{ code: number; message: string }>,
    ) => {
      setError(error);
      setApplyStatus(false);
      setTimeout(() => setApplyStatus(null), 2000);
    },

    onSettled: async () => {
      queryClient.invalidateQueries({
        queryKey: ["user"]
      });
    }
  });

  const checkInputVariables = (newVariables: {
    groupName?: string;
    discordId?: string;
    modRole?: string;
    adminRole?: string;
    sid?: string;
    remid?: string;
  }) => {
    const newGroupState = {
      ...addGroupState,
      variables: {
        ...addGroupState.variables,
        ...newVariables,
      },
    };
    const newVars = newGroupState.variables;
    newGroupState.roleDisplay = newVars.discordId !== "";
    newGroupState.canAdd =
      newVars.remid.length > 1 &&
      newVars.sid.length > 1 &&
      newVars.groupName.length > 2;
    changeState(newGroupState);
  };

  return (
    <Row>
      <Column>
        <Card>
          <h2>{t("createGroup.main")}</h2>
          <h5>{t("createGroup.description")}</h5>
          <TextInput
            name={t("group.name")}
            callback={(e) => {
              checkInputVariables({ groupName: e.target.value });
            }}
          />
          <h5 style={{ marginTop: "8px" }}>
            {t("createGroup.discordDescription")}
          </h5>
          <TextInput
            name={t("discord.id")}
            callback={(e) => {
              checkInputVariables({ discordId: e.target.value });
            }}
          />
          <TextInput
            name={t("discord.modId")}
            disabled={!addGroupState.roleDisplay}
            callback={(e) => {
              checkInputVariables({ modRole: e.target.value });
            }}
          />
          <TextInput
            name={t("discord.adminId")}
            disabled={!addGroupState.roleDisplay}
            callback={(e) => {
              checkInputVariables({ adminRole: e.target.value });
            }}
          />
          <h5 style={{ marginTop: "8px" }}>
            {t("createGroup.cookieDescription0")}
            <br />
            {t("createGroup.cookieDescription1")}
            <br />
            {t("createGroup.cookieDescription2")}
            <br />
          </h5>
          <ButtonUrl href={`/cookieinfo`} name={t("cookieInfo.link")} />
          <h5 style={{ marginTop: "8px" }}>
            {t("cookie.sidDescription")}
            <i>accounts.ea.com</i>
          </h5>
          <TextInput
            name={t("cookie.sid")}
            autocomplete="off"
            callback={(e) => {
              checkInputVariables({ sid: e.target.value });
            }}
          />
          <h5 style={{ marginTop: "8px" }}>
            {t("cookie.remidDescription")}
            <i>accounts.ea.com</i>
          </h5>
          <TextInput
            name={t("cookie.remid")}
            autocomplete="off"
            callback={(e) => {
              checkInputVariables({ remid: e.target.value });
            }}
          />
          <h5 style={{ marginTop: "8px" }}>
            {t("createGroup.acceptDescription0")}
            <br />
            {t("createGroup.acceptDescription1")}
          </h5>
          <ButtonRow>
            <Button
              name={t("createGroup.accept")}
              disabled={!addGroupState.canAdd || applyStatus !== null}
              status={applyStatus}
              callback={() =>
                AddNewGroupExecute.mutate(addGroupState.variables)
              }
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
        </Card>
      </Column>
    </Row>
  );
}

export function DeleteGroup(): React.ReactElement {
  const params = useParams();
  const thisGid = params.gid;

  const {
    data: groups,
  }: UseQueryResult<IGroupsInfo, { code: number; message: string }> = useQuery({
    queryKey: ["groupId" + thisGid],
    queryFn: () => OperationsApi.getGroup(thisGid),
    staleTime: 30000
  });
  const group = groups?.data?.length > 0 ? groups?.data[0] : null;

  const queryClient = useQueryClient();
  const history = useNavigate();
  const { t } = useTranslation();
  document.title = `${t("pageTitle.main")} ${t("group.main")} | ${t(
    "group.danger.main",
  )}`;

  const DeleteGroupExecute = useMutation({
    mutationFn: (variables: IGroupGet) => OperationsApi.removeGroup(variables),

    // When mutate is called:
    onMutate: async ({ gid }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["user"]
      });
      // Snapshot the previous value
      const previousGroups = queryClient.getQueryData(["user"]);
      // Optimistically update to the new value
      queryClient.setQueryData(["user"], (old: IUserInfo) => {
        if (old) {
          old.permissions.isAdminOf = old.permissions.isAdminOf.filter(
            (group: { id: string }) => group.id !== gid,
          );
        }
        return old;
      });
      // Return a context object with the snapshotted value
      return { previousGroups, gid };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(["user"], context.previousGroups);
    },

    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["user"]
      });
    }
  });

  return (
    <Row>
      <Column>
        <Header>
          <h2>{t("group.danger.delete")}</h2>
        </Header>
        <Card>
          <h2>{t("group.danger.main")}</h2>
          {group ? (
            <p>{t("group.danger.checkWithName", { name: group.groupName })}</p>
          ) : (
            <p>{t("group.danger.check")}</p>
          )}
          <ButtonRow>
            <ButtonLink
              name={t("group.danger.back")}
              to={"/group/" + thisGid}
            />
            <Button
              name={t("group.danger.confirm")}
              callback={() => {
                DeleteGroupExecute.mutate({ gid: thisGid });
                history("/account/");
              }}
            />
          </ButtonRow>
        </Card>
      </Column>
    </Row>
  );
}

export function AddGroupServer(): React.ReactElement {
  const params = useParams();
  const { gid } = params;

  const [game, setGame] = React.useState("bf1");
  const [cookieId, setCookieId] = React.useState("");
  const [sid, setSid] = React.useState("");
  const [remid, setRemid] = React.useState("");
  const [name, setName] = React.useState("");
  const [alias, setAlias] = React.useState("");

  const queryClient = useQueryClient();
  const { t } = useTranslation();
  document.title = `${t("pageTitle.main")} ${t("group.main")} | ${t(
    "group.servers.add",
  )}`;

  const {
    isError,
    data: groups,
    error,
  }: UseQueryResult<IGroupsInfo, { code: number; message: string }> = useQuery({
    queryKey: ["groupId" + gid],
    queryFn: () => OperationsApi.getGroup(gid),
    staleTime: 30000
  });
  const group = groups?.data?.length > 0 ? groups?.data[0] : null;

  const AddGroupServerExecute = useMutation({
    mutationFn: (variables: {
      gid: string;
      name: string;
      alias: string;
      game: string;
      cookieId: string;
      sid: string;
      remid: string;
    }) => OperationsApi.addGroupServer(variables),

    // When mutate is called:
    onMutate: async ({ gid, name, game }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["groupId" + gid]
      });
      // Snapshot the previous value
      const previousGroup = queryClient.getQueryData(["groupId" + gid]);
      // Optimistically update to the new value
      const UTCNow = new Date(Date.now()).toUTCString();

      queryClient.setQueryData(["groupId" + gid], (old: IGroupsInfo) => {
        old.data[0].servers.push({
          addedAt: UTCNow,
          id: null,
          name: name,
          game: game,
        });
        return old;
      });
      // Return a context object with the snapshotted value
      return { previousGroup, gid };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(
        ["groupId" + context.gid],
        context.previousGroup,
      );
    },

    // Always refetch after error or success:
    onSettled: (_data, _error, _variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["groupId" + context.gid]
      });
    }
  });

  const isDisabled =
    name === "" || (cookieId === "add" && (sid === "" || remid === ""));
  const history = useNavigate();

  return (
    <Row>
      <Column>
        <Card>
          <h2>{t("group.serverAddMenu.main")}</h2>
          <TextInput
            name={t("group.serverAddMenu.name")}
            callback={(e) => {
              setName(e.target.value);
            }}
          />
          <TextInput
            name={t("group.serverAddMenu.alias")}
            callback={(e) => {
              setAlias(e.target.value);
            }}
          />
          <ButtonRow>
            <select
              style={{ marginLeft: "5px" }}
              className={styles.SwitchTitle}
              value={game}
              onChange={(e) => setGame(e.target.value)}
            >
              {statusOnlyGames.map((key, index) => {
                return (
                  <option key={index} value={key}>
                    {t(`games.${key}`)}
                  </option>
                );
              })}
            </select>
            {!isError ? (
              <>
                {group ? (
                  <select
                    style={{ marginLeft: "6px" }}
                    className={styles.SwitchGame}
                    onChange={(e) => setCookieId(e.target.value)}
                  >
                    <option value="">{t("cookie.accountType.default")}</option>
                    {group.cookies.map((key: IGroupCookie, index: number) => (
                      <option
                        key={index}
                        selected={cookieId === key.id}
                        value={key.id}
                      >
                        {key.username}
                      </option>
                    ))}
                    <option value="add">{t("cookie.accountType.add")}</option>
                  </select>
                ) : (
                  ""
                )}
              </>
            ) : (
              <>{`Error ${error.code}: {error.message}`}</>
            )}
          </ButtonRow>
          {cookieId === "add" && (
            <>
              <h5 style={{ marginTop: "8px" }}>
                {t("cookie.sidDescription")}
                <i>accounts.ea.com</i>
              </h5>
              <TextInput
                name={t("cookie.sid")}
                autocomplete="off"
                callback={(e) => {
                  setSid(e.target.value);
                }}
              />
              <h5 style={{ marginTop: "8px" }}>
                {t("cookie.remidDescription")}
                <i>accounts.ea.com</i>
              </h5>
              <TextInput
                name={t("cookie.remid")}
                autocomplete="off"
                callback={(e) => {
                  setRemid(e.target.value);
                }}
              />
            </>
          )}
          <ButtonRow>
            <Button
              disabled={isDisabled}
              name={t("group.servers.add")}
              callback={() => {
                AddGroupServerExecute.mutate({
                  gid,
                  alias,
                  name,
                  game,
                  cookieId,
                  sid,
                  remid,
                });
                history("/group/" + gid);
              }}
            />
          </ButtonRow>
        </Card>
      </Column>
    </Row>
  );
}

export function AddGroupPlatoon(): React.ReactElement {
  const params = useParams();
  const { gid } = params;
  const [cookieId, setCookieId] = React.useState("");
  const [sid, setSid] = React.useState("");
  const [remid, setRemid] = React.useState("");

  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selected, setSelected] = React.useState<string[]>([]);

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const {
    isError,
    data: groups,
    error,
  }: UseQueryResult<IGroupsInfo, { code: number; message: string }> = useQuery({
    queryKey: ["groupId" + gid],
    queryFn: () => OperationsApi.getGroup(gid),
    staleTime: 30000
  });
  const group = groups?.data?.length > 0 ? groups?.data[0] : null;

  const AddGroupPlatoonExecute = useMutation({
    mutationFn: (variables: {
      gid: string;
      platoonIds: string[];
      cookieId: string;
      sid: string;
      remid: string;
    }) => OperationsApi.addGroupPlatoons(variables),

    // When mutate is called:
    onMutate: async ({ gid, platoonIds }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["groupId" + gid]
      });
      // Snapshot the previous value
      const previousGroup = queryClient.getQueryData(["groupId" + gid]);
      // Optimistically update to the new value
      queryClient.setQueryData(["groupId" + gid], (old: IGroupsInfo) => {
        platoonIds.map((platoonId) => (old.data[0].platoons[platoonId] = ""));
        return old;
      });
      // Return a context object with the snapshotted value
      return { previousGroup, gid };
    },

    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(
        ["groupId" + context.gid],
        context.previousGroup,
      );
    },

    // Always refetch after error or success:
    onSettled: (_data, _error, _variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ["groupId" + context.gid]
      });
    }
  });

  const {
    isLoading: loading,
    isError: searchError,
    data: platoons,
  } = useQuery({
    queryKey: ["platoons" + searchTerm],

    queryFn: () =>
      GametoolsApi.platoonSearch({
        name: searchTerm,
        platform: "pc",
        lang: getLanguage(),
      })
  });

  const isDisabled =
    selected.length < 1 || (cookieId === "add" && (sid === "" || remid === ""));
  const history = useNavigate();

  return (
    <Row>
      <Column>
        <Card>
          <h2>{t("group.platoons.add")}</h2>
          <ButtonRow>
            {!isError ? (
              <>
                {group ? (
                  <select
                    style={{ marginLeft: "6px" }}
                    className={styles.SwitchGame}
                    onChange={(e) => setCookieId(e.target.value)}
                  >
                    <option value="">{t("cookie.accountType.default")}</option>
                    {group.cookies.map((key: IGroupCookie, index: number) => (
                      <option
                        key={index}
                        selected={cookieId === key.id}
                        value={key.id}
                      >
                        {key.username}
                      </option>
                    ))}
                    <option value="add">{t("cookie.accountType.add")}</option>
                  </select>
                ) : (
                  ""
                )}
              </>
            ) : (
              <>{`Error ${error.code}: {error.message}`}</>
            )}
            <TextInput
              name={t("group.platoons.search")}
              callback={(ev: React.ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(ev.target.value);
              }}
            />
          </ButtonRow>
          {cookieId === "add" && (
            <>
              <h5 style={{ marginTop: "8px" }}>
                {t("cookie.sidDescription")}
                <i>accounts.ea.com</i>
              </h5>
              <TextInput
                name={t("cookie.sid")}
                autocomplete="off"
                callback={(e) => {
                  setSid(e.target.value);
                }}
              />
              <h5 style={{ marginTop: "8px" }}>
                {t("cookie.remidDescription")}
                <i>accounts.ea.com</i>
              </h5>
              <TextInput
                name={t("cookie.remid")}
                autocomplete="off"
                callback={(e) => {
                  setRemid(e.target.value);
                }}
              />
            </>
          )}
          <PlatoonResults
            group={group}
            loading={loading}
            platoons={platoons}
            error={searchError}
            callback={(e) => setSelected(e)}
          />
          <ButtonRow>
            <Button
              disabled={isDisabled}
              name={t("group.platoons.add")}
              callback={() => {
                AddGroupPlatoonExecute.mutate({
                  gid,
                  platoonIds: selected,
                  cookieId,
                  sid,
                  remid,
                });
                history("/group/" + gid);
              }}
            />
          </ButtonRow>
        </Card>
      </Column>
    </Row>
  );
}

function PlatoonResults(props: {
  group: IGroupInfo;
  loading: boolean;
  error: boolean;
  platoons: IPlatoonSearchResult;
  callback?: (arg0?: any) => void;
}): React.ReactElement {
  const { t } = useTranslation();

  const changeSelected = (v: string, id: string) => {
    props.callback((b) => (!v ? b.filter((item) => item !== id) : [...b, id]));
  };
  const { platoons } = props;
  if (!props.loading && !props.error) {
    if (platoons?.platoons == undefined || platoons?.platoons?.length == 0) {
      return <p>{t("group.platoons.resultNotFound")}</p>;
    }
    return (
      <>
        {platoons?.platoons?.map((key: IPlatoonResult, index: number) => {
          if (Object.keys(props?.group?.platoons).includes(key.id)) {
            return (
              <div className={styles.SeedRow} key={index}>
                <IconNotSelected style={{ color: "grey" }} />
                <div className={styles.DiscordName} style={{ color: "grey" }}>
                  {key.name}
                </div>
                <div className={styles.DateAdded} style={{ color: "grey" }}>
                  {t("group.platoons.alreadyAdded")}
                </div>
                <div
                  className={styles.ServerAliasName}
                  style={{ color: "grey" }}
                >
                  {key.currentSize} / 100 {t("group.platoons.members.main")}
                </div>
              </div>
            );
          }
          return (
            <SelectableRow
              key={index}
              callback={(v) => changeSelected(v, key.id)}
            >
              <div className={styles.DiscordName}>{key.name}</div>
              <div className={styles.ServerAliasName}>
                {key.currentSize} / 100 {t("group.platoons.members.main")}
              </div>
            </SelectableRow>
          );
        })}
      </>
    );
  } else {
    return <ListsLoading amount={3} />;
  }
}

export function EditGroup(): React.ReactElement {
  return <></>;
}

export function MakeOps(): React.ReactElement {
  const params = useParams();
  const { gid } = params;

  const {
    data: groups,
  }: UseQueryResult<IGroupsInfo, { code: number; message: string }> = useQuery({
    queryKey: ["groupId" + gid],
    queryFn: () => OperationsApi.getGroup(gid),
    staleTime: 30000
  });
  const group = groups?.data?.length > 0 ? groups?.data[0] : null;

  const [addGroupState, changeState] = React.useState({
    variables: {
      server: "",
      remid: "",
      sid: "",
      gid: gid,
    },
    canAdd: false,
  });

  const [applyStatus, setApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });

  const { t } = useTranslation();
  document.title = `${t("pageTitle.main")} | ${t("operations.main")}`;

  const SetupOperations = useMutation({
    mutationFn: (variables: { server: string; sid: string; remid: string }) =>
      OperationsApi.setupOps(variables),

    onMutate: async () => {
      setApplyStatus(true);
      return {};
    },

    onSuccess: async () => {
      setApplyStatus(null);
    },

    onError: async (
      error: React.SetStateAction<{ code: number; message: string }>,
    ) => {
      setError(error);
      setApplyStatus(false);
      setTimeout(() => setApplyStatus(null), 2000);
    },

    onSettled: async () => {
      undefined;
    }
  });

  const checkInputVariables = (newVariables: {
    server?: string;
    sid?: string;
    remid?: string;
  }) => {
    const newGroupState = {
      ...addGroupState,
      variables: {
        ...addGroupState.variables,
        ...newVariables,
      },
    };
    const newVars = newGroupState.variables;
    newGroupState.canAdd =
      newVars.remid.length > 1 &&
      newVars.sid.length > 1 &&
      newVars.server.length > 1;
    changeState(newGroupState);
  };

  let bf1Servers = [];
  if (group) {
    bf1Servers = group.servers.filter((item) => item.game == "bf1");
    if (addGroupState.variables.server === "" && bf1Servers[0] !== undefined) {
      checkInputVariables({ server: bf1Servers[0].id });
    }
  }

  return (
    <Row>
      <Column>
        <Card>
          <h2>{t("operations.main")}</h2>
          <h5>
            {t("operations.description0")}
            <br />
            {t("operations.description1")}
            <br />
            {t("operations.description2")}
          </h5>
          {group && (
            <ButtonRow>
              <select
                className={styles.SwitchGame}
                onChange={(e) =>
                  checkInputVariables({ server: e.target.value })
                }
              >
                {bf1Servers.map((server: IGroupServer, index: number) => {
                  return (
                    <option key={index} value={server.id}>
                      {server.name}
                    </option>
                  );
                })}
              </select>
            </ButtonRow>
          )}

          {/* <TextInput name="Server name" callback={(e) => { checkInputVariables({ server: e.target.value }) }} /> */}
          <h5 style={{ marginTop: "8px" }}>
            {t("operations.server")}
            <b>{t("operations.owner")}</b>
            {t("operations.cookies")}
          </h5>
          <ButtonRow>
            <ButtonUrl href={`/cookieinfo`} name={t("cookieInfo.link")} />
          </ButtonRow>
          <h5 style={{ marginTop: "8px" }}>
            {t("cookie.sidDescription")}
            <i>accounts.ea.com</i>
          </h5>
          <TextInput
            name={t("cookie.sid")}
            type="password"
            autocomplete="new-password"
            callback={(e) => {
              checkInputVariables({ sid: e.target.value });
            }}
          />
          <h5 style={{ marginTop: "8px" }}>
            {t("cookie.remidDescription")}
            <i>accounts.ea.com</i>
          </h5>
          <TextInput
            name={t("cookie.remid")}
            type="password"
            autocomplete="new-password"
            callback={(e) => {
              checkInputVariables({ remid: e.target.value });
            }}
          />
          <h5 style={{ marginTop: "8px" }}>
            {t("operations.acceptDescription0")}
            <br />
            {t("operations.acceptDescription1")}
          </h5>
          <ButtonRow>
            <Button
              name={t("operations.accept")}
              disabled={!addGroupState.canAdd || applyStatus !== null}
              status={applyStatus}
              callback={() => SetupOperations.mutate(addGroupState.variables)}
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
        </Card>
      </Column>
    </Row>
  );
}

export function LeaveServer(props: {
  gid: string;
  textItem: string;
  option: string;
  rejoin: boolean;
  game: string;
  callback: (args0?: string) => void;
}): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const LeaveServerExecure = useMutation({
    mutationFn: (variables: {
      serverName: string;
      serverId: string;
      action: string;
      groupId: string;
      rejoin: boolean;
      message: string;
      game: string;
    }) => OperationsApi.setSeeding(variables),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["seeding" + props.gid]
      });
    }
  });

  return (
    <>
      <h2>{t("group.seeding.main")}</h2>
      <h2>
        {t("group.seeding.popup.confirmInfo", {
          option: t(`group.seeding.actions.${props.textItem}`),
        })}
      </h2>
      <ButtonRow>
        <Button
          name={t(`group.seeding.popup.confirm`)}
          callback={() => {
            LeaveServerExecure.mutate({
              serverName: "",
              serverId: "0",
              action: props.option,
              groupId: props.gid,
              rejoin: props.rejoin,
              message: "",
              game: props.game,
            });
            props.callback(null);
          }}
        />
      </ButtonRow>
    </>
  );
}

export function AddKeepAlive(props: {
  gid: string;
  sid: string;
  callback: () => void;
}): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [hostname, setHostname] = React.useState("");

  const AddGroupAdminExecute = useMutation({
    mutationFn: (variables: { serverId: string; hostname: string }) =>
      OperationsApi.addKeepAlive(variables),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["seeding" + props.gid]
      });
    }
  });

  return (
    <>
      <h2>{t("group.seeding.keepalive.add")}</h2>
      <h2>{t("group.seeding.keepalive.hostname")}</h2>
      <TextInput
        style={{ height: "32px" }}
        name={t("group.seeding.keepalive.sethostname")}
        callback={(e) => setHostname(e.target.value)}
      />
      <ButtonRow>
        <Button
          name={t(`group.seeding.popup.confirm`)}
          callback={() => {
            AddGroupAdminExecute.mutate({
              serverId: props.sid,
              hostname: hostname,
            });
            props.callback();
          }}
        />
      </ButtonRow>
    </>
  );
}

export function SeederBroadcast(props: {
  gid: string;
  message: string;
  rejoin: boolean;
  game: string;
  callback: (args0?: string) => void;
}): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const AddGroupAdminExecute = useMutation({
    mutationFn: (variables: {
      serverName: string;
      serverId: string;
      action: string;
      groupId: string;
      rejoin: boolean;
      message: string;
      game: string;
    }) => OperationsApi.setSeeding(variables),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["seeding" + props.gid]
      });
    }
  });

  return (
    <>
      <h2>{t("group.seeding.main")}</h2>
      <h2>
        {t("group.seeding.popup.broadcastInfo", { message: props.message })}
      </h2>
      <ButtonRow>
        <Button
          name={t(`group.seeding.popup.confirm`)}
          callback={() => {
            AddGroupAdminExecute.mutate({
              serverName: "",
              serverId: "0",
              action: "broadcastMessage",
              groupId: props.gid,
              rejoin: props.rejoin,
              message: props.message,
              game: props.game,
            });
            props.callback(null);
          }}
        />
      </ButtonRow>
    </>
  );
}

export function UnscheduleSeed(props: {
  gid: string;
  callback: (args0?: string) => void;
}): React.ReactElement {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const AddGroupAdminExecute = useMutation({
    mutationFn: (variables: { groupId: string }) =>
      OperationsApi.undoScheduleSeeding(variables),

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["seeding" + props.gid]
      });
    }
  });
  return (
    <>
      <h2>{t("group.seeding.main")}</h2>
      <h2>
        {t("group.seeding.confirmInfo", {
          option: t("group.seeding.undoSchedule"),
        })}
      </h2>
      <ButtonRow>
        <Button
          name={t(`group.seeding.confirm`)}
          callback={() => {
            AddGroupAdminExecute.mutate({ groupId: props.gid });
            props.callback(null);
          }}
        />
      </ButtonRow>
    </>
  );
}
