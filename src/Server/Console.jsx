
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

import { useModal, Card, ButtonRow, Button, Row, TextInput, ShowDropDown } from "../components";
import '../locales/config';

import { ServerKickPlayer, ServerBanPlayer, ServerMovePlayer } from "./Modals";
import { useUnban, useRemoveVip, useAddVip, useMovePlayer } from "./Manager";
import { LogList } from "./ActionLogs";

/**
 * Console block to operate the server
 */
export default function Console(props) {

    const { t } = useTranslation();

    const [playerName, setPlayerName] = useState("");
    const [removeVipStatus, RemoveVip] = useRemoveVip();
    const [unbanStatus, UnbanPlayer] = useUnban();
    const [addVipStatus, AddVip] = useAddVip();
    const movePlayer = useMovePlayer();
    const modal = useModal();
    const [teamId, setTeamId] = useState(false);

    var disabledButton = (playerName === "");

    let sid = props.sid;
    let game = props.game;
    let server = props.server;

    let haveGame = !!game;
    let haveServer = !!server;

    let gameName = haveServer ? server.game : false;

    let teams = haveGame ? game.data[0].players : null;
    let havePlayers = teams && !("error" in teams[0]) && (teams[0].players !== undefined || teams[1].players !== undefined);
    let teamsNotEmpty = havePlayers && (teams[0].players.length > 0 || teams[1].players.length > 0);

    var isMovableModal = haveGame && havePlayers && teamsNotEmpty;

    var isOpsMode = isMovableModal && (game.data[0].info.mode.toLowerCase() === "operations");
    var playerNicknameTeam = null;

    const team = playerName.length >= 1 && haveGame ? game.data[0].players[0].players.map(({ name }) => name).concat(game.data[0].players[1].players.map(({ name }) => name)) : [];
    let suggestions = team.filter(
        suggestion =>
            suggestion.toLowerCase().indexOf(playerName.toLowerCase()) > -1
    );
    const playerCallback = name => {
        setPlayerName(name)
    }
    suggestions = suggestions.map((user) => { return { name: user, callback: playerCallback } });

    if (isMovableModal) {
        var f1 = teams[0].players.find(e => (!e) ? false : e.name === playerName);
        var f2 = teams[1].players.find(e => (!e) ? false : e.name === playerName);

        if (f1 !== undefined) {
            playerNicknameTeam = "1";
        } else if (f2 !== undefined) {
            playerNicknameTeam = "2";
        } else {
            isMovableModal = false;
        }
    }

    const showMovePlayer = _ => {

        const movePlayerModal = _ => {
            movePlayer.mutate({ sid, team: isMovableModal ? playerNicknameTeam : teamId ? "1" : "2", name: playerName });
        }

        if (isMovableModal) {
            movePlayerModal();
            return;
        }

        modal.show(
            <ServerMovePlayer team={teamId} setTeam={setTeamId} callback={movePlayerModal} />
        )

    };

    const showServerKickPlayer = _ => {
        modal.show(
            <ServerKickPlayer sid={sid} eaid={playerName} />
        )
    };

    const showBanPlayer = _ => {
        modal.show(
            <ServerBanPlayer sid={sid} playerInfo={{ name: playerName }} />
        )
    };

    const unbanPlayerCallback = _ => {
        UnbanPlayer.mutate({ sid, name: playerName, reason: "" })
    };

    const addVipCallback = _ => {
        AddVip.mutate({ sid, name: playerName, reason: "" })
    };

    const removeVipCallback = _ => {
        RemoveVip.mutate({ sid, name: playerName, reason: "" })
    };

    return (
        <Card>
            <h2>{t("server.console.main")}</h2>
            <Row>
                {suggestions.length !== 0 && suggestions[0].name !== playerName ? <ShowDropDown options={suggestions} /> : <></>}
                <TextInput name={t("server.playerName")} id="inputElement" callback={e => setPlayerName(e.target.value)} value={playerName} style={{
                    marginRight: 12,
                }} />

                <ButtonRow>
                    {gameName && gameName === "bf1" ? (
                        <>
                            <Button disabled={disabledButton} name={t("server.action.kick")} callback={showServerKickPlayer} />
                            <Button disabled={disabledButton} name={t("server.action.move")} callback={showMovePlayer} />

                            <Button disabled={disabledButton} name={t("server.action.ban")} callback={showBanPlayer} />
                            <Button disabled={disabledButton || unbanStatus.status} name={unbanStatus.name} callback={unbanPlayerCallback} />

                            <Button disabled={disabledButton || addVipStatus.status || isOpsMode} name={addVipStatus.name} callback={addVipCallback} />
                            <Button disabled={disabledButton || removeVipStatus.status || isOpsMode} name={removeVipStatus.name} callback={removeVipCallback} />
                        </>
                    ) : <>
                        <Button disabled={disabledButton} name={t("server.action.kick")} callback={showServerKickPlayer} />
                        {gameName && gameName === "bf2042" ? (
                            <>
                                <Button disabled={disabledButton} name={t("server.action.ban")} callback={showBanPlayer} />
                                <Button disabled={disabledButton || unbanStatus.status} name={unbanStatus.name} callback={unbanPlayerCallback} />
                            </>
                        ) : <></>}
                    </>}
                </ButtonRow>
            </Row>
            <LogList sid={sid} />
        </Card>
    );
}