import * as React from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageContext } from "./ServerGlobalContext";

import { IServerGet, OperationsApi } from "../api/api";
import { spartaGames } from "../Globals";

import { useNavigate } from "react-router-dom";
import {
  ServerRotation,
  ServerInfoHolder,
  BanList,
  VipList,
  AdminList,
  FireStarter,
  Spectator,
  Playerlogs,
  PlayTime,
} from "./Server";

import {
  Switch,
  Column,
  Header,
  ButtonRow,
  ButtonLink,
  Button,
  PageCard,
  Row,
  TextInput,
  Card,
} from "../components";

import "../locales/config";

import { ServerSettings, IngameSettings } from "./Settings";
import { useServer, useGame } from "./Manager";
import { useParams } from "react-router-dom";

import Console from "./Console";
import { PlayerList } from "./PlayerList";
import { IGroupsInfo, IServerInfo } from "../api/ReturnTypes";
import { FileToJson } from "../components/FileUpload";
import { utils, writeFile } from "xlsx";

/**
 * Server page
 */
export function Server(): React.ReactElement {
  const params = useParams();
  const { sid } = params;

  const { t } = useTranslation();

  const { data: server } = useServer(sid);
  const { data: runningGame } = useGame(sid);

  const [tabsListing, setTabsListing] = React.useState("info");
  const [playerListSort, setPlayerListSort] = React.useState("position");

  let serverTabs = [
    {
      name: t("server.game.main"),
      callback: () => setTabsListing("info"),
    },
    {
      name: t("server.settings.main"),
      callback: () => setTabsListing("settings"),
    },
  ];

  if (server?.game === "bf1") {
    const extra = [
      {
        name: t("server.ingameSettings.main"),
        callback: () => setTabsListing("ingameSettings"),
      },
      {
        name: t("server.banList.main"),
        callback: () => setTabsListing("banlist"),
      },
      {
        name: t("server.vipList.main"),
        callback: () => setTabsListing("viplist"),
      },
      {
        name: t("server.adminList.main"),
        callback: () => setTabsListing("adminlist"),
      },
      {
        name: t("server.firestarterList.main"),
        callback: () => setTabsListing("firestarter"),
      },
      {
        name: t("server.playTimeList.main"),
        callback: () => setTabsListing("playtime"),
      },
      {
        name: t("server.spectatorList.main"),
        callback: () => setTabsListing("spectator"),
      },
      {
        name: t("server.playerLogs.main"),
        callback: () => setTabsListing("playerlogs"),
      },
      {
        name: t("server.protection.main"),
        callback: () => setTabsListing("protection"),
      },
    ];
    serverTabs = serverTabs.concat(extra);
  }

  if (server?.game === "bf2042") {
    const extra = [
      {
        name: t("server.banList.main"),
        callback: () => setTabsListing("banlist"),
      },
      // {
      //   name: t("server.firestarterList.main"),
      //   callback: () => setTabsListing("firestarter"),
      // },
      // {
      //   name: t("server.playTimeList.main"),
      //   callback: () => setTabsListing("playtime"),
      // },
      // {
      //   name: t("server.spectatorList.main"),
      //   callback: () => setTabsListing("spectator"),
      // },
      // {
      //   name: t("server.playerLogs.main"),
      //   callback: () => setTabsListing("playerlogs"),
      // },
      // {
      //   name: t("server.protection.main"),
      //   callback: () => setTabsListing("protection"),
      // },
    ];
    serverTabs = serverTabs.concat(extra);
  }

  if (server?.game === "bfv") {
    const extra = [
      {
        name: t("server.firestarterList.main"),
        callback: () => setTabsListing("firestarter"),
      },
      {
        name: t("server.playTimeList.main"),
        callback: () => setTabsListing("playtime"),
      },
      {
        name: t("server.spectatorList.main"),
        callback: () => setTabsListing("spectator"),
      },
      {
        name: t("server.playerLogs.main"),
        callback: () => setTabsListing("playerlogs"),
      },
      {
        name: t("server.protection.main"),
        callback: () => setTabsListing("protection"),
      },
    ];
    serverTabs = serverTabs.concat(extra);
  }

  const catTabs = {
    info: (
      <ServerInfoHolder>
        <ServerRotation
          server={server}
          game={runningGame}
          rotate={(id) => OperationsApi.changeRotation({ sid, map: id })}
        />
      </ServerInfoHolder>
    ),
    banlist: <BanList sid={sid} />,
    viplist: <VipList sid={sid} game={runningGame} />,
    adminlist: <AdminList sid={sid} />,
    firestarter: <FireStarter sid={sid} />,
    playtime: <PlayTime sid={sid} />,
    spectator: <Spectator sid={sid} />,
    playerlogs: <Playerlogs sid={sid} />,
    protection: <ServerAutomation server={server} sid={sid} />,
    settings: <ServerSettings server={server} sid={sid} />,
    ingameSettings: (
      <IngameSettings server={server} game={runningGame} sid={sid} />
    ),
  };

  return (
    <PageContext.Provider value={[playerListSort, setPlayerListSort]}>
      <Row>
        <Column>
          <PageCard buttons={serverTabs}>{catTabs[tabsListing]}</PageCard>
        </Column>
      </Row>
      <Row>
        <Column>
          <Console game={runningGame} server={server} sid={sid} />
        </Column>
      </Row>
      {server?.game !== "bf2042" ? (
        <PlayerList game={runningGame} server={server} sid={sid} />
      ) : (
        <></>
      )}
    </PageContext.Provider>
  );
}

