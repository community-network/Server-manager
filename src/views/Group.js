import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Redirect, useHistory } from 'react-router-dom';
import { OperationsApi } from "../api";
import { useModal, GroupLogs, VBanList, GameStatsAd, Column, Card, Header, ButtonLink, ButtonRow, Button, UserStRow, Row, ServerRow, FakeUserStRow, TextInput, SmallButton, PageCard } from "../components";
import '../locales/config';
import { useTranslation } from 'react-i18next';

const deleteIcon = (
    <svg viewBox="0 0 24 24" style={{ width: '16px' }}>
        <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
    </svg>
);


export function Group(props) {

    var gid = props.match.params.gid;

    const queryClient = useQueryClient();

    const { error: groupError, data: groups } = useQuery('groupId' + gid, () => OperationsApi.getGroup(gid), { staleTime: 30000 });
    const { error: userError, data: user } = useQuery('user', () => OperationsApi.user);


    const removeAdmin = useMutation(
        variables => OperationsApi.removeGroupAdmin(variables),
        {
            // When mutate is called:
            onMutate: async ({ gid, uid }) => {
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('groupId' + gid)
                // Snapshot the previous value
                const previousGroup = queryClient.getQueryData('groupId' + gid)
                // Optimistically update to the new value
                const UTCNow = new Date(Date.now()).toUTCString();

                queryClient.setQueryData('groupId' + gid, old => {
                    old.data[0].admins = old.data[0].admins.filter(admin => admin.id !== uid);
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousGroup, gid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                queryClient.setQueryData('groupId' + context.gid, context.previousGroup)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('groupId' + context.gid)
            },
        }
    );

    const removeServer = useMutation(
        variables => OperationsApi.removeServer(variables),
        {
            // When mutate is called:
            onMutate: async ({ gid, sid }) => {
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('groupId' + gid)
                // Snapshot the previous value
                const previousGroup = queryClient.getQueryData('groupId' + gid)
                // Optimistically update to the new value
                queryClient.setQueryData('groupId' + gid, old => {
                    old.data[0].servers = old.data[0].servers.filter(server => server.id !== sid);
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousGroup, gid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                queryClient.setQueryData('groupId' + context.gid, context.previousGroup)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('groupId' + context.gid)
            },
        }
    );



    const removeOwner = useMutation(
        variables => OperationsApi.removeGroupOwner(variables),
        {
            // When mutate is called:
            onMutate: async ({ gid, uid }) => {
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('groupId' + gid)
                // Snapshot the previous value
                const previousGroup = queryClient.getQueryData('groupId' + gid)
                // Optimistically update to the new value
                const UTCNow = new Date(Date.now()).toUTCString();

                queryClient.setQueryData('groupId' + gid, old => {
                    old.data[0].owners = old.data[0].owners.filter(admin => admin.id !== uid);
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousGroup, gid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                queryClient.setQueryData('groupId' + context.gid, context.previousGroup)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('groupId' + context.gid)
            },
        }
    );


    var group = (groups && groups.data && groups.data.length > 0) ? groups.data[0] : null;
    const [listing, setListing] = useState("servers");
    const [settingsListing, setSettingsListing] = useState("account");
    const { t } = useTranslation();

    const catListing = {
        owners: <GroupOwners group={group} user={user} gid={gid} onDelete={removeOwner} />,
        admins: <GroupAdmins group={group} user={user} gid={gid} onDelete={removeAdmin} />,
        servers: <GroupServers group={group} user={user} gid={gid} onDelete={removeServer} />,
        vbanlist: <VBanList user={user} gid={gid} />,
        grouplogs: <GroupLogs gid={gid} />,
    }


    const catSettings = {
        account: <GroupServerAccount gid={gid} user={user} group={group} />,
        discord: <GroupDiscordSettings gid={gid} user={user} group={group} />,
        danger: <GroupDangerZone gid={gid} user={user} group={group} />,
    }

    const pageCycle = [
        {
            name: t("group.servers.main"),
            callback: () => setListing("servers"),
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
            name: t("group.logs.main"),
            callback: () => setListing("grouplogs"),
        }
    ]

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
            name: t("group.danger.main"),
            callback: () => setSettingsListing("danger"),
        },
    ];

    if (groupError || userError || (groups && groups.data && groups.data.length === 0)) {
        return <Redirect to="/" />;
    }

    return (
        <>
            <Row>
                <Column>
                    <Header>
                        <h2>{t("group.main")}</h2>
                    </Header>
                </Column>
            </Row>
            <Row>
                <Column>
                    <Card>
                        <h2>{t("group.name")} - {(group) ? group.groupName : t("pending")}</h2>
                        <p style={{ marginBottom: 0 }}>{t("group.id")} {gid}</p>
                    </Card>
                </Column>
            </Row>
            <Row>
                <Column>
                    <PageCard buttons={settingsCycle} maxWidth="500" >
                        {catSettings[settingsListing]}
                    </PageCard>
                </Column>
            </Row>
            <Row>
                <Column>
                    <PageCard buttons={pageCycle} maxWidth="560" >
                        {catListing[listing]}
                    </PageCard>
                 </Column>
            </Row>
        </>
    );


}

function GroupAdmins(props) {

    const modal = useModal();

    var hasRights = false;
    const [selected, setSelected] = useState([]);
    const { t } = useTranslation();

    if (props.group && props.user) hasRights = props.group.isOwner || props.user.auth.isDeveloper;

    const fakeListing = [1, 1, 1];

    let adminList;
    if (props.group) {
        adminList = [...props.group.admins];
        adminList.sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt));
    }

    const isSelected = selected.length > 0;

    const changeSelected = (v, id) => {
        setSelected(b => (!v) ? b.filter(item => item !== id) : [...b, id])
    }

    const removeAdmins = () => {
        setSelected([]);
        selected.map((o) => props.onDelete.mutate({ gid: props.gid, uid: o }))
    }

    return <>
        <h5>{t("group.admins.description0")}<br />{t("group.admins.description1")}</h5>
        {
            (isSelected) ? (<h5><b>{t("group.admins.selected", {number: selected.length})}</b></h5>) : (<h5>{t("group.admins.select")}</h5>)
        }
        <ButtonRow>
            {
                (hasRights) ? (
                    <Button name={t("group.admins.add")} callback={() => modal.show(<AddGroupAdmin gid={props.group.id} callback={modal.close} />)} />
                ) : (
                    <Button disabled={true} name={t("denied")} content={t("group.admins.add")} />
                )
            }
            {
                (hasRights && isSelected) ? (
                    <Button name={t("group.admins.removeSelected")} callback={removeAdmins} />
                ) : (
                    <Button disabled={true} name={t("group.admins.remove")} />
                )
            }
        </ButtonRow>
        {
            (props.group) ? (
                adminList.map((admin, i) => (
                    <UserStRow user={admin} callback={(v) => changeSelected(v, admin.id)} key={admin.id || i} />
                ))
            ) : (
                fakeListing.map((_, i) => <FakeUserStRow key={i} />)
            )
        }
    </>;
}


function GroupServers(props) {

    var hasRights = false;

    if (props.group && props.user) hasRights = props.group.isOwner || props.user.auth.isDeveloper;

    const fakeListing = [1, 1, 1];
    const { t } = useTranslation();

    return <>
        <h5>{t("group.servers.description0")}<br />{t("group.servers.description1")}</h5>
        {
            (props.group) ? (
                props.group.servers.map((server, i) => (
                    <ServerRow server={server} key={i} button={
                        <SmallButton
                            name="Delete"
                            content={deleteIcon}
                            disabled={!hasRights}
                            vars={{ gid: props.gid, sid: server.id }}
                            callback={props.onDelete.mutate}
                        />
                    } />
                ))
            ) : (
                fakeListing.map((_, i) => <FakeUserStRow key={i} />)
            )
        }
        <ButtonRow>
            {
                (hasRights) ? (
                    <ButtonLink name={t("group.servers.add")} to={"/group/" + props.gid + "/add/server"} />
                ) : (
                    <Button disabled={true} name={t("denied")} content={t("group.servers.add")} />
                )
            }
        </ButtonRow>
    </>;
}

function GroupOwners(props) {

    const modal = useModal();
    const [selected, setSelected] = useState([]);
    const { t } = useTranslation();

    var hasRights = false;
    if (props.group && props.user) hasRights = props.group.isOwner || props.user.auth.isDeveloper;

    const fakeListing = [1, 1, 1];

    let ownerList;
    if (props.group) {
        ownerList = [...props.group.owners];
        ownerList.sort((a, b) => Date.parse(b.addedAt) - Date.parse(a.addedAt));
    }

    const isSelected = selected.length > 0;

    const changeSelected = (v, id) => {
        setSelected(b => (!v) ? b.filter(item => item !== id) : [...b, id])
    }

    const removeOwners = () => {
        setSelected([]);
        selected.map((o) => props.onDelete.mutate({ gid: props.gid, uid: o }))
    }

    return <>
        <h5>{t("group.owners.description0")}<br />{t("group.owners.description1")}</h5>
        {
            (isSelected) ? (<h5><b>{t("group.owners.selected", {number: selected.length})}</b></h5>) : (<h5>{t("group.owners.select")}</h5>)
        }
        <ButtonRow>
            {
                (hasRights) ? (
                    <Button name={t("group.owners.add")} callback={() => modal.show(<AddGroupOwner gid={props.group.id} callback={modal.close} />)} />
                ) : (
                    <Button disabled={true} name={t("denied")} content={t("group.owners.add")} />
                )
            }
            {
                (hasRights && isSelected) ? (
                    <Button name={t("group.owners.removeSelected")} callback={removeOwners} />
                ) : (
                    <Button disabled={true} name={t("group.owners.remove")} />
                )
            }
        </ButtonRow>
        {
            (ownerList) ? (
                ownerList.map((owner, i) => (
                    <UserStRow user={owner} callback={(v) => changeSelected(v, owner.id)} key={owner.id || i} />
                ))
            ) : (
                fakeListing.map((_, i) => <FakeUserStRow key={i} />)
            )
        }
        
    </>;
}


function GroupServerAccount(props) {
    var allowedTo = false;
    if (props.group && props.user) allowedTo = props.group.isOwner || props.user.auth.isDeveloper;

    const queryClient = useQueryClient();

    const [sid, setSid] = useState("");
    const [remid, setRemid] = useState("");
    const [applyStatus, setApplyStatus] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (props.group) {
            if (remid !== props.group.cookie.remid)
                setRemid(props.group.cookie.remid);
            if (sid !== props.group.cookie.sid)
                setSid(props.group.cookie.sid);
        } 
    }, [props.group]);

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
                queryClient.invalidateQueries('groupId' + props.gid);
            }
        }
    );

    return (
        <>
            <h5 style={{ marginTop: "0px" }}>
                {t("group.account.description0")}<br />{t("group.account.description1")}<i>accounts.ea.com</i>
            </h5>
            {(props.group && !props.group.validCookie) ? (
                <p style={{ marginTop: "0px", border: "1px solid var(--color-second)", padding: "10px 22px", borderRadius: "8px", color: "#FF7575", background: "var(--color-container-v2)" }}>
                    {t("cookie.invalid")}
                </p>
            ) : ""}
            
            <Row>
                <TextInput type="password" disabled={!allowedTo} callback={(e) => setRemid(e.target.value)} defaultValue={remid} name={"Remid"} />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    {t("cookie.remid")}
                </p>
            </Row>
            <Row>
                <TextInput type="password" disabled={!allowedTo} callback={(e) => setSid(e.target.value)} defaultValue={sid} name={"Sid"} />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    {t("cookie.sid")}
                </p>
            </Row>
            {
                (props.group && (sid !== props.group.cookie.sid || remid !== props.group.cookie.remid)) ? (
                    <ButtonRow>
                        <Button name={t("apply")} disabled={!allowedTo || applyStatus !== null} callback={
                            _ => editCookies.mutate(
                                {
                                    gid: props.gid,
                                    value: {
                                        cookie: { sid, remid }
                                    }
                                }
                            )
                        } status={applyStatus} />
                    </ButtonRow>
                ): ""
            }
        </>
    );
}

