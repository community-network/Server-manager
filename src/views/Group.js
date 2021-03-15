import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Redirect, useHistory } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, ButtonLink, ButtonRow, Button, UserStRow, Row, ServerRow, Grow, TextInput, SmallButton } from "../components";




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

    if (groupError || userError) {
        return <Redirect to="/" />;
    }

    var groupCard = "", addOwner = "", ownerList = [], adminList = [], serverList = [];

    if (groups) {
        var group = groups.data[0];
        if (group) {

            for (var i in group.servers) {
                var server = group.servers[i];
                serverList.push(
                    <ServerRow server={server} key={i} button={
                        <SmallButton
                            name="Delete"
                            content={deleteIcon}
                            vars={{ gid, sid: server.id }}
                            callback={removeServer.mutate}
                        />
                    } />
                );


            }

            groupCard = (
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
                            <Grow>Admin role:</Grow> { group.discordAdminRoleId }
                        </Row>
                    </p>
                    <ButtonRow>
                        <ButtonLink name="Edit" to={"/group/" + gid + "/edit/"} />
                        <ButtonLink name="Delete" to={"/group/" + gid + "/delete/"} />
                    </ButtonRow>
                </Card>
            );

            for (var i in group.owners) {
                var owner = group.owners[i];
                ownerList.push(
                    <UserStRow user={owner} key={i} button={
                        <SmallButton
                            name="Delete"
                            content={deleteIcon}
                            vars={{ gid, uid: owner.id }}
                            callback={removeOwner.mutate}
                        />
                    } />
                );
            }

            for (var i in group.admins) {   
                var admin = group.admins[i];
                adminList.push(
                    <UserStRow user={admin} key={i} button={
                        <SmallButton
                            name="Delete"
                            content={deleteIcon}
                            vars={{ gid, uid: group.admins[i].id }}
                            callback={removeAdmin.mutate} />
                    } />
                );
            }
            
        } else {
            groupCard = (
                <Card>
                    <h2>Group not found!</h2>
                </Card>
            );
        }
    }

    if (user) {
        if (user.auth.isDeveloper) {
            addOwner = <ButtonRow><ButtonLink name="Add Owner" to={"/group/" + gid + "/add/owner"} /></ButtonRow>;
		}
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
                    {groupCard}
                </Column>
            </Row>
            <Row>
                <Column>
                    <Card>
                        <h2>Owners</h2>
                        {ownerList}
                        {addOwner}
                    </Card>
                    <Card>
                        <h2>Admins</h2>
                        {adminList}
                        <ButtonRow>
                            <ButtonLink name="Add Admin" to={"/group/" + gid + "/add/admin"} />
                        </ButtonRow>
                    </Card>
                </Column>
                <Column>
                    <Card>
                        <h2>Servers</h2>
                        {serverList}
                        <ButtonRow>
                            <ButtonLink name="Add Server" to={"/group/" + gid + "/add/server"} />
                        </ButtonRow>
                    </Card>
                </Column>
            </Row>
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