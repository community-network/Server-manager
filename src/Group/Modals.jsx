import React, { useState } from "react";
import { useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import { checkGameString } from "../Server/Modals";

import { OperationsApi } from "../api";
import { useModal, ButtonRow, Button, TextInput } from "../components";
import '../locales/config';

import { useUser } from "../Server/Manager";



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