function GroupDiscordSettings(props) {
    var allowedTo = false;
    if (props.group && props.user) allowedTo = props.group.isOwner || props.user.auth.isDeveloper;

    const queryClient = useQueryClient();

    const [adminId, setAdminId] = useState("");
    const [modId, setModId] = useState("");
    const [serverId, setServerId] = useState("");
    const [applyStatus, setApplyStatus] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (props.group) {

            if (serverId !== props.group.discordGroupId)
                setServerId(props.group.discordGroupId);

            if (modId !== props.group.discordModRoleId)
                setModId(props.group.discordModRoleId);

            if (adminId !== props.group.discordAdminRoleId)
                setAdminId(props.group.discordAdminRoleId);

        }
    }, [props.group]);

    const editDiscordDetails = useMutation(
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
                queryClient.invalidateQueries('groupId' + props.gid);
            }
        }
    );

    return (
        <> 
            <GameStatsAd />
            <h5 style={{ marginTop: "8px" }}>
                {t("group.discord.description0")}<br />{t("group.discord.description1")}
            </h5>
            <h5>
                {t("group.discord.commandList")}
            </h5>
            <Row>
                <TextInput disabled={!allowedTo} callback={(e) => setServerId(e.target.value)} defaultValue={serverId} name={t("discord.id")} />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    {t("discord.idDescription")}
                </p>
            </Row>
            <h5 style={{ marginTop: "8px" }}>
                {t("group.discord.permDescription0")}<br />{t("group.discord.permDescription1")}
            </h5>
            <Row>
                <TextInput disabled={!allowedTo} callback={(e) => setAdminId(e.target.value)} defaultValue={adminId} name={t("discord.adminId")}  />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    {t("discord.adminIdDescription")}
                </p>
            </Row>
            <Row>
                <TextInput disabled={!allowedTo} callback={(e) => setModId(e.target.value)} defaultValue={modId} name={t("discord.modId")} />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    {t("discord.modIdDescription")}
                </p>
            </Row>
            {
                (props.group && (serverId !== props.group.discordGroupId || modId !== props.group.discordModRoleId || adminId !== props.group.discordAdminRoleId)) ? (
                    <ButtonRow>
                        <Button name={t("apply")} disabled={!allowedTo || applyStatus !== null} callback={
                            _ => editDiscordDetails.mutate(
                                {
                                    gid: props.gid,
                                    value: {
                                        discordGroupId: serverId,
                                        discordModRoleId: modId,
                                        discordAdminRoleId: adminId
                                    }
                                }
                            )
                        } status={applyStatus} />
                    </ButtonRow>
                ) : ""
            }
        </>
    );
}


