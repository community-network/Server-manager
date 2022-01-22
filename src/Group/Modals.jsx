import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';
import { checkGameString } from "../Server/Modals";

import { OperationsApi } from "../api";
import { useModal, ButtonRow, Button, TextInput, Row, ButtonUrl } from "../components";
import '../locales/config';

import { useUser } from "../Server/Manager";


export function ChangeAccountModal({ group, gid, user, callback }) {
    
    var allowedTo = false;
    if (group && user) allowedTo = group.isOwner || user.auth.isDeveloper;

    const modal = useModal();
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [sid, setSid] = useState("");
    const [remid, setRemid] = useState("");
    const [applyStatus, setApplyStatus] = useState(null);

    useEffect(() => {
        if (group) {
            if (remid !== group.cookie.remid)
                setRemid(group.cookie.remid);
            if (sid !== group.cookie.sid)
                setSid(group.cookie.sid);
        }
    }, [group]);

    const editCookies = useMutation(
        variables => OperationsApi.editGroup(variables),
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
                {t("group.account.main")}
            </h2>
            <h5>
                {t("cookie.remid")}
            </h5>
            <TextInput type="password" autocomplete="new-password" disabled={!allowedTo} callback={(e) => setRemid(e.target.value)} defaultValue={remid} name={"Remid"} />
            <h5>
                {t("cookie.sid")}
            </h5>
            <TextInput type="password" autocomplete="new-password" disabled={!allowedTo} callback={(e) => setSid(e.target.value)} defaultValue={sid} name={"Sid"} />


            <ButtonRow>
                <ButtonUrl href={`/cookieinfo`} name={t("cookieInfo.link")} />
            </ButtonRow>
            {
                (group && (sid !== group.cookie.sid || remid !== group.cookie.remid)) ? (
                    <ButtonRow>
                        <Button name={t("apply")} disabled={!allowedTo || applyStatus !== null} callback={
                            _ => editCookies.mutate(
                                {
                                    gid: gid,
                                    value: {
                                        cookie: { sid, remid }
                                    }
                                }
                            )
                        } status={applyStatus} />
                    </ButtonRow>
                ) : ""
            }
        </>
    )
}

export function GroupGlobalUnbanPlayer(props) {

    var { gid, eaid, playerId } = props;

    const modal = useModal();
    const { t } = useTranslation();
    const [reason, setReason] = useState("");
    const [banApplyStatus, setBanApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    const { isError: userGettingError, data: user } = useUser();

    const UnbanPlayer = useMutation(
        v => OperationsApi.globalUnbanPlayer(v),
        {
            onMutate: async () => {
                setBanApplyStatus(true)
            },
            onError: (error) => {
                setBanApplyStatus(false);
                setError(error);
                setTimeout(_ => setBanApplyStatus(null), 3000);
            },
            onSuccess: () => {
                setBanApplyStatus(null);
                modal.close();
            },
        }
    );

    var perm = null;

    if (user) {
        user.permissions.isAdminOf.map(
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
            <h2 style={{ marginLeft: "20px" }}>{t("server.vUnbanMenu.main", {name: props.eaid})} </h2>
            <h5 style={{maxWidth: "300px"}} >{t("server.vUnbanMenu.reasonDescription")}</h5>
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