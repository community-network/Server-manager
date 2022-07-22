import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { checkGameString } from "../Server/Modals";

import { OperationsApi } from "../api";
import { Switch, useModal, ButtonRow, Button, TextInput, ButtonUrl } from "../components";
import '../locales/config';

import { useUser } from "../Server/Manager";


export function ChangeAccountModal({ group, gid, cookie, user, callback }) {

    var allowedTo = false;
    if (group && user) allowedTo = group.isOwner || user.auth.isDeveloper;

    const showDeleteAccount = e => {
        modal.show(
            <GroupRemoveAccount
                gid={gid}
                cookie={cookie}
            />
        );
    }

    const modal = useModal();
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [sid, setSid] = useState("");
    const [remid, setRemid] = useState("");
    const [defaultCookie, setDefaultCookie] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null);
    const currentDefault = group.defaultCookie === cookie.id;

    useEffect(() => {
        if (cookie) {
            if (remid !== cookie.remid)
                setRemid(cookie.remid);
            if (sid !== cookie.sid)
                setSid(cookie.sid);
            if (defaultCookie !== currentDefault)
                setDefaultCookie(currentDefault)
        }
    }, [cookie]);

    const editCookies = useMutation(
        variables => OperationsApi.editCookie(variables),
        {
            onMutate: async () => {
                setApplyStatus(true);
            },
            onSuccess: async () => {
                setApplyStatus(null);
            },
            onError: async () => {
                setApplyStatus(false);
                setTimeout(_ => setApplyStatus(null), 2000);
            },
            onSettled: async () => {
                queryClient.invalidateQueries('groupId' + gid);
                callback();
            }
        }
    );

    const updateGamesAccount = useMutation(
        variables => OperationsApi.updateCookieGames(variables),
        {
            onMutate: async () => {
                setApplyStatus(true);
            },
            onSuccess: async () => {
                setApplyStatus(null);
            },
            onError: async () => {
                setApplyStatus(false);
                setTimeout(_ => setApplyStatus(null), 2000);
            },
            onSettled: async () => {
                queryClient.invalidateQueries('groupId' + gid);
                callback();
            }
        }
    );

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>
                {t("group.account.main")}: {cookie.username}
            </h2>
            <h5>
                {t("cookie.sid")}
            </h5>
            <TextInput type="password" autocomplete="new-password" disabled={!allowedTo} callback={(e) => setSid(e.target.value)} defaultValue={sid} name={"Sid"} />
            <h5>
                {t("cookie.remid")}
            </h5>
            <TextInput type="password" autocomplete="new-password" disabled={!allowedTo} callback={(e) => setRemid(e.target.value)} defaultValue={remid} name={"Remid"} />
            <Switch checked={defaultCookie} name={t("cookie.setDefaultCookie")} callback={(v) => setDefaultCookie(v)} />
            <ButtonRow>
                <ButtonUrl href={`/cookieinfo`} name={t("cookieInfo.link")} />
            </ButtonRow>
            <ButtonRow>
                <Button style={{ color: "#FF7575" }} name={t("cookie.delete")} callback={showDeleteAccount} disabled={!allowedTo || currentDefault} />
                <Button name={t("cookie.supportedGames.update")} disabled={!allowedTo || applyStatus !== null} callback={
                    _ => updateGamesAccount.mutate(
                        {
                            gid: gid,
                            id: cookie.id
                        }
                    )
                } status={applyStatus} />
                {
                    (group && (sid !== cookie.sid || remid !== cookie.remid || defaultCookie !== currentDefault)) ? (
                        <Button name={t("apply")} disabled={!allowedTo || applyStatus !== null} callback={
                            _ => editCookies.mutate(
                                {
                                    gid: gid,
                                    sid: sid,
                                    remid: remid,
                                    id: cookie.id,
                                    defaultCookie: defaultCookie
                                }
                            )
                        } status={applyStatus} />
                    ) : ""
                }
            </ButtonRow>
        </>
    )
}