function GroupDangerZone(props) {

    var allowedTo = false;
    if (props.group && props.user) allowedTo = props.group.isOwner || props.user.auth.isDeveloper;

    const queryClient = useQueryClient();

    const [groupName, setGroupName] = useState("");
    const [applyStatus, setApplyStatus] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {

        if (props.group && groupName !== props.group.groupName) {
            setGroupName(props.group.groupName);    
        }

    }, [props.group]);

    const editGroupName = useMutation(
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
                queryClient.invalidateQueries('groupId' + props.gid);
            }
        }
    );

    return (
        <>
            <h5 style={{ marginTop: "0px" }}>{t("group.danger.nameChange")}</h5>
            <TextInput disabled={!allowedTo} callback={(e) => setGroupName(e.target.value)} defaultValue={groupName} name={t("group.name")} />
            {
                (props.group && (groupName !== props.group.groupName)) ? (
                    <ButtonRow>
                        <Button name={t("apply")} disabled={!allowedTo || applyStatus !== null} callback={
                            _ => editGroupName.mutate(
                                {
                                    gid: props.gid,
                                    value: {
                                        groupName,
                                    }
                                }
                            )
                        } status={applyStatus} />
                    </ButtonRow>
                ) : ""
            }
            <h5 style={{ marginTop: "8px" }}>{t("group.danger.deleteInfo0")}<br />{t("group.danger.deleteInfo1")}</h5>
            <ButtonRow>
                <ButtonLink style={{ color: "#FF7575"}} name={t("group.danger.delete")} to={`/group/${props.gid}/delete/`} disabled={!allowedTo} />
            </ButtonRow>
        </>
    );
}

