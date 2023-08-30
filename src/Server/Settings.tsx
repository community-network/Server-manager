import * as React from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { UseQueryResult } from "@tanstack/react-query/build/lib/types";
import { useTranslation } from "react-i18next";
import styles from "./Styles.module.css";

import {
  ButtonRow,
  Button,
  TextInput,
  ButtonUrl,
  ButtonLink,
} from "../components";
import { OperationsApi } from "../api/api";
import { bf1Maps, bf1Modes } from "../Globals";
import {
  IServerInfo,
  IInGameServerInfo,
  ICookie,
  IServerRotation,
  ICookieList,
  IMapRotation,
} from "../api/ReturnTypes";

export function IngameSettings(props: {
  server: IServerInfo;
  sid?: string;
  game?: IInGameServerInfo;
}): React.ReactElement {
  const { server, sid, game } = props;
  let allowedTo = false;
  if (server && server.editPerms) allowedTo = true;
  const queryClient = useQueryClient();
  const [canApply, setCanApply] = React.useState(false);
  const [maps, setMaps] = React.useState([]);
  const [originalMaps, setOriginalMaps] = React.useState([]);
  const [cookie, setCookie] = React.useState("");
  const [cookieSid, setCookieSid] = React.useState("");
  const [cookieRemid, setCookieRemid] = React.useState("");
  const [applyStatus, setApplyStatus] = React.useState(null);
  const [mapRotationName, setMapRotationName] = React.useState("");
  const [mapRotations, setMapRotations] = React.useState({});
  const [selectedMaprotation, setSelectedMaprotation] = React.useState("");
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });

  const { t } = useTranslation();
  const {
    isError,
    data: cookieInfo,
    error,
  }: UseQueryResult<ICookieList, { code: number; message: string }> = useQuery(
    ["cookieInfo" + sid],
    () => OperationsApi.getCookieList({ sid }),
    { staleTime: 30000 },
  );
  const cookies = cookieInfo?.data?.length > 0 ? cookieInfo?.data : null;

  const editOwnerSettings = useMutation(
    (variables: {
      sid: string;
      remid: string;
      cookieid: string;
      serverid: string;
      maps: IServerRotation[];
    }) => OperationsApi.editOwnerServer(variables),
    {
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
        queryClient.invalidateQueries(["servers" + sid]);
      },
    },
  );

  const editServerSettings = useMutation(
    (variables: { rotations: { [string: string]: IMapRotation[] } }) =>
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

  // set initial
  React.useEffect(() => {
    if (game) {
      // dont refresh maplist on mapRotation save
      console.log(selectedMaprotation);
      if (
        selectedMaprotation === "" ||
        !Object.keys(server?.rotations).includes(selectedMaprotation)
      ) {
        setMaps(JSON.parse(JSON.stringify(game.data[0].info.rotation)));
      }
      setOriginalMaps(game.data[0].info.rotation.slice());
    }
    if (server) {
      setMapRotations(server?.rotations);
    }
  }, [server]);
  // set if cookies available
  React.useEffect(() => {
    if (cookies) {
      setCookie(cookies[0].id);
    }
  }, [cookies]);
  // check if allowed to apply
  React.useEffect(() => {
    let newCanApply = false;
    for (const i in originalMaps) {
      newCanApply ||=
        JSON.stringify(maps[i]) !== JSON.stringify(originalMaps[i]);
    }
    for (const m in maps) {
      newCanApply ||=
        JSON.stringify(maps[m]) !== JSON.stringify(originalMaps[m]);
    }
    setCanApply(newCanApply);
  }, [maps, originalMaps]);

  function moveArrayElement(
    list: IServerRotation[],
    item: IServerRotation,
    offset: number,
  ) {
    const index = list.indexOf(item);
    const newIndex = index + offset;

    if (newIndex > -1 && newIndex < list.length) {
      // Remove the element from the array
      const removedElement = list.splice(index, 1)[0];

      // At "newIndex", remove 0 elements and insert the removed element
      list.splice(newIndex, 0, removedElement);
    }
  }

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>{t("server.ingameSettings.main")}</h2>
      <h5 style={{ marginTop: "8px" }}>
        {t("server.ingameSettings.saveRotation.main")}
      </h5>
      {mapRotations && (
        <ButtonRow>
          <select
            disabled={!allowedTo || Object.keys(mapRotations).length <= 0}
            style={{ marginLeft: "6px" }}
            className={styles.SwitchGame}
            onChange={(e) => {
              if (e.target.value === "") {
                setMaps(originalMaps);
              } else {
                setMaps(mapRotations[e.target.value]);
              }
              setMapRotationName(e.target.value);
              setSelectedMaprotation(e.target.value);
            }}
          >
            <option selected={selectedMaprotation === ""} value="">
              {t("server.ingameSettings.saveRotation.current")}
            </option>
            {Object.keys(mapRotations).map((value: string, index: number) => (
              <option
                key={index}
                selected={selectedMaprotation === value}
                value={value}
              >
                {value}
              </option>
            ))}
          </select>
        </ButtonRow>
      )}

      <TextInput
        disabled={!allowedTo}
        name={t("server.ingameSettings.saveRotation.name")}
        autocomplete="off"
        value={mapRotationName}
        callback={(e) => {
          setMapRotationName(e.target.value);
        }}
      />
      <ButtonRow>
        <Button
          name={t("server.ingameSettings.saveRotation.save")}
          disabled={
            !allowedTo || applyStatus !== null || mapRotationName === ""
          }
          callback={() => {
            const sendMaps = [];
            maps.forEach((element) => {
              sendMaps.push({
                mode: element.mode,
                mapname: element.mapname,
              });
            });
            const mapRotationClone = { ...mapRotations };
            mapRotationClone[mapRotationName] = sendMaps;
            editServerSettings.mutate({
              rotations: mapRotationClone,
            });
            setSelectedMaprotation(mapRotationName);
          }}
          status={applyStatus}
        />
        <Button
          name={t("server.ingameSettings.saveRotation.remove")}
          disabled={
            !allowedTo || applyStatus !== null || selectedMaprotation === ""
          }
          callback={() => {
            const mapRotationClone = { ...mapRotations };
            delete mapRotationClone[mapRotationName];
            editServerSettings.mutate({
              rotations: mapRotationClone,
            });
            if (Object.keys(mapRotationClone).length <= 0) {
              setSelectedMaprotation("");
            }
          }}
          status={applyStatus}
        />
      </ButtonRow>
      <h5 style={{ marginTop: "8px" }}>
        {t("server.ingameSettings.rotation")}
      </h5>
      {maps.map((element, index) => {
        return (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              alignContent: "center",
              flexWrap: "wrap",
            }}
          >
            <select
              disabled={!allowedTo}
              style={{ marginLeft: "0" }}
              onChange={(e) => {
                const current = [...maps];
                current[index].mapname = e.target.value;
                setMaps(current);
              }}
              className={styles.SwitchGame}
            >
              {bf1Maps.map((name, index) => (
                <option
                  key={index}
                  selected={element.mapname === name}
                  value={name}
                >
                  {name}
                </option>
              ))}
            </select>

            <select
              disabled={!allowedTo}
              style={{ marginLeft: "0" }}
              onChange={(e) => {
                const current = [...maps];
                current[index].mode = e.target.value;
                setMaps(current);
              }}
              className={styles.SwitchGame}
            >
              {bf1Modes.map((name, index) => (
                <option
                  key={index}
                  selected={element.mode === name}
                  value={name}
                >
                  {name}
                </option>
              ))}
            </select>

            <Button
              disabled={!allowedTo}
              style={{ marginLeft: "0", fontSize: "16px", padding: "16px" }}
              name="&#8593;"
              callback={() => {
                const current = [...maps];
                moveArrayElement(current, current[index], -1);
                setMaps(current);
              }}
            />
            <Button
              disabled={!allowedTo}
              style={{ marginLeft: "0", fontSize: "16px", padding: "16px" }}
              name="&#8595;"
              callback={() => {
                const current = [...maps];
                moveArrayElement(current, current[index], 1);
                setMaps(current);
              }}
            />
            <Button
              disabled={!allowedTo}
              style={{ marginLeft: "0" }}
              name={t("server.ingameSettings.removeMap")}
              callback={() => {
                const current = [...maps];
                current.splice(index, 1);
                setMaps(current);
              }}
            />
          </div>
        );
      })}
      <ButtonRow>
        <Button
          disabled={!allowedTo}
          style={{ marginLeft: "0" }}
          name={t("server.ingameSettings.addMap")}
          callback={() =>
            setMaps((maps) => [
              ...maps,
              { mapname: bf1Maps[0], mode: bf1Modes[0] },
            ])
          }
        />
      </ButtonRow>

      <h5 style={{ marginTop: "8px" }}>{t("server.ingameSettings.cookie")}</h5>
      {!isError ? (
        <ButtonRow>
          {cookies && (
            <select
              disabled={!allowedTo}
              style={{ marginLeft: "6px" }}
              className={styles.SwitchGame}
              onChange={(e) => setCookie(e.target.value)}
            >
              <option value="">{t("cookie.accountType.default")}</option>
              {cookies.map((key: ICookie, index: number) => (
                <option key={index} selected={cookie === key.id} value={key.id}>
                  {key.name}
                </option>
              ))}
              <option value="add">{t("cookie.accountType.add")}</option>
            </select>
          )}
        </ButtonRow>
      ) : (
        <>{`Error ${error.code}: {error.message}`}</>
      )}
      {cookie === "add" && (
        <>
          <h5 style={{ marginTop: "8px" }}>
            {t("cookie.sidDescription")}
            <i>accounts.ea.com</i>
          </h5>
          <TextInput
            disabled={!allowedTo}
            name={t("cookie.sid")}
            autocomplete="off"
            callback={(e) => {
              setCookieSid(e.target.value);
            }}
          />
          <h5 style={{ marginTop: "8px" }}>
            {t("cookie.remidDescription")}
            <i>accounts.ea.com</i>
          </h5>
          <TextInput
            disabled={!allowedTo}
            name={t("cookie.remid")}
            autocomplete="off"
            callback={(e) => {
              setCookieRemid(e.target.value);
            }}
          />
        </>
      )}
      <ButtonRow>
        {props.server && canApply && (
          <Button
            name={t("apply")}
            disabled={!allowedTo || applyStatus !== null}
            callback={() =>
              editOwnerSettings.mutate({
                sid: cookieSid,
                remid: cookieRemid,
                cookieid: cookie,
                serverid: sid,
                maps: maps,
              })
            }
            status={applyStatus}
          />
        )}
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
    </>
  );
}

