import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Redirect, useHistory } from 'react-router-dom';
import { OperationsApi } from "../api";
import { useModal, GroupLogs, VBanList, GameStatsAd, Column, Card, Header, ButtonLink, ButtonRow, Button, UserStRow, Row, ServerRow, FakeUserStRow, TextInput, SmallButton, PageCard } from "../components";


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
            name: "Servers",
            callback: () => setListing("servers"),
        },
        {
            name: "Admins",
            callback: () => setListing("admins"),
        },
        {
            name: "Owners",
            callback: () => setListing("owners"),
        },
        {
            name: "VBan list",
            callback: () => setListing("vbanlist"),
        },
        {
            name: "Group logs",
            callback: () => setListing("grouplogs"),
        }
    ]

    const settingsCycle = [
        {
            name: "Server account",
            callback: () => setSettingsListing("account"),
        },
        {
            name: "Discord integration",
            callback: () => setSettingsListing("discord"),
        },
        {
            name: "Danger zone",
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
                        <h2>Group</h2>
                    </Header>
                </Column>
            </Row>
            <Row>
                <Column>
                    <Card>
                        <h2>Group name - {(group) ? group.groupName : "pending.."}</h2>
                        <p style={{ marginBottom: 0 }}>Identity {gid}</p>
                    </Card>
                </Column>
            </Row>
            <Row>
                <Column>
                    <PageCard buttons={settingsCycle} >
                        {catSettings[settingsListing]}
                    </PageCard>
                </Column>
            </Row>
            <Row>
                <Column>
                    <PageCard buttons={pageCycle} >
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
        <h5>Admin role can manage servers. You need to have at least <br />Owner role to add new admins.</h5>
        {
            (isSelected) ? (<h5><b>You selected {selected.length} admins.</b></h5>) : (<h5>Select admins to remove them.</h5>)
        }
        <ButtonRow>
            {
                (hasRights) ? (
                    <Button name="Add Admin" callback={() => modal.show(<AddGroupAdmin gid={props.group.id} callback={modal.close} />)} />
                ) : (
                    <Button disabled={true} name="Not allowed" content="Add Admin" />
                )
            }
            {
                (hasRights && isSelected) ? (
                    <Button name="Remove Selected Admins" callback={removeAdmins} />
                ) : (
                    <Button disabled={true} name="Remove admins" />
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

    return <>
        <h5>Servers instances added to current group. You need to have <br />Owner role in order to add new servers.</h5>
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
                    <ButtonLink name="Add Server" to={"/group/" + props.gid + "/add/server"} />
                ) : (
                    <Button disabled={true} name="Not allowed" content="Add Server" />
                )
            }
        </ButtonRow>
    </>;
}

function GroupOwners(props) {

    const modal = useModal();
    const [selected, setSelected] = useState([]);

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
        <h5>List of current group Owners. This role can add new Servers, <br />Admins and other owners. Be carefull with it!</h5>
        {
            (isSelected) ? (<h5><b>You selected {selected.length} owners.</b></h5>) : (<h5>Select owners to remove them.</h5>)
        }
        <ButtonRow>
            {
                (hasRights) ? (
                    <Button name="Add Owner" callback={() => modal.show(<AddGroupOwner gid={props.group.id} callback={modal.close} />)} />
                ) : (
                    <Button disabled={true} name="Not allowed" content="Add Owner" />
                )
            }
            {
                (hasRights && isSelected) ? (
                    <Button name="Remove Owners" callback={removeOwners} />
                ) : (
                    <Button disabled={true} name="Select Owners to remove" />
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
                Account manager, that will administrate your servers.<br />
                These cookies can be found at <i>accounts.ea.com</i>
            </h5>
            {(props.group && !props.group.validCookie) ? (
                <p style={{ marginTop: "0px", border: "1px solid var(--color-second)", padding: "10px 22px", borderRadius: "8px", color: "#FF7575", background: "var(--color-container-v2)" }}>
                    Error: The cookies you are using right now are invalid!
                </p>
            ) : ""}
            
            <Row>
                <TextInput type="password" disabled={!allowedTo} callback={(e) => setRemid(e.target.value)} defaultValue={remid} name={"Remid"} />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    Reminder cookies
                </p>
            </Row>
            <Row>
                <TextInput type="password" disabled={!allowedTo} callback={(e) => setSid(e.target.value)} defaultValue={sid} name={"Sid"} />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    Session cookies
                </p>
            </Row>
            {
                (props.group && (sid !== props.group.cookie.sid || remid !== props.group.cookie.remid)) ? (
                    <ButtonRow>
                        <Button name="Apply" disabled={!allowedTo || applyStatus !== null} callback={
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
                With our bot, you can allow admins to controll your servers<br /> by using commands with ! prefix. 
            </h5>
            <Row>
                <TextInput disabled={!allowedTo} callback={(e) => setServerId(e.target.value)} defaultValue={serverId} name={"Discord Server"} />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    Your server Discord ID
                </p>
            </Row>
            <h5 style={{ marginTop: "8px" }}>
                Every person with that role id can use<br /> discord commands to contol the server.
            </h5>
            <Row>
                <TextInput disabled={!allowedTo} callback={(e) => setAdminId(e.target.value)} defaultValue={adminId} name={"Admin Discord ID"} />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    Id of Admin role
                </p>
            </Row>
            <Row>
                <TextInput disabled={!allowedTo} callback={(e) => setModId(e.target.value)} defaultValue={modId} name={"Mod DIscord ID"} />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    Id of Moderator role, moderators can only kick players
                </p>
            </Row>
            {
                (props.group && (serverId !== props.group.discordGroupId || modId !== props.group.discordModRoleId || adminId !== props.group.discordAdminRoleId)) ? (
                    <ButtonRow>
                        <Button name="Apply" disabled={!allowedTo || applyStatus !== null} callback={
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
            <h5 style={{ marginTop: "0px" }}>You can change the name of current Group.</h5>
            <TextInput disabled={!allowedTo} callback={(e) => setGroupName(e.target.value)} defaultValue={groupName} name={"Group name"} />
            {
                (props.group && (groupName !== props.group.groupName)) ? (
                    <ButtonRow>
                        <Button name="Apply changes" disabled={!allowedTo || applyStatus !== null} callback={
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
            <h5 style={{ marginTop: "8px" }}>Once you delete a group, it will remove all the servers,<br /> server account and users used in it.</h5>
            <ButtonRow>
                <ButtonLink style={{ color: "#FF7575"}} name="Delete Group" to={`/group/${props.gid}/delete/`} disabled={!allowedTo} />
            </ButtonRow>
        </>
    );
}

export function AddGroupOwner(props) {
    var gid = props.gid;

    const [nickname, setNickname] = useState("");
    const [uid, setUid] = useState("");

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

            <h2>Add new Owner</h2>
            <TextInput name="Nickname (any, will be auto-updated)" callback={(e)=>setNickname(e.target.value)}/>
            <TextInput name="Discord UID" callback={(e) => setUid(e.target.value) }/>
            <ButtonRow>
                <Button name="Add Owner" callback={() => { AddGroupOwnerExecute.mutate({ gid, uid, nickname }); props.callback();  }} />
            </ButtonRow>

        </>
    );

}

export function AddGroupAdmin(props) {
    var gid = props.gid;

    const [addAdminState, changeState] = useState({ uid: "", nickname: "", canAdd: false });

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
            <h2>Add new Admin</h2>
            <TextInput name="Nickname (any, will be auto-updated)" callback={(e) => updateState({nickname: e.target.value}) } />
            <TextInput name="Discord UID" callback={(e) => updateState({uid: e.target.value}) } />
            <ButtonRow>
                <Button name="Add Admin" disabled={!addAdminState.canAdd} callback={() => { AddGroupAdminExecute.mutate({ gid, uid: addAdminState.uid, nickname: addAdminState.nickname }); props.callback(); }} />
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
                    <h2>Create new Group</h2>
                    
                </Header>
                <Card>
                    <h5>Create a new group to manage your community servers</h5>
                    {/*<h2>Create a new group to manage your community servers</h2>*/}
                    <TextInput name="Name" callback={(e) => { checkInputVariables({ groupName: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        Optionaly, you can add your discord server, to integrate server tools
                    </h5>
                    <TextInput name="Discord Server ID" callback={(e) => { checkInputVariables({ discordId: e.target.value }) }} />
                    <TextInput name="Mod role ID" disabled={!addGroupState.roleDisplay} callback={(e) => { checkInputVariables({ modRole: e.target.value }) }} />
                    <TextInput name="Admin role ID" disabled={!addGroupState.roleDisplay} callback={(e) => { checkInputVariables({ adminRole: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        Every group need to be assigned special account with certain requirments: <br />
                        It should be a BF1 server moderator (owner access not required)<br />
                        This account shouldn't be used anywhere else, otherwise it will lead in errors<br />
                    </h5>
                    <h5 style={{ marginTop: "8px" }}>
                        Session cookies can be found at <i>accounts.ea.com</i>
                    </h5>
                    <TextInput name="SID cookie" type="password" callback={(e) => { checkInputVariables({ sid: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        Reminder session cookies can be found at <i>accounts.ea.com</i>
                    </h5>
                    <TextInput name="REMID cookie" type="password" callback={(e) => { checkInputVariables({ remid: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        By pressing this button, you agree to give <br />server manager tool access to the account.
                    </h5>
                    <ButtonRow>
                        <Button name="Create group" disabled={!addGroupState.canAdd || applyStatus !== null} status={applyStatus} callback={() => AddNewGroupExecute.mutate(addGroupState.variables)} />
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
                    <h2>Delete Group</h2>
                </Header>
                <Card>
                    <h2>Danger zone</h2>
                    <p>Are you sure you want to delete this group?</p>
                    <ButtonRow>
                        <ButtonLink name="Oh, no!" to={"/group/" + thisGid} />
                        <Button name="Yes, delete" callback={() => { DeleteGroupExecute.mutate({ gid: thisGid }); history.push("/dev/"); }} />
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
                    <h2>Add new Server</h2>
                </Header>
                <Card>
                    <h2>Group Server</h2>
                    <TextInput name="Server name" callback={(e) => { name = e.target.value }} />
                    <TextInput name="Alias (optional)" callback={(e) => { alias = e.target.value; }} />
                    <ButtonRow>
                        <Button name="Add Server" callback={() => { AddGroupServerExecute.mutate({ gid, alias, name }); history.push("/group/" + gid); }} />
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
                    <h2>Setup Operations Gamemode</h2>
                </Header>
                <Card>
                    <h5>
                        Setup operations gamemode on your server. <br />Note, that you will lose in-game admin panel!<br /> 
                        Make sure to add server into this pannel and check it.
                    </h5>
                    <TextInput name="Server name" callback={(e) => { checkInputVariables({ server: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        Server <b>owner</b> cookies.
                    </h5>
                    <h5 style={{ marginTop: "8px" }}>
                        Session cookies can be found at <i>accounts.ea.com</i>
                    </h5>
                    <TextInput name="SID cookie" type="password" callback={(e) => { checkInputVariables({ sid: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        Reminder session cookies can be found at <i>accounts.ea.com</i>
                    </h5>
                    <TextInput name="REMID cookie" type="password" callback={(e) => { checkInputVariables({ remid: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        By pressing this button, you agree to give <br />server manager tool access to the account.
                    </h5>
                    <ButtonRow>
                        <Button name="Make Operations" disabled={!addGroupState.canAdd || applyStatus !== null} status={applyStatus} callback={() => SetupOperations.mutate(addGroupState.variables)} />
                        <h5 style={{ marginBottom: 0, alignSelf: "center", opacity: (applyStatus === false) ? 1 : 0 }}>Error {errorUpdating.code}: {errorUpdating.message}</h5>
                    </ButtonRow>
                </Card>
            </Column>
        </Row>
    );
}