export function AddGroupOwner(props) {
    var gid = props.gid;

    const [nickname, setNickname] = useState("");
    const [uid, setUid] = useState("");
    const { t } = useTranslation();

    const queryClient = useQueryClient();


    const AddGroupOwnerExecute = useMutation(
        variables => OperationsApi.addGroupOwner(variables),
        {
            // When mutate is called:
            onMutate: async ({ gid, uid, nickname }) => {

                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('groupId' + gid)
                // Snapshot the previous value
                const previousGroup = queryClient.getQueryData('groupId' + gid)
                // Optimistically update to the new value
                const UTCNow = new Date(Date.now()).toUTCString();
                
                queryClient.setQueryData('groupId' + gid, old => {
                    old.data[0].owners.push({ id: uid, name: nickname, addedAt: UTCNow });
                    old.data[0].admins.push({ id: uid, name: nickname, addedAt: UTCNow });
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousGroup, gid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                queryClient.setQueryData('groupId' + context.gid, context.previousGroup)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('groupId' + context.gid)
            },
        }
    );

    const history = useHistory();

    return (
        <>

            <h2>{t("group.owners.addNew")}</h2>
            <TextInput name={t("group.addMenu.nickname")} callback={(e)=>setNickname(e.target.value)}/>
            <TextInput name={t("group.addMenu.id")} callback={(e) => setUid(e.target.value) }/>
            <ButtonRow>
                <Button name={t("group.owners.add")} callback={() => { AddGroupOwnerExecute.mutate({ gid, uid, nickname }); props.callback();  }} />
            </ButtonRow>

        </>
    );

}

export function AddGroupAdmin(props) {
    var gid = props.gid;

    const [addAdminState, changeState] = useState({ uid: "", nickname: "", canAdd: false });
    const { t } = useTranslation();

    const queryClient = useQueryClient();


    const AddGroupAdminExecute = useMutation(
        variables => OperationsApi.addGroupAdmin(variables),
        {
            // When mutate is called:
            onMutate: async ({ gid, uid, nickname }) => {

                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('groupId' + gid)
                // Snapshot the previous value
                const previousGroup = queryClient.getQueryData('groupId' + gid)
                // Optimistically update to the new value
                const UTCNow = new Date(Date.now()).toUTCString();

                queryClient.setQueryData('groupId' + gid, old => {
                    old.data[0].admins.push({ id: uid, name: nickname, addedAt: UTCNow });
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousGroup, gid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                queryClient.setQueryData('groupId' + context.gid, context.previousGroup)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('groupId' + context.gid)
            },
        }
    );

    const updateState = (values) => {
        var newState = {
            ...addAdminState,
            ...values
        };
        newState.canAdd = newState.uid !== "";
        changeState(newState);
    }

    const history = useHistory();

    return (
        <>
            <h2>{t("group.admins.addNew")}</h2>
            <TextInput name={t("group.addMenu.nickname")} callback={(e) => updateState({nickname: e.target.value}) } />
            <TextInput name={t("group.addMenu.id")} callback={(e) => updateState({uid: e.target.value}) } />
            <ButtonRow>
                <Button name={t("group.admins.add")} disabled={!addAdminState.canAdd} callback={() => { AddGroupAdminExecute.mutate({ gid, uid: addAdminState.uid, nickname: addAdminState.nickname }); props.callback(); }} />
            </ButtonRow>
        </>
    );

}


export function AddGroup(props) {

    const [addGroupState, changeState] = useState({
        variables: {
            groupName: "",
            discordId: "",
            adminRole: "",
            modRole: "",
            remid: "",
            sid: "",
        },
        roleDisplay: false,
        canAdd: false
    });
    const { t } = useTranslation();

    const [applyStatus, setApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    const queryClient = useQueryClient();
    const history = useHistory();

    const AddNewGroupExecute = useMutation(
        variables => OperationsApi.addGroup(variables),
        {
            onMutate: async (variables) => {
                setApplyStatus(true);
                await queryClient.cancelQueries('devGroups');
                return {}
            },
            onSuccess: async () => {
                setApplyStatus(null);
                history.push("/");
            },
            onError: async (error) => {
                setError(error);
                setApplyStatus(false);
                setTimeout(_ => setApplyStatus(null), 2000);
            },
            onSettled: async () => {
                queryClient.refetchQueries('devGroups');
            }
        }
    );

    const checkInputVariables = (newVariables) => {
        var newGroupState = {
            ...addGroupState,
            variables: {
                ...addGroupState.variables,
                ...newVariables
            }
        };
        let newVars = newGroupState.variables;
        newGroupState.roleDisplay = (newVars.discordId !== "");
        newGroupState.canAdd =
            (newVars.remid.length > 1) && (newVars.sid.length > 1) && (newVars.groupName.length > 2);
        changeState(newGroupState);
    };

    return (
        <Row>
            <Column>
                <Header>
                    <h2>{t("createGroup.main")}</h2>
                    
                </Header>
                <Card>
                    <h5>{t("createGroup.description")}</h5>
                    <TextInput name={t("group.name")} callback={(e) => { checkInputVariables({ groupName: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        {t("createGroup.discordDescription")}
                    </h5>
                    <TextInput name={t("discord.id")} callback={(e) => { checkInputVariables({ discordId: e.target.value }) }} />
                    <TextInput name={t("discord.modId")} disabled={!addGroupState.roleDisplay} callback={(e) => { checkInputVariables({ modRole: e.target.value }) }} />
                    <TextInput name={t("discord.adminId")} disabled={!addGroupState.roleDisplay} callback={(e) => { checkInputVariables({ adminRole: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        {t("createGroup.cookieDescription0")}<br />
                        {t("createGroup.cookieDescription1")}<br />
                        {t("createGroup.cookieDescription2")}<br />
                    </h5>
                    <h5 style={{ marginTop: "8px" }}>
                        {t("cookie.sidDescription")}<i>accounts.ea.com</i>
                    </h5>
                    <TextInput name={t("cookie.sid")} type="password" callback={(e) => { checkInputVariables({ sid: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        {t("cookie.remidDescription")}<i>accounts.ea.com</i>
                    </h5>
                    <TextInput name={t("cookie.remid")} type="password" callback={(e) => { checkInputVariables({ remid: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                    {t("createGroup.acceptDescription0")}<br />{t("createGroup.acceptDescription1")}
                    </h5>
                    <ButtonRow>
                        <Button name={t("createGroup.accept")} disabled={!addGroupState.canAdd || applyStatus !== null} status={applyStatus} callback={() => AddNewGroupExecute.mutate(addGroupState.variables)} />
                        <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (applyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
                    </ButtonRow>
                </Card>
            </Column>
        </Row>
    );
}

export function DeleteGroup(props) {

    var thisGid = props.match.params.gid;

    const queryClient = useQueryClient();
    const history = useHistory();
    const { t } = useTranslation();

    const DeleteGroupExecute = useMutation(
        variables => OperationsApi.removeGroup(variables),
        {
            // When mutate is called:
            onMutate: async ({ gid }) => {
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('devGroups')
                // Snapshot the previous value
                const previousGroups = queryClient.getQueryData('devGroups')
                // Optimistically update to the new value
                queryClient.setQueryData('devGroups', old => {
                    if (old) {
                        old.data = old.data.filter(group => group.id !== gid);
                    }
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousGroups, gid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                queryClient.setQueryData('devGroups', context.previousGroups)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('devGroups')
            },
        }
    );

    return (
        <Row>
            <Column>
                <Header>
                    <h2>{t("group.danger.delete")}</h2>
                </Header>
                <Card>
                    <h2>{t("group.danger.main")}</h2>
                    <p>{t("group.danger.check")}</p>
                    <ButtonRow>
                        <ButtonLink name={t("group.danger.back")} to={"/group/" + thisGid} />
                        <Button name={t("group.danger.confirm")} callback={() => { DeleteGroupExecute.mutate({ gid: thisGid }); history.push("/dev/"); }} />
                    </ButtonRow>
                </Card>
            </Column>
        </Row>
    );
}

export function AddGroupServer(props) {
    var gid = props.match.params.gid;

    var name = "", alias = "";

    const queryClient = useQueryClient();
    const { t } = useTranslation();


    const AddGroupServerExecute = useMutation(
        variables => OperationsApi.addGroupServer(variables),
        {
            // When mutate is called:
            onMutate: async({ gid, name, alias }) => {

                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('groupId' + gid)
                // Snapshot the previous value
                const previousGroup = queryClient.getQueryData('groupId' + gid)
                // Optimistically update to the new value
                const UTCNow = new Date(Date.now()).toUTCString();

                queryClient.setQueryData('groupId' + gid, old => {
                    old.data[0].servers.push({
                        "addedAt": UTCNow,
                        "id": null,
                        "name": name
                    });
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousGroup, gid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                queryClient.setQueryData('groupId' + context.gid, context.previousGroup)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('groupId' + context.gid)
            },
        }
    );

    const history = useHistory();

    return (
        <Row>
            <Column>
                <Header>
                    <h2>{t("group.serverAddMenu.main")}</h2>
                </Header>
                <Card>
                    <h2>{t("group.serverAddMenu.description")}</h2>
                    <TextInput name={t("group.serverAddMenu.name")} callback={(e) => { name = e.target.value }} />
                    <TextInput name={t("group.serverAddMenu.alias")} callback={(e) => { alias = e.target.value; }} />
                    <ButtonRow>
                        <Button name={t("group.servers.add")} callback={() => { AddGroupServerExecute.mutate({ gid, alias, name }); history.push("/group/" + gid); }} />
                    </ButtonRow>
                </Card>
            </Column>
        </Row>
    );

}


export function EditGroup(props) {
    return (<></>);
}

export function MakeOps(props) {
   
    const [addGroupState, changeState] = useState({
        variables: {
            server: "",
            remid: "",
            sid: "",
        },
        canAdd: false
    });

    const [applyStatus, setApplyStatus] = useState(null);
    const [errorUpdating, setError] = useState({ code: 0, message: "Unknown" });
    const queryClient = useQueryClient();
    const history = useHistory();
    const { t } = useTranslation();

    const SetupOperations = useMutation(
        variables => OperationsApi.setupOps(variables),
        {
            onMutate: async (variables) => {
                setApplyStatus(true);
                return {}
            },
            onSuccess: async () => {
                setApplyStatus(null);
            },
            onError: async (error) => {
                setError(error);
                setApplyStatus(false);
                setTimeout(_ => setApplyStatus(null), 2000);
            },
            onSettled: async () => {
            }
        }
    );

    const checkInputVariables = (newVariables) => {
        var newGroupState = {
            ...addGroupState,
            variables: {
                ...addGroupState.variables,
                ...newVariables
            }
        };
        let newVars = newGroupState.variables;
        newGroupState.canAdd =
            (newVars.remid.length > 1) && (newVars.sid.length > 1) && (newVars.server.length > 1);
        changeState(newGroupState);
    };

    return (
        <Row>
            <Column>
                <Header>
                    <h2>{t("operations.main")}</h2>
                </Header>
                <Card>
                    <h5>
                        {t("operations.description0")}<br />
                        {t("operations.description1")}<br /> 
                        {t("operations.description2")}
                    </h5>
                    <TextInput name="Server name" callback={(e) => { checkInputVariables({ server: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        {t("operations.server")}<b>{t("operations.owner")}</b>{t("operations.cookies")}
                    </h5>
                    <h5 style={{ marginTop: "8px" }}>
                        {t("cookie.sidDescription")}<i>accounts.ea.com</i>
                    </h5>
                    <TextInput name={t("cookie.sid")} type="password" callback={(e) => { checkInputVariables({ sid: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        {t("cookie.remidDescription")}<i>accounts.ea.com</i>
                    </h5>
                    <TextInput name={t("cookie.remid")} type="password" callback={(e) => { checkInputVariables({ remid: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        {t("operations.acceptDescription0")}<br />{t("operations.acceptDescription1")}
                    </h5>
                    <ButtonRow>
                        <Button name={t("operations.accept")} disabled={!addGroupState.canAdd || applyStatus !== null} status={applyStatus} callback={() => SetupOperations.mutate(addGroupState.variables)} />
                        <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (applyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
                    </ButtonRow>
                </Card>
            </Column>
        </Row>
    );
}