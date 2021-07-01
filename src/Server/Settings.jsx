import React, { useState, useEffect } from "react";
import { useQueryClient, useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';

import { ButtonRow, Button, TextInput } from "../components";
import { OperationsApi } from "../api";



export function ServerSettings(props) {

    var allowedTo = false;
    if (props.server) allowedTo = true;

    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const [serverState, setServerState] = useState(null);
    const [canApply, setCanApply] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });

    useEffect(() => {
        if (props.server) {
            const { serverName, serverAlias } = props.server;
            const originalServerState = { serverName, serverAlias };
            if (serverState === null) {
                setServerState(originalServerState);
            } else {
                let newCanApply = false;
                for (var i in originalServerState) {
                    newCanApply |= serverState[i] !== originalServerState[i];
                }
                setCanApply(newCanApply);
            }

        }
    }, [props.server, serverState]);

    const changeSrerverState = (v) => {
        setServerState(s => ({ ...s, ...v }));
    }

    const editServerSettings = useMutation(
        variables => OperationsApi.editServer({ value: variables, sid: props.sid }),
        {
            onMutate: async () => {
                setApplyStatus(true);
            },
            onSuccess: async () => {
                setApplyStatus(null);
            },
            onError: async (error) => {
                setApplyStatus(false);
                setError(error);
                setTimeout(_ => setApplyStatus(null), 2000);
            },
            onSettled: async () => {
                queryClient.invalidateQueries('server' + props.sid);
            }
        }
    );

    const getServerValue = (key) => {
        if (props.server && key in props.server) {
            return props.server[key]
        }
        return "";
    };

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>{t("server.settings.title")}</h2>

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.nameDescription")}</h5>

            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeSrerverState({ serverName: e.target.value })}
                defaultValue={getServerValue("serverName")}
                name={t("server.settings.name")}
            />

            <h5 style={{ marginTop: "8px" }}>{t("server.settings.aliasDescription")}</h5>

            <TextInput
                disabled={!allowedTo}
                callback={(e) => changeSrerverState({ serverAlias: e.target.value })}
                defaultValue={getServerValue("serverAlias")}
                name={t("server.settings.alias")}
            />
            {
                (props.server && canApply) ? (
                    <ButtonRow>
                        <Button name={t("apply")} disabled={!allowedTo || applyStatus !== null} callback={
                            _ => editServerSettings.mutate(
                                serverState
                            )
                        } status={applyStatus} />
                        <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (applyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
                    </ButtonRow>
                ) : ""
            }
        </>
    );
}