export function ServerSettings(props: {
  sid: string;
  server: IServerInfo;
}): React.ReactElement {
  const ownerIdGames = ["bfv", "bf2042"];

  const { sid, server } = props;
  const { t } = useTranslation();
  const {
    isError,
    data: cookieInfo,
    error,
  }: UseQueryResult<ICookieList, { code: number; message: string }> = useQuery(
    ["cookieInfo" + sid],
    () => OperationsApi.getCookieList({ sid }),
    { staleTime: 30000 },
  );
  //UseQueryResult<boolean, ICookieList, React.SetStateAction<{ code: number; message: string }>
  const cookies = cookieInfo?.data?.length > 0 ? cookieInfo.data : null;

  let allowedTo = false;
  if (server?.editPerms) allowedTo = true;

  const queryClient = useQueryClient();

  const [serverState, setServerState] = React.useState(null);
  const [canApply, setCanApply] = React.useState(false);
  const [applyStatus, setApplyStatus] = React.useState(null);
  const [errorUpdating, setError] = React.useState({
    code: 0,
    message: "Unknown",
  });

  const [restartStatus, setRestartStatus] = React.useState(null);
  const [restartErrorUpdating, setRestartError] = React.useState({
    code: 0,
    message: "Unknown",
  });

  React.useEffect(() => {
    if (server) {
      const {
        serverName,
        serverAlias,
        discordBotToken,
        discordBotMinPlayerAmount,
        discordBotPrevReqCount,
        discordBotStartedAmount,
        discordBotOwnerId,
        cookie,
      } = server;
      const originalServerState = {
        serverName,
        serverAlias,
        discordBotToken,
        discordBotMinPlayerAmount,
        discordBotPrevReqCount,
        discordBotStartedAmount,
        discordBotOwnerId,
        cookie,
      };
      if (serverState === null) {
        setServerState(originalServerState);
      } else {
        let newCanApply = false;
        for (const i in originalServerState) {
          newCanApply ||= serverState[i] !== originalServerState[i];
        }
        setCanApply(newCanApply);
      }
    }
  }, [server, serverState]);

  const changeServerState = (v: {
    serverName?: string;
    serverAlias?: string;
    cookie?: string;
    discordBotToken?: string;
    discordBotChannel?: number;
    discordBotMinPlayerAmount?: number;
    discordBotPrevReqCount?: number;
    discordBotStartedAmount?: number;
    discordBotOwnerId?: number;
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
      onError: async (
        error: React.SetStateAction<{ code: number; message: string }>,
      ) => {
        setApplyStatus(false);
        setError(error);
        setTimeout(() => setApplyStatus(null), 2000);
      },
      onSettled: async () => {
        queryClient.invalidateQueries(["server" + props.sid]);
      },
    },
  );

  const restartWorker = useMutation(
    () => OperationsApi.restartWorker({ sid: props.sid }),
    {
      onMutate: async () => {
        setRestartStatus(true);
      },
      onSuccess: async () => {
        setRestartStatus(null);
      },
      onError: async (
        error: React.SetStateAction<{ code: number; message: string }>,
      ) => {
        setRestartStatus(false);
        setRestartError(error);
        setTimeout(() => setRestartStatus(null), 2000);
      },
      onSettled: async () => {
        queryClient.invalidateQueries(["server" + props.sid]);
      },
    },
  );

  const getServerValue = (key: string) => {
    if (props.server && key in props.server) {
      return props.server[key];
    }
    return "";
  };

  let server_status = (
    <span style={{ marginLeft: "8px" }} className={styles.serverBadgePending}>
      {t("serverBotStatus.pending")}
    </span>
  );

  if (props.server) {
    if (props.server.botInfo.state === "running") {
      server_status = (
        <span style={{ marginLeft: "8px" }} className={styles.serverBadgeOk}>
          <span className={styles.liveUpdate}></span>
          {t("serverBotStatus.running", {
            worker: props.server.botInfo.serviceName,
          })}
        </span>
      );
    } else if (props.server.botInfo.state === "failed") {
      server_status = (
        <span style={{ marginLeft: "8px" }} className={styles.serverBadgeErr}>
          {t("serverBotStatus.failed")}
        </span>
      );
    } else {
      server_status = (
        <span style={{ marginLeft: "8px" }} className={styles.serverBadgeErr}>
          {t("serverBotStatus.noService")}
        </span>
      );
    }
  }

  return (
    <>
      <h2 style={{ marginLeft: "20px" }}>{t("server.settings.title")}</h2>

      <h5 style={{ marginTop: "8px" }}>
        {t("server.settings.nameDescription")}
      </h5>

      <TextInput
        disabled={!allowedTo}
        callback={(e) => changeServerState({ serverName: e.target.value })}
        defaultValue={getServerValue("serverName")}
        name={t("server.settings.name")}
      />

      <h5 style={{ marginTop: "8px" }}>
        {t("server.settings.aliasDescription")}
      </h5>

      <TextInput
        disabled={!allowedTo}
        callback={(e) => changeServerState({ serverAlias: e.target.value })}
        defaultValue={getServerValue("serverAlias")}
        name={t("server.settings.alias")}
      />

      <h5 style={{ marginTop: "8px" }}>{t("server.settings.cookie")}</h5>
      {!isError ? (
        <ButtonRow>
          {cookies ? (
            <select
              disabled={!allowedTo}
              style={{ marginLeft: "6px" }}
              className={styles.SwitchGame}
              onChange={(e) => changeServerState({ cookie: e.target.value })}
            >
              <option value="">{t("cookie.accountType.default")}</option>
              {cookies.map((key: ICookie, index: number) => (
                <option
                  key={index}
                  selected={getServerValue("cookie") === key.id}
                  value={key.id}
                >
                  {key.name}
                </option>
              ))}
            </select>
          ) : (
            ""
          )}
        </ButtonRow>
      ) : (
        <>{`Error ${error.code}: {error.message}`}</>
      )}

      <span className={styles.serverBot}>
        {t("server.settings.discordBot.main")} {server_status}{" "}
      </span>
      <h5 style={{ marginTop: "8px" }}>
        {t("server.settings.discordBot.tokenDesc")}
      </h5>
      <ButtonRow>
        <TextInput
          style={{ marginLeft: "6px" }}
          disabled={!allowedTo}
          callback={(e) =>
            changeServerState({ discordBotToken: e.target.value })
          }
          defaultValue={getServerValue("discordBotToken")}
          name={t("server.settings.discordBot.token")}
        />
        <ButtonUrl href={`/statusbotinfo`} name={t("statusBotInfo.link")} />
      </ButtonRow>

      <h5 style={{ marginTop: "8px" }}>
        {t("server.settings.discordBot.channelDesc")}
      </h5>
      <TextInput
        disabled={!allowedTo}
        callback={(e) =>
          changeServerState({ discordBotChannel: e.target.value })
        }
        defaultValue={getServerValue("discordBotChannel")}
        name={t("server.settings.discordBot.channel")}
      />

      <h5 style={{ marginTop: "8px" }}>
        {t("server.settings.discordBot.minPlayerAmountDesc")}
      </h5>
      <TextInput
        disabled={!allowedTo}
        callback={(e) =>
          changeServerState({ discordBotMinPlayerAmount: e.target.value })
        }
        defaultValue={getServerValue("discordBotMinPlayerAmount")}
        name={t("server.settings.discordBot.minPlayerAmount")}
      />

      <h5 style={{ marginTop: "8px" }}>
        {t("server.settings.discordBot.prevReqCountDesc")}
      </h5>
      <TextInput
        disabled={!allowedTo}
        callback={(e) =>
          changeServerState({ discordBotPrevReqCount: e.target.value })
        }
        defaultValue={getServerValue("discordBotPrevReqCount")}
        name={t("server.settings.discordBot.prevReqCount")}
      />

      <h5 style={{ marginTop: "8px" }}>
        {t("server.settings.discordBot.startedAmountDesc")}
      </h5>
      <TextInput
        disabled={!allowedTo}
        callback={(e) =>
          changeServerState({ discordBotStartedAmount: e.target.value })
        }
        defaultValue={getServerValue("discordBotStartedAmount")}
        name={t("server.settings.discordBot.startedAmount")}
      />

      {props.server && (
        <>
          {ownerIdGames.includes(props.server.game) && (
            <>
              <h5 style={{ marginTop: "8px" }}>
                {t("server.settings.discordBot.ownerIdDesc")}
              </h5>
              <TextInput
                disabled={!allowedTo}
                callback={(e) =>
                  changeServerState({ discordBotOwnerId: e.target.value })
                }
                defaultValue={getServerValue("discordBotOwnerId")}
                name={t("server.settings.discordBot.ownerId")}
              />
            </>
          )}

          <h5 style={{ marginTop: "8px" }}>
            {t("server.settings.discordBot.restartWorkerDesc")}
          </h5>
          <ButtonRow>
            <Button
              name={t("server.settings.discordBot.restartWorker")}
              disabled={
                !allowedTo || props.server.botInfo.state === "noService"
              }
              callback={() => restartWorker.mutate()}
              status={restartStatus}
            />
            <h5
              style={{
                marginBottom: 0,
                alignSelf: "center",
                opacity: restartStatus === false ? 1 : 0,
              }}
            >
              Error {restartErrorUpdating.code}: {restartErrorUpdating.message}
            </h5>
          </ButtonRow>
        </>
      )}
      <ButtonRow>
        <ButtonLink
          style={{ color: "#FF7575" }}
          name={t("server.danger.delete")}
          to={`/server/${props.sid}/delete/`}
          disabled={!allowedTo}
        />
        {props.server && canApply ? (
          <Button
            name={t("apply")}
            disabled={!allowedTo || applyStatus !== null}
            callback={() => editServerSettings.mutate(serverState)}
            status={applyStatus}
          />
        ) : (
          ""
        )}
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
    </>
  );
}
