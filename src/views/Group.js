import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Redirect, useHistory } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, ButtonLink, ButtonRow, Button, UserStRow, Row, ServerRow, Grow, TextInput, SmallButton, PageCard } from "../components";


const deleteIcon = (
    <svg viewBox="0 0 24 24" style={{ width: '16px' }}>
        <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
    </svg>
);

export function Group(props) {

    var gid = props.match.params.gid;

    const queryClient = useQueryClient();
    

    const { isError: groupError, data: groups } = useQuery('groupId' + gid, () => OperationsApi.getGroup(gid), { staleTime: 30000 });
    const { isError: userError, data: user } = useQuery('user', () => OperationsApi.user);


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

    const catListing = {
        owners: <GroupOwners group={group} user={user} gid={gid} onDelete={removeOwner} />,
        admins: <GroupAdmins group={group} user={user} gid={gid} onDelete={removeAdmin} />,
        servers: <GroupServers group={group} user={user} gid={gid} onDelete={removeServer} />,
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

    ];

    if (groupError || userError) {
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
                    {(group) ? (
                        <Card>
                            <h2>{group.groupName}</h2>
                            <p>
                                <Row>
                                    <Grow>Discord ID:</Grow> {group.discordGroupId}<br />
                                </Row>
                                <Row>
                                    <Grow>Moderator role:</Grow> {group.discordModRoleId}<br />
                                </Row>
                                <Row>
                                    <Grow>Admin role:</Grow> {group.discordAdminRoleId}
                                </Row>
                            </p>
                            <ButtonRow>
                                <ButtonLink name="Edit" to={"/group/" + gid + "/edit/"} />
                                <ButtonLink name="Delete" to={"/group/" + gid + "/delete/"} />
                            </ButtonRow>
                        </Card>
                    ) : (
                        <Card>
                            <h2>Group not found!</h2>
                        </Card>
                    )}
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

    if (!props.group || !props.user) {
        return "Loading.."
    }

    const hasRights = props.user.auth.isOwner;

    return <>
        <h5>Admin role can manage servers. You need to have at least <br />Owner role to add new admins.</h5>
        {
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

    if (!props.group || !props.user) {
        return "Loading.."
    }

    const hasRights = props.user.auth.isOwner || props.user.auth.isDeveloper;

    return <>
        <h5>Servers instances added to current group. You need to have <br />Owner role in order to add new servers.</h5>
        {
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

    if (!props.group || !props.user) {
        return "Loading.."
    }

    const hasRights = props.user.auth.isOwner || props.user.auth.isDeveloper;

    return <>
        <h5>List of current group Owners. This role can add new Servers, <br />Admins and other owners. Be carefull with it!</h5>
        {
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
                    <TextInput name="Name" callback={(e) => { checkInputVariables({ groupName: e.target.value }) }} />
                    <TextInput name="Discord Server ID" callback={(e) => { checkInputVariables({ discordId: e.target.value }) }} />
                    <TextInput name="Mod role ID" disabled={!addGroupState.roleDisplay} callback={(e) => { checkInputVariables({ modRole: e.target.value }) }} />
                    <TextInput name="Admin role ID" disabled={!addGroupState.roleDisplay} callback={(e) => { checkInputVariables({ adminRole: e.target.value }) }} />
                    <TextInput name="SID cookie" type="password" callback={(e) => { checkInputVariables({ sid: e.target.value }) }} />
                    <TextInput name="REMID cookie" type="password" callback={(e) => { checkInputVariables({ remid: e.target.value }) }} />
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