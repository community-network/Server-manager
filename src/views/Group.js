import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Redirect, useHistory } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, ButtonLink, ButtonRow, Button, UserStRow, Row, ServerRow, FakeUserStRow, TextInput, SmallButton, PageCard } from "../components";




export function Group(props) {

    var gid = props.match.params.gid;

    const queryClient = useQueryClient();

    const { error: groupError, data: groups } = useQuery('groupId' + gid, () => OperationsApi.getGroup(gid), { staleTime: 30000 });
    const { error: userError, data: user } = useQuery('user', () => OperationsApi.user);

    const deleteIcon = (
        <svg viewBox="0 0 24 24" style={{ width: '16px' }}>
            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
        </svg>
    );

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
    }

    const catSettings = {
        account: <GroupServerAccount gid={gid} user={user} group={group} />,
        discord: "",
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

    if (groups) {
        var group = groups.data[0];
        if (group) {

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
                    {groupCard}
                </Column>
            </Row>
        </>
    );


}

function GroupAdmins(props) {

    var hasRights = false;

    if (props.group && props.user) hasRights = props.group.isOwner || props.user.auth.isDeveloper;

    const fakeListing = [1, 1, 1];

    return <>
        <h5>Admin role can manage servers. You need to have at least <br />Owner role to add new admins.</h5>
        {
            (props.group) ? (
                props.group.admins.map((admin, i) => (
                    <UserStRow user={admin} key={i} button={
                        <SmallButton
                            name="Delete"
                            disabled={!hasRights}
                            content={deleteIcon}
                            vars={{ gid: props.gid, uid: admin.id }}
                            callback={props.onDelete.mutate} />
                    } />
                ))
            ) : (
                fakeListing.map((_, i) => <FakeUserStRow key={i} />)
            )
        }
        <ButtonRow>
            {
                (hasRights) ? (
                    <ButtonLink name="Add Admin" to={"/group/" + props.gid + "/add/admin"} />
                ) : (
                    <Button disabled={true} name="Not allowed" content="Add Admin" />
                )
            }
        </ButtonRow>
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

    var hasRights = false;
        return "Loading.."
    if (props.group && props.user) hasRights = props.group.isOwner || props.user.auth.isDeveloper;

    const fakeListing = [1, 1, 1];

    return <>
        <h5>List of current group Owners. This role can add new Servers, <br />Admins and other owners. Be carefull with it!</h5>
        {
            (props.group) ? (
                props.group.owners.map((owner, i) => (
                    <UserStRow user={owner} key={i} button={
                        <SmallButton
                            name="Delete"
                            content={deleteIcon}
                            disabled={!hasRights}
                            vars={{ gid: props.gid, uid: owner.id }}
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
                    <ButtonLink name="Add Owner" to={"/group/" + props.gid + "/add/owner"} />
                ) : (
                    <Button disabled={true} name="Not allowed" content="Add Owner" />
                )
            }
        </ButtonRow>
    </>;
}
    </>;
}


function GroupServerAccount(props) {
    var allowedTo = false;
    if (props.group && props.user) allowedTo = props.group.isOwner || props.user.auth.isDeveloper;

    const [sid, setSid] = useState("");
    const [remid, setRemid] = useState("");

    useEffect(() => {
        if (props.group) {
            if (remid !== props.group.cookie.remid)
                setRemid(props.group.cookie.remid);
            if (sid !== props.group.cookie.sid)
                setSid(props.group.cookie.sid);
        } 
    }, [props.group]);

    return (
        <>
            <p style={{ marginTop: "8px" }}>
                Account manager, that will administrate your servers.
            </p>

            <Row>
                <TextInput type="password" disabled={!allowedTo} callback={(e) => setRemid(e.target.value)} defaultValue={remid} name={"Remid"} />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    Session cookies
                </p>
            </Row>
            <Row>
                <TextInput type="password" disabled={!allowedTo} callback={(e) => setSid(e.target.value)} defaultValue={sid} name={"Sid"} />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    Reminder session cookies
                </p>
            </Row>
            {
                (props.group && (sid !== props.group.cookie.sid || remid !== props.group.cookie.remid)) ? (
                    <ButtonRow>
                        <Button name="Apply" disabled={!allowedTo} />
                    </ButtonRow>
                ): ""
            }
        </>
    );
}

function GroupDangerZone(props) {

    var allowedTo = false;
    if (props.group && props.user) allowedTo = props.group.isOwner || props.user.auth.isDeveloper;

    return (
        <>
            <p>Once you delete a group, it will remove all the servers,<br /> server account and users used in it.</p>
            <ButtonRow>
                <ButtonLink name="Delete Group" to={`/group/${props.gid}/delete/`} disabled={!allowedTo} />
            </ButtonRow>
        </>
    );
}

export function AddGroupOwner(props) {
    var gid = props.match.params.gid;

    var nickname = "", uid = "";

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
        <Row>
            <Column>
                <Header>
                    <h2>Add new Owner</h2>
                </Header>
                <Card>
                    <h2>Group Owner</h2>
                    <TextInput name="Nickname (any, will be auto-updated)" callback={(e)=>{nickname=e.target.value}}/>
                    <TextInput name="Discord UID" callback={(e) => { uid = e.target.value; }}/>
                    <ButtonRow>
                        <Button name="Add Owner" callback={() => { AddGroupOwnerExecute.mutate({ gid, uid, nickname }); history.push("/group/" + gid);  }} />
                    </ButtonRow>
                </Card>
            </Column>
        </Row>
    );

}

export function AddGroupAdmin(props) {
    var gid = props.match.params.gid;

    const [addAdminState, changeState] = useState({ uid: "", nickname: "", canAdd: false });

    var nickname = "", uid = "";

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
        <Row>
            <Column>
                <Header>
                    <h2>Add new Admin</h2>
                </Header>
                <Card>
                    <h2>Group Admin</h2>
                    <TextInput name="Nickname (any, will be auto-updated)" callback={(e) => updateState({nickname: e.target.value}) } />
                    <TextInput name="Discord UID" callback={(e) => updateState({uid: e.target.value}) } />
                    <ButtonRow>
                        <Button name="Add Admin" disabled={!addAdminState.canAdd} callback={() => { AddGroupAdminExecute.mutate({ gid, uid: addAdminState.uid, nickname: addAdminState.nickname }); history.push("/group/" + gid); }} />
                    </ButtonRow>
                </Card>
            </Column>
        </Row>
    );

}


export function AddGroup(props) {

    var groupName = "", discordId = "", staffRole = "";

    const [addGroupState, changeState] = useState({
        variables: {
            groupName: "",
            discordId: "",
            adminRole: "",
            modRole: ""
        },
        roleDisplay: false,
        canAdd: false
    });

    const queryClient = useQueryClient();
    const history = useHistory();

    const AddNewGroupExecute = useMutation(
        variables => OperationsApi.addGroup(variables),
        {
            onMutate: async (variables) => {
                await queryClient.cancelQueries('devGroups');
                return {}
            },
            onSettled: (data, error, variables, context) => {
                queryClient.refetchQueries('devGroups');
            },
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
            (newVars.groupName !== "") && (newVars.remid !== "") && (newVars.sid !== "");
        changeState(newGroupState);
    };

    return (
        <Row>
            <Column>
                <Header>
                    <h2>Create new Group</h2>
                </Header>
                <Card>
                    <h2>Group info</h2>
                    <p style={{ marginBottom: "8px" }}>
                        Create a new group to manage your community servers.<br />
                        <i>NOTE: This tools are in opened Beta test</i>
                    </p>
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
                        <Button name="Create group" disabled={!addGroupState.canAdd} callback={() => { AddNewGroupExecute.mutate(addGroupState.variables); history.push("/dev/"); }} />
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