export function DeleteServer(): React.ReactElement {
  const params = useParams();
  const thisSid = params.sid;

  const { data: server } = useServer(thisSid);

  const queryClient = useQueryClient();
  const history = useNavigate();
  const { t } = useTranslation();

  const RemoveServerExecute = useMutation(
    (variables: IServerGet) => OperationsApi.removeServer(variables),
    {
      onSuccess: async (variables) => {
        await queryClient.cancelQueries(["groupId" + variables.groupId]);

        queryClient.setQueryData(
          ["groupId", variables.groupId],
          (old: IGroupsInfo) => {
            if (old) {
              old.data[0].servers = old.data[0].servers.filter(
                (server: { id: string }) => server.id !== variables.groupId,
              );
            }
            return old;
          },
        );
      },
      // Always refetch after error or success:
      onSettled: (data) => {
        queryClient.invalidateQueries(["groupId" + data.groupId]);
        history(`/group/${data.groupId}`);
      },
    },
  );

  return (
    <Row>
      <Column>
        <Header>
          <h2>{t("server.danger.delete")}</h2>
        </Header>
        <Card>
          <h2>{t("server.danger.main")}</h2>
          {server !== undefined ? (
            <p>
              {t("server.danger.checkWithName", { name: server.serverName })}
            </p>
          ) : (
            <p>{t("server.danger.check")}</p>
          )}
          <ButtonRow>
            <ButtonLink
              name={t("server.danger.back")}
              to={"/server/" + thisSid}
            />
            <Button
              name={t("server.danger.confirm")}
              callback={() => {
                RemoveServerExecute.mutate({ sid: thisSid });
              }}
            />
          </ButtonRow>
        </Card>
      </Column>
    </Row>
  );
}