export function AddAccountModal({ group, gid, user, callback }) {

    var allowedTo = false;
    if (group && user) allowedTo = group.isOwner || user.auth.isDeveloper;

    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [sid, setSid] = useState("");
    const [remid, setRemid] = useState("");
    const [removeApplyStatus, setRemoveApplyStatus] = useState(null);
    const [defaultCookie, setDefaultCookie] = useState(false);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });


    const addCookies = useMutation(
        variables => OperationsApi.addCookie(variables),
        {
            onMutate: async () => {
                setRemoveApplyStatus(true);
            },
            onSuccess: async () => {
                setRemoveApplyStatus(null);
                callback();
            },
            onError: async (err) => {
                setRemoveApplyStatus(false);
                setError(err);
                setTimeout(_ => setRemoveApplyStatus(null), 2000);
            },
            onSettled: async () => {
                queryClient.invalidateQueries('groupId' + gid);
            }
        }
    );

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>
                {t("group.account.main")}
            </h2>
            <h5>
                {t("cookie.sid")}
            </h5>
            <TextInput type="password" autocomplete="new-password" disabled={!allowedTo} callback={(e) => setSid(e.target.value)} defaultValue={sid} name={"Sid"} />
            <h5>
                {t("cookie.remid")}
            </h5>
            <TextInput type="password" autocomplete="new-password" disabled={!allowedTo} callback={(e) => setRemid(e.target.value)} defaultValue={remid} name={"Remid"} />
            <Switch checked={defaultCookie} name={t("cookie.setDefaultCookie")} callback={(v) => setDefaultCookie(v)} />
            <ButtonRow>
                <ButtonUrl href={`/cookieinfo`} name={t("cookieInfo.link")} />
            </ButtonRow>
            <ButtonRow>
                {
                    (group && (sid !== "" && remid !== "")) ? (
                        <Button name={t("cookie.add")} disabled={!allowedTo || removeApplyStatus !== null} callback={
                            _ => addCookies.mutate(
                                {
                                    gid: gid,
                                    sid: sid,
                                    remid: remid,
                                    defaultCookie: defaultCookie
                                }
                            )
                        } status={removeApplyStatus} />
                    ) : ""
                }
                <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (removeApplyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
            </ButtonRow>
        </>
    )
}

