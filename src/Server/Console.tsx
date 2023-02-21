import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  useModal,
  Card,
  ButtonRow,
  Button,
  Row,
  TextInput,
  ShowDropDown,
} from "../components";
import "../locales/config";

import { ServerKickPlayer, ServerBanPlayer, ServerMovePlayer } from "./Modals";
import { useUnban, useRemoveVip, useAddVip, useMovePlayer } from "./Manager";
import { LogList } from "./ActionLogs";
import { IInGameServerInfo, IServerInfo } from "../api/ReturnTypes";

/**
 * Console block to operate the server
 */
export default function Console(props: {
  sid: string;
  game: IInGameServerInfo;
  server: IServerInfo;
}): React.ReactElement {
  const { t } = useTranslation();
  const { sid, game, server } = props;

  const [playerName, setPlayerName] = React.useState("");
  const [removeVipStatus, RemoveVip]: any = useRemoveVip();
  const [unbanStatus, UnbanPlayer]: any = useUnban();
  const [addVipStatus, AddVip]: any = useAddVip();
  const movePlayer = useMovePlayer();
  const modal = useModal();
  const [teamId, setTeamId] = React.useState(false);

  const disabledButton = playerName === "";

  const haveGame = !!game;
  const haveServer = !!server;

  const gameName = haveServer ? server.game : false;

  const teams = haveGame ? game.data[0].players : null;
  const havePlayers =
    teams &&
    !("error" in teams[0]) &&
    (teams[0].players !== undefined || teams[1].players !== undefined);
  const teamsNotEmpty =
    havePlayers && (teams[0].players.length > 0 || teams[1].players.length > 0);

  let isMovableModal = haveGame && havePlayers && teamsNotEmpty;

  const isOpsMode =
    isMovableModal && game.data[0].info.mode.toLowerCase() === "operations";
  let playerNicknameTeam = null;

  const team =
    playerName.length >= 1 && haveGame
      ? game.data[0].players[0].players
          .map(({ name }) => name)
          .concat(game.data[0].players[1].players.map(({ name }) => name))
      : [];
  const suggestionString = team.filter(
    (suggestion: string) =>
      suggestion.toLowerCase().indexOf(playerName.toLowerCase()) > -1,
  );
  const playerCallback = (name: React.SetStateAction<string>) => {
    setPlayerName(name);
  };
  const suggestions = suggestionString.map((user: string) => {
    return { name: user, callback: playerCallback };
  });

  if (isMovableModal) {
    const f1 = teams[0].players.find((e: { name: string }) =>
      !e ? false : e.name === playerName,
    );
    const f2 = teams[1].players.find((e: { name: string }) =>
      !e ? false : e.name === playerName,
    );

    if (f1 !== undefined) {
      playerNicknameTeam = "1";
    } else if (f2 !== undefined) {
      playerNicknameTeam = "2";
    } else {
      isMovableModal = false;
    }
  }

  const showMovePlayer = () => {
    const movePlayerModal = () => {
      movePlayer.mutate({
        sid,
        team: isMovableModal ? playerNicknameTeam : teamId ? "1" : "2",
        name: playerName,
      });
    };

    if (isMovableModal) {
      movePlayerModal();
      return;
    }

    modal.show(
      <ServerMovePlayer
        team={teamId}
        setTeam={setTeamId}
        callback={movePlayerModal}
      />,
    );
  };

  const showServerKickPlayer = () => {
    modal.show(<ServerKickPlayer sid={sid} eaid={playerName} />);
  };

  const showBanPlayer = () => {
    modal.show(<ServerBanPlayer sid={sid} playerInfo={{ name: playerName }} />);
  };

  const unbanPlayerCallback = () => {
    UnbanPlayer.mutate({ sid, name: playerName, reason: "" });
  };

  const addVipCallback = () => {
    AddVip.mutate({ sid, name: playerName, reason: "" });
  };

  const removeVipCallback = () => {
    RemoveVip.mutate({ sid, name: playerName, reason: "" });
  };

  return (
    <Card>
      <h2>{t("server.console.main")}</h2>
      <Row>
        {suggestions.length > 0 && suggestions[0].name !== playerName ? (
          <ShowDropDown options={suggestions} />
        ) : (
          <></>
        )}
        <TextInput
          name={t("server.playerName")}
          id="inputElement"
          callback={(e) => setPlayerName(e.target.value)}
          value={playerName}
          style={{
            marginRight: 12,
          }}
        />

        <ButtonRow>
          {gameName && gameName === "bf1" ? (
            <>
              <Button
                disabled={disabledButton}
                name={t("server.action.kick")}
                callback={showServerKickPlayer}
              />
              <Button
                disabled={disabledButton}
                name={t("server.action.move")}
                callback={showMovePlayer}
              />

              <Button
                disabled={disabledButton}
                name={t("server.action.ban")}
                callback={showBanPlayer}
              />
              <Button
                disabled={disabledButton || unbanStatus.status}
                name={unbanStatus.name}
                callback={unbanPlayerCallback}
              />

              <Button
                disabled={disabledButton || addVipStatus.status || isOpsMode}
                name={addVipStatus.name}
                callback={addVipCallback}
              />
              <Button
                disabled={disabledButton || removeVipStatus.status || isOpsMode}
                name={removeVipStatus.name}
                callback={removeVipCallback}
              />
            </>
          ) : (
            <>
              <Button
                disabled={disabledButton}
                name={t("server.action.kick")}
                callback={showServerKickPlayer}
              />
              {gameName && gameName === "bf2042" ? (
                <>
                  <Button
                    disabled={disabledButton}
                    name={t("server.action.ban")}
                    callback={showBanPlayer}
                  />
                  <Button
                    disabled={disabledButton || unbanStatus.status}
                    name={unbanStatus.name}
                    callback={unbanPlayerCallback}
                  />
                </>
              ) : (
                <></>
              )}
            </>
          )}
        </ButtonRow>
      </Row>
      <LogList sid={sid} />
    </Card>
  );
}