function ServerAutomation(props: {
  sid?: string;
  server: IServerInfo;
}): React.ReactElement {
  const { server } = props;

  let allowedTo = false;
  if (server?.editPerms) allowedTo = true;

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [kickOnPingDisabled, setKickOnPingDisabled] = React.useState(false);
  const [kickLowRankDisabled, setKickLowRankDisabled] = React.useState(false);
  const [kickHighRankDisabled, setKickHighRankDisabled] = React.useState(false);
  const [serverState, setServerState] = React.useState(null);
  const [canApply, setCanApply] = React.useState(false);
  const [applyStatus, setApplyStatus] = React.useState(null);

  React.useEffect(() => {
    if (server) {
      const {
        autoBanKick,
        autoBfbanKick,
        autoGlobalBanMessage,
        autoPingKick,
        autoPingKickMessage,
        minAutoPingKick,
        autoBfBanMessage,
        kickMinRank,
        kickMaxRank,
        rankKickReason,
        statsKick,
      } = server;
      const originalServerState = {
        autoBanKick,
        autoBfbanKick,
        autoGlobalBanMessage,
        autoPingKick,
        autoPingKickMessage,
        minAutoPingKick,
        autoBfBanMessage,
        kickMinRank,
        kickMaxRank,
        rankKickReason,
        statsKick,
      };
      if (serverState === null) {
        setServerState(originalServerState);
        setKickOnPingDisabled(autoPingKick !== 0);
        setKickLowRankDisabled(kickMinRank >= 0);
        setKickHighRankDisabled(kickMaxRank >= 0);
      } else {
        let newCanApply = false;
        for (const i in originalServerState) {
          newCanApply ||= serverState[i] !== originalServerState[i];
        }
        if (serverState.autoPingKick === 0) setKickOnPingDisabled(false);
        setCanApply(newCanApply);
      }
    }
  }, [server, serverState]);

  const changeServerState = (v: {
    autoBanKick?: boolean;
    autoGlobalBanMessage?: string;
    autoBfbanKick?: boolean;
    autoBfBanMessage?: string;
    autoPingKick?: number;
    autoPingKickMessage?: string;
    minAutoPingKick?: number;
    rankKickReason?: string;
    kickMinRank?: number;
    kickMaxRank?: number;
    statsKick?: any;
  }) => {
    setServerState((s: { [string: string]: string | number | boolean }) => ({
      ...s,
      ...v,
    }));
  };

  const editServerSettings = useMutation(
    (variables: { [string: string]: string | number | boolean }) =>
      OperationsApi.editServer({ value: variables, sid: props.sid }),
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
        queryClient.invalidateQueries(["server" + props.sid]);
      },
    },
  );

  const getServerValue = (key: string) => {
    if (server && key in server) {
      return server[key];
    }
    return "";
  };

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>{t("server.protection.title")}</h2>
      <h5 style={{ marginTop: "8px" }}>
        {t("server.protection.vBanDescription0")}
        <br />
        {t("server.protection.vBanDescription1")}
        <b>{t("server.protection.vBanDescription2")}</b>
        {t("server.protection.vBanDescription3")}
        <br />
        {t("server.protection.vBanDescription4")}
      </h5>
      <Switch
        checked={getServerValue("autoBanKick")}
        name={t("server.protection.vBanEnable")}
        callback={(v) => changeServerState({ autoBanKick: v })}
      />
      <h5 style={{ marginTop: "8px" }}>
        {t("server.protection.vbanReasonDesc0")}
        <br />
        {t("server.protection.vbanReasonDesc1")}
      </h5>

      <TextInput
        disabled={!allowedTo || (serverState && !serverState.autoBanKick)}
        callback={(e) =>
          changeServerState({ autoGlobalBanMessage: e.target.value })
        }
        defaultValue={getServerValue("autoGlobalBanMessage")}
        name={t("server.protection.vBanMsg")}
      />
      <h5 style={{ marginTop: "30px" }}>
        {t("server.protection.bfbanDescription")}
        <i>bfban.com</i>
      </h5>
      <Switch
        checked={getServerValue("autoBfbanKick")}
        name={t("server.protection.bfbanEnable")}
        callback={(v) => changeServerState({ autoBfbanKick: v })}
      />
      <TextInput
        disabled={!allowedTo || (serverState && !serverState.autoBfbanKick)}
        callback={(e) =>
          changeServerState({ autoBfBanMessage: e.target.value })
        }
        defaultValue={getServerValue("autoBfBanMessage")}
        name={t("server.protection.bfBanMsg")}
      />
      <h5 style={{ marginTop: "30px" }}>
        {t("server.protection.pingKickDescription")}
      </h5>
      <Switch
        checked={kickOnPingDisabled}
        name={t("server.protection.pingKickEnable")}
        callback={(v) => {
          setKickOnPingDisabled(v);
          !v
            ? changeServerState({ autoPingKick: 0 })
            : changeServerState({ autoPingKick: 200 });
        }}
      />
      <TextInput
        type="number"
        disabled={!allowedTo || !kickOnPingDisabled}
        callback={(e) => {
          if (e.target.value < 0) {
          } else {
            if (e.target.value !== "")
              changeServerState({ autoPingKick: parseInt(e.target.value) });
          }
        }}
        value={serverState ? serverState.autoPingKick : ""}
        name={t("server.protection.pingKickAmount")}
      />
      <TextInput
        disabled={!allowedTo || !kickOnPingDisabled}
        callback={(e) =>
          changeServerState({ autoPingKickMessage: e.target.value })
        }
        defaultValue={getServerValue("autoPingKickMessage")}
        name={t("server.protection.pingKickMsg")}
      />
      <h5 style={{ marginTop: "8px" }}>
        {t("server.protection.pingKickMinDesc")}
      </h5>
      <TextInput
        type="number"
        disabled={!allowedTo || !kickOnPingDisabled}
        callback={(e) => {
          if (e.target.value < 0) {
          } else {
            if (e.target.value !== "") {
              changeServerState({ minAutoPingKick: parseInt(e.target.value) });
            }
          }
        }}
        defaultValue={getServerValue("minAutoPingKick")}
        value={serverState ? serverState.minAutoPingKick : ""}
        name={t("server.protection.minAutoPingKick")}
      />
      {spartaGames.includes(server && server.game) ? (
        <>
          <h5 style={{ marginTop: "30px" }}>
            {t("server.protection.KickRankDesc")}
          </h5>
          <TextInput
            disabled={
              !allowedTo || (!kickLowRankDisabled && !kickHighRankDisabled)
            }
            callback={(e) =>
              changeServerState({ rankKickReason: e.target.value })
            }
            defaultValue={getServerValue("rankKickReason")}
            name={t("server.protection.rankKickReason")}
          />
          <Switch
            checked={kickLowRankDisabled}
            name={t("server.protection.kickLowRank")}
            callback={(v) => {
              setKickLowRankDisabled(v);
              !v
                ? changeServerState({ kickMinRank: -1 })
                : changeServerState({ kickMinRank: 0 });
            }}
          />
          <TextInput
            type="number"
            disabled={!allowedTo || !kickLowRankDisabled}
            callback={(e) => {
              if (e.target.value < 0) {
              } else {
                if (e.target.value !== "") {
                  changeServerState({ kickMinRank: parseInt(e.target.value) });
                }
              }
            }}
            defaultValue={getServerValue("kickMinRank")}
            value={serverState ? serverState.kickMinRank : ""}
            name={t("server.protection.kickMinRank")}
          />
          <Switch
            checked={kickHighRankDisabled}
            name={t("server.protection.kickHighRank")}
            callback={(v) => {
              setKickHighRankDisabled(v);
              !v
                ? changeServerState({ kickMaxRank: -1 })
                : changeServerState({ kickMaxRank: 150 });
            }}
          />
          <TextInput
            type="number"
            disabled={!allowedTo || !kickHighRankDisabled}
            callback={(e) => {
              if (e.target.value < 0) {
              } else {
                if (e.target.value !== "") {
                  changeServerState({ kickMaxRank: parseInt(e.target.value) });
                }
              }
            }}
            defaultValue={getServerValue("kickMaxRank")}
            value={serverState ? serverState.kickMaxRank : ""}
            name={t("server.protection.kickMaxRank")}
          />
        </>
      ) : (
        <></>
      )}
      <h5 style={{ marginTop: "8px" }}>{t("server.protection.statsKick")}</h5>
      <ButtonRow>
        <Button
          callback={() => {
            window.location.href = "/files/bf1_statskick_example.xlsx";
          }}
          name={t("server.protection.statsKickExample")}
        />
        <FileToJson
          callback={(data) => changeServerState({ statsKick: data })}
        />
      </ButtonRow>
      {serverState && Object.keys(serverState.statsKick).length > 0 && (
        <ButtonRow style={{ marginTop: 0 }}>
          <Button
            callback={() => {
              const filename = "current_statskick.xlsx";
              const ws = utils.json_to_sheet(serverState.statsKick);
              const wb = utils.book_new();
              utils.book_append_sheet(wb, ws, "People");
              writeFile(wb, filename);
            }}
            name={t("server.protection.statsKickDownload")}
          />
          <Button
            callback={() => changeServerState({ statsKick: {} })}
            name={t("server.protection.statsKickRemove")}
          />
        </ButtonRow>
      )}
      {props.server && canApply ? (
        <ButtonRow>
          <Button
            name={t("apply")}
            disabled={!allowedTo || applyStatus !== null}
            callback={() => editServerSettings.mutate(serverState)}
            status={applyStatus}
          />
        </ButtonRow>
      ) : (
        ""
      )}
    </>
  );
}