export function GroupGlobalUnbanPlayer(props) {

    var { gid, eaid, playerId } = props;

    const queryClient = useQueryClient();

    const modal = useModal();
    const { t } = useTranslation();
    const [reason, setReason] = useState("");
    const [banApplyStatus, setBanApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    const { isError: userGettingError, data: user } = useUser();

    const UnbanPlayer = useMutation(
        v => OperationsApi.globalUnbanPlayer(v),
        {
            onMutate: async ({ gid, eaid, reason, name, playerId }) => {
                setBanApplyStatus(true)

                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('globalBanList' + gid)
                // Snapshot the previous value
                const perviousBanlist = queryClient.getQueryData('globalBanList' + gid)

                queryClient.setQueryData('globalBanList' + gid, old => {
                    old.data = old.data.filter(user => user.playername !== name);
                    return old;
                })
                // Return a context object with the snapshotted value
                return { perviousBanlist, gid }
            },
            onError: (err, newTodo, context) => {
                setBanApplyStatus(false);
                setError(err);
                setTimeout(_ => setBanApplyStatus(null), 3000);
                queryClient.setQueryData('globalBanList' + context.gid, context.perviousBanlist)
            },
            onSuccess: () => {
                setBanApplyStatus(null);
                modal.close();
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('globalBanList' + context.gid)
            },
        }
    );

    var perm = null;

    if (user) {
        user.permissions.isAdminOf.forEach(
            group => {
                if (gid === group.id) {
                    perm = gid
                }
            }
        )
    }


    const isDisabled =
        reason === "" ||
        banApplyStatus !== null ||
        userGettingError || !user || perm == null;

    const checkReason = (v) => (checkGameString(v)) ? setReason(v) : false;

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>{t("server.vUnbanMenu.main", { name: props.eaid })} </h2>
            <h5 style={{ maxWidth: "300px" }} >{t("server.vUnbanMenu.reasonDescription")}</h5>
            <TextInput value={reason} name={t("server.vUnbanMenu.reason")} callback={(e) => checkReason(e.target.value)} />
            <ButtonRow>
                <Button
                    name={t("server.vUnbanMenu.confirm")}
                    style={{ maxWidth: "144px" }}
                    disabled={isDisabled}
                    callback={() => {
                        UnbanPlayer.mutate({ gid, eaid, reason, name: props.eaid, playerId });
                    }}
                    status={banApplyStatus} />
                <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (banApplyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
            </ButtonRow>
        </>
    );
}

export function GroupRemoveAccount(props) {
    const { gid, cookie } = props;

    const queryClient = useQueryClient();

    const modal = useModal();
    const { t } = useTranslation();
    const [removeApplyStatus, setRemoveApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    const { isError: userGettingError, data: user } = useUser();

    const RemoveAccount = useMutation(
        v => OperationsApi.removeCookie(v),
        {
            onMutate: async ({gid, id}) => {
                setRemoveApplyStatus(true)
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('groupId' + gid)
                // Snapshot the previous value
                const previousGroup = queryClient.getQueryData('groupId' + gid)

                queryClient.setQueryData('groupId' + gid, old => {
                    old.data[0].cookies = old.data[0].cookies.filter(item => item.id !== id);
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousGroup, gid }
            },
            onError: (err, newTodo, context) => {
                setRemoveApplyStatus(false);
                setError(err);
                setTimeout(_ => setRemoveApplyStatus(null), 3000);
                queryClient.setQueryData('groupId' + context.gid, context.previousGroup)
            },
            onSuccess: () => {
                setRemoveApplyStatus(null);
                modal.close();
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('groupId' + context.gid)
            },
        }
    );

    var perm = null;

    if (user) {
        user.permissions.isAdminOf.forEach(
            group => {
                if (gid === group.id) {
                    perm = gid
                }
            }
        )
    }


    const isDisabled =
        removeApplyStatus !== null ||
        userGettingError || !user || perm == null;

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>{t("cookie.removeMenu.main", { name: cookie.username })} </h2>
            <ButtonRow>
                <Button
                    name={t("cookie.removeMenu.confirm")}
                    style={{ maxWidth: "144px" }}
                    disabled={isDisabled}
                    callback={() => {
                        RemoveAccount.mutate({ gid, id: cookie.id });
                    }}
                    status={removeApplyStatus} />
                <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (removeApplyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
            </ButtonRow>
        </>
    );
}

export function GroupRemoveExclusionPlayer(props) {
    const { gid, eaid, playerId } = props;

    const queryClient = useQueryClient();

    const modal = useModal();
    const { t } = useTranslation();
    const [reason, setReason] = useState("");
    const [excludeApplyStatus, setExcludeApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    const { isError: userGettingError, data: user } = useUser();

    const RemoveExcludedPlayer = useMutation(
        v => OperationsApi.globalRemoveExcludePlayer(v),
        {
            onMutate: async ({ gid, eaid, reason, name, playerId }) => {
                setExcludeApplyStatus(true)

                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('globalExclusionList' + gid)
                // Snapshot the previous value
                const previousExcludedlist = queryClient.getQueryData('globalExclusionList' + gid)

                queryClient.setQueryData('globalExclusionList' + gid, old => {
                    old.data = old.data.filter(user => user.playername !== name);
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousExcludedlist, gid }
            },
            onError: (err, newTodo, context) => {
                setExcludeApplyStatus(false);
                setError(err);
                setTimeout(_ => setExcludeApplyStatus(null), 3000);
                queryClient.setQueryData('globalExclusionList' + context.gid, context.previousExcludedlist)
            },
            onSuccess: () => {
                setExcludeApplyStatus(null);
                modal.close();
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('globalExclusionList' + context.gid)
            },
        }
    );

    var perm = null;

    if (user) {
        user.permissions.isAdminOf.forEach(
            group => {
                if (gid === group.id) {
                    perm = gid
                }
            }
        )
    }


    const isDisabled =
        reason === "" ||
        excludeApplyStatus !== null ||
        userGettingError || !user || perm == null;

    const checkReason = (v) => (checkGameString(v)) ? setReason(v) : false;

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>{t("server.removeExclusionsMenu.main", { name: props.eaid })} </h2>
            <h5 style={{ maxWidth: "300px" }} >{t("server.removeExclusionsMenu.reasonDescription")}</h5>
            <TextInput value={reason} name={t("server.removeExclusionsMenu.reason")} callback={(e) => checkReason(e.target.value)} />
            <ButtonRow>
                <Button
                    name={t("server.removeExclusionsMenu.confirm")}
                    style={{ maxWidth: "144px" }}
                    disabled={isDisabled}
                    callback={() => {
                        RemoveExcludedPlayer.mutate({ gid, eaid, reason, name: props.eaid, playerId });
                    }}
                    status={excludeApplyStatus} />
                <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (excludeApplyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
            </ButtonRow>
        </>
    );
}

export function GroupRemoveReason(props) {
    const { gid, reasonId } = props;

    const queryClient = useQueryClient();

    const modal = useModal();
    const { t } = useTranslation();
    const [reasonApplyStatus, setReasonApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    const { isError: userGettingError, data: user } = useUser();

    const RemoveReason = useMutation(
        v => OperationsApi.delReason(v),
        {
            onMutate: async ({ gid, reasonId }) => {
                setReasonApplyStatus(true)

                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('globalReasonList' + gid)
                // Snapshot the previous value
                const previousReasonlist = queryClient.getQueryData('globalReasonList' + gid)

                queryClient.setQueryData('globalReasonList' + gid, old => {
                    old.data = old.data.filter(item => item.id !== reasonId);
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousReasonlist, gid }
            },
            onError: (err, newTodo, context) => {
                setReasonApplyStatus(false);
                setError(err);
                setTimeout(_ => setReasonApplyStatus(null), 3000);
                queryClient.setQueryData('globalReasonList' + context.gid, context.previousReasonlist)
            },
            onSuccess: () => {
                setReasonApplyStatus(null);
                modal.close();
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('globalReasonList' + context.gid)
            },
        }
    );

    var perm = null;

    if (user) {
        user.permissions.isAdminOf.forEach(
            group => {
                if (gid === group.id) {
                    perm = gid
                }
            }
        )
    }


    const isDisabled =
        reasonApplyStatus !== null ||
        userGettingError || !user || perm == null;

    return (
        <>
            <h2 style={{ marginLeft: "20px" }}>{t("server.removeReasonMenu.main", { name: props.eaid })} </h2>
            <ButtonRow>
                <Button
                    name={t("server.removeReasonMenu.confirm")}
                    style={{ maxWidth: "144px" }}
                    disabled={isDisabled}
                    callback={() => {
                        RemoveReason.mutate({ gid, reasonId });
                    }}
                    status={reasonApplyStatus} />
                <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (reasonApplyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
            </ButtonRow>
        </>
    );
}
