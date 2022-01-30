import React, { useState, useEffect } from "react";
import { useMeasure } from 'react-use';
import cryptoRandomString from 'crypto-random-string';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Redirect, useHistory } from 'react-router-dom';
import { OperationsApi } from "../api";
import { statusOnlyGames } from "../Globals";

import styles from "./Group.module.css";
import { StatsPieChart, PlayerInfo } from "./Charts";
import { ServerRow, GameStatsAd, VBanList, GroupLogs, WorkerStatus, SeederStRow, SeederStCustom, EmptyRow, SeederRow, KeepAliveRow } from "./Group";

import { Switch, useModal, Column, Card, Header, ButtonLink, ButtonRow, Button, UserStRow, Row, FakeUserStRow, TextInput, ScrollRow, PageCard, ButtonUrl } from "../components";
import { ChangeAccountModal, AddAccountModal } from "./Modals";
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
        servers: <GroupServers group={group} user={user} gid={gid} />,
        vbanlist: <VBanList user={user} gid={gid} />,
        grouplogs: <GroupLogs gid={gid} />,
        seeding: <Seeding group={group} user={user} gid={gid} />,
    }


    const catSettings = {
        account: <GroupServerAccount gid={gid} user={user} group={group} />,
        discord: <GroupDiscordSettings gid={gid} user={user} group={group} />,
        settings: <GroupSettings gid={gid} user={user} group={group} />,
        status: <GroupStatus gid={gid} user={user} group={group} />,
        danger: <GroupDangerZone gid={gid} user={user} group={group} />,
    }

    let pageCycle = [
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
            name: (
                <>
                    {t("group.seeding.main")}
                    <svg style={{ marginLeft: "10px", height: "16px", color: "var(--color-text)" }} viewBox="0 0 24 24">
                        <path fill="currentColor" d="M7,11H1V13H7V11M9.17,7.76L7.05,5.64L5.64,7.05L7.76,9.17L9.17,7.76M13,1H11V7H13V1M18.36,7.05L16.95,5.64L14.83,7.76L16.24,9.17L18.36,7.05M17,11V13H23V11H17M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M14.83,16.24L16.95,18.36L18.36,16.95L16.24,14.83L14.83,16.24M5.64,16.95L7.05,18.36L9.17,16.24L7.76,14.83L5.64,16.95M11,23H13V17H11V23Z" />
                    </svg>
                </>
            ),
            callback: () => setListing("seeding"),
        }
    ]

    if (group && group.isOwner) {
        pageCycle.push({
            name: t("group.logs.main"),
            callback: () => setListing("grouplogs"),
        })
    }

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
            name: t("group.settings.main"),
            callback: () => setSettingsListing("settings"),
        },
        {
            name: t("group.status.main"),
            callback: () => setSettingsListing("status"),
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
                    <PageCard buttons={settingsCycle} maxWidth="750" >
                        {catSettings[settingsListing]}
                    </PageCard>
                </Column>
            </Row>
            <Row>
                <Column>
                    <PageCard buttons={pageCycle} maxWidth="750" >
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
        <h2>{t("group.admins.main")}</h2>
        <h5>{t("group.admins.description0")}<br />{t("group.admins.description1")}</h5>
        {
            (isSelected) ? (<h5><b>{t("group.admins.selected", { number: selected.length })}</b></h5>) : (<h5>{t("group.admins.select")}</h5>)
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

function ServerLists({ servers }) {
    const { t } = useTranslation();

    let bf1Servers = servers.filter(s => s.game === "bf1")
    let bf1Rows = bf1Servers.map((server, i) => (
        <ServerRow server={server} key={i} />
    ));

    let bf5Servers = servers.filter(s => s.game === "bfv")
    let bf5Rows = bf5Servers.map((server, i) => (
        <ServerRow server={server} key={i} />
    ));

    let bf2042Servers = servers.filter(s => s.game === "bf2042")
    let bf2042Rows = bf2042Servers.map((server, i) => (
        <ServerRow server={server} key={i} />
    ));

    let bf4Servers = servers.filter(s => s.game === "bf4")
    let bf4Rows = bf4Servers.map((server, i) => (
        <ServerRow server={server} key={i} />
    ));

    /* <img style={{maxHeight: '14px', marginRight: '15px'}} alt={t("games.bfv")} src={`/img/gameIcons/bfv.png`}/> */

    return (
        <>
            {bf1Rows.length === 0 ? null :
                (<h2 className={styles.ShownGame}>
                    {t("games.bf1")}
                </h2>)
            }
            {bf1Rows}
            {bf5Rows.length === 0 ? null :
                (<h2 className={styles.ShownGame}>
                    {t("games.bfv")}
                </h2>)
            }
            {bf5Rows}
            {bf2042Rows.length === 0 ? null :
                (<h2 className={styles.ShownGame}>
                    {t("games.bf2042")}
                </h2>)
            }
            {bf2042Rows}
            {bf4Rows.length === 0 ? null :
                (<h2 className={styles.ShownGame}>
                    {t("games.bf4")}
                </h2>)
            }
            {bf4Rows}
        </>
    )
}

function ServerListsLoading() {
    const fakeListing = [1, 1, 1];

    return (
        <>
            {fakeListing.map((_, i) => <FakeUserStRow key={i} />)}
        </>
    )
}

function GroupServers(props) {

    var hasRights = false;

    if (props.group && props.user) hasRights = props.group.isOwner || props.user.auth.isDeveloper;

    const { t } = useTranslation();

    return <>
        <h2>{t("group.servers.main")}</h2>
        <h5>{t("group.servers.description0")}<br />{t("group.servers.description1")}</h5>
        {
            (props.group) ? (
                <ServerLists servers={props.group.servers} />
            ) : (
                <ServerListsLoading />
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

function Seeding(props) {
    const modal = useModal();

    var hasRights = false;
    const [selected, setSelected] = useState();
    const [customServerName, setCustomServerName] = useState("");
    const [broadcast, setBroadcast] = useState("");

    const [hour, setHour] = useState(7);
    const [minute, setMinute] = useState(0);
    const [rejoin, setRejoin] = useState(undefined);
    const { t } = useTranslation();

    if (props.group && props.user) hasRights = props.group.isOwner || props.user.auth.isDeveloper;
    const { data: seedingInfo } = useQuery('seeding' + props.gid, () => OperationsApi.getSeeding(props.gid), { staleTime: 30000 });
    const { data: seeders } = useQuery('seeders' + props.gid, () => OperationsApi.getSeeders(props.gid), { staleTime: 30000 });
    const queryClient = useQueryClient();

    const fakeListing = [1, 1, 1];

    let ingameAmount = 0;
    if (seeders) {
        ingameAmount = seeders.seeders.filter((seeder) => seeder.isRunning).length
    }

    let serverList;
    if (props.group) {
        serverList = [...props.group.servers];
        serverList.sort((a, b) => b.name - a.name);
        serverList = serverList.filter(a => a.game === "bf1");
    }

    useEffect(() => {
        if (seedingInfo) {
            if (rejoin === undefined) {
                setRejoin(seedingInfo.rejoin);
            }
        }
    }, [rejoin, seedingInfo]);

    const isSelected = selected !== undefined;

    const changeSelected = (i, e) => {
        if (i === 90) {
            if (e) {
                setCustomServerName(e.target.value);
            }
            setSelected(i);
        } else {
            setSelected(b => (i !== selected) ? i : undefined);
        }
    }

    const joinServer = () => {
        let server;
        if (selected === 90) {
            server = { name: customServerName, id: "" }
        } else {
            server = props.group.servers[selected];
        }
        OperationsApi.setSeeding({ serverName: server.name, serverId: server.id, action: "joinServer", groupId: props.gid, rejoin: rejoin, message: "" })
        setSelected(undefined);
        let timeout = 300;
        if (selected === 90) {
            timeout = 1000;
        }
        setTimeout(() => { queryClient.invalidateQueries('seeding' + props.gid) }, timeout);
    }

    const scheduleSeed = () => {
        let server;
        if (selected === 90) {
            server = { name: customServerName, id: "" }
        } else {
            server = props.group.servers[selected];
        }
        OperationsApi.scheduleSeeding({ timeStamp: `${hour}:${minute}0`, serverName: server.name, groupId: props.gid })
        setSelected(undefined);
        setTimeout(() => { queryClient.invalidateQueries('seeding' + props.gid) }, 1000);
    }

    return <>
        <h2>{t("group.seeding.main")}</h2>
        <h5>{t("group.seeding.description0")}<br />{t("group.seeding.description2")}<br />
            <a alt="" href="https://github.com/community-network/bf1-seeder" rel="noreferrer" target="_blank">{t("group.seeding.app")}</a>
        </h5>
        {
            (seedingInfo) ? (
                (seedingInfo.action === "joinServer") ? (
                    <h5>{t("group.seeding.status.main")}<b>{t("group.seeding.status.seedServer", { "serverName": seedingInfo.serverName })}</b></h5>
                ) : (
                    (seedingInfo.action === "broadcastMessage") ? (
                        <h5>{t("group.seeding.status.main")}<b>{t("group.seeding.status.broadcastMessage", { "message": seedingInfo.gameId })}</b></h5>
                    ) : (
                        <h5>{t("group.seeding.status.main")}<b>{t(`group.seeding.status.${seedingInfo.action}`)}</b></h5>
                    )
                )
            ) : (<></>)
        }

        {
            (seedingInfo) ? (
                (seedingInfo.startServer !== null) ? (
                    <h5><b>{t("group.seeding.scheduled.true", { "serverName": seedingInfo.startServer, "startTime": seedingInfo.startTime })}</b></h5>
                ) : (
                    <h5>{t("group.seeding.scheduled.false")}</h5>
                )
            ) : (<></>)
        }
        <ButtonRow>
            <select className={styles.SwitchGame} value={hour} onChange={e => setHour(e.target.value)}>
                {[...Array(24)].map((_, i) => {
                    return (
                        <option value={i}>{i}</option>
                    )
                })}
            </select>
            <select className={styles.SwitchGame} value={minute} onChange={e => setMinute(e.target.value)}>
                <option value="0">0</option>
                <option value="3">30</option>
            </select>
            {
                (hasRights && isSelected) ? (
                    <Button name={t("group.seeding.actions.schedule")} callback={scheduleSeed} />
                ) : (
                    <Button disabled={true} name={t("group.seeding.actions.schedule")} />
                )
            }
            {
                (hasRights && seedingInfo && seedingInfo.startTime !== null) ? (
                    <Button name={t("group.seeding.actions.undoSchedule")} callback={() => modal.show(<UnscheduleSeed gid={props.group.id} callback={modal.close} />)} />
                ) : (
                    <Button disabled={true} name={t("denied")} content={t("group.seeding.actions.undoSchedule")} />
                )
            }
        </ButtonRow>
        <ButtonRow>
            <select className={styles.SwitchGame} value={rejoin} onChange={e => setRejoin(e.target.value === 'true')}>
                <option value="true">{t("group.seeding.auto-rejoin.true")}</option>
                <option value="false">{t("group.seeding.auto-rejoin.false")}</option>
            </select>
            {
                (hasRights && isSelected) ? (
                    <Button name={t("group.seeding.actions.joinSelected")} callback={joinServer} />
                ) : (
                    <Button disabled={true} name={t("group.seeding.actions.joinSelected")} />
                )
            }
            {
                (hasRights) ? (
                    <Button name={t("group.seeding.actions.leave")} callback={() => modal.show(<LeaveServer gid={props.group.id} textItem={"leave"} option={"leaveServer"} callback={modal.close} rejoin={rejoin} />)} />
                ) : (
                    <Button disabled={true} name={t("denied")} content={t("group.seeding.actions.leave")} />
                )
            }
            {
                (hasRights) ? (
                    <Button name={t("group.seeding.actions.shutdownWindows")} callback={() => modal.show(<LeaveServer gid={props.group.id} textItem={"shutdownWindows"} option={"shutdownPC"} callback={modal.close} rejoin={rejoin} />)} />
                ) : (
                    <Button disabled={true} name={t("denied")} content={t("group.seeding.actions.shutdownWindows")} />
                )
            }
        </ButtonRow>
        {
            (props.group) ? (
                serverList.map((server, i) => (
                    <SeederStRow user={server} selected={selected === i} callback={() => changeSelected(i, undefined)} key={server.id || i} />
                ))
            ) : (
                fakeListing.map((_, i) => <FakeUserStRow key={i} />)
            )
        }
        <SeederStCustom selected={selected === 90} callback={(e) => changeSelected(90, e)} key={90} />
        <h2 style={{ marginBottom: "4px", marginTop: "16px" }}>{t("group.seeding.broadcast.main")}</h2>
        <Row>
            <TextInput callback={(e) => setBroadcast(e.target.value)} defaultValue={broadcast} name={t("group.seeding.broadcast.message")} />
            {
                (hasRights && broadcast !== "") ? (
                    <Button name={t("group.seeding.broadcast.sendMessage")} callback={() => modal.show(<SeederBroadcast gid={props.group.id} message={broadcast} callback={modal.close} rejoin={rejoin} />)} />
                ) : (
                    <Button disabled={true} name={t("denied")} content={t("group.seeding.broadcast.sendMessage")} />
                )
            }
        </Row>
        <h2 style={{ marginBottom: "4px", marginTop: "16px" }}>{t("group.seeding.seeders.main", { "seeders": (seeders) ? seeders.seeders.length : 0, "ingame": ingameAmount })}</h2>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {
                (seeders && seedingInfo && props.group) ? seeders.seeders.map(
                    (seeder, i) => (<SeederRow seeder={seeder} key={i} seedingInfo={seedingInfo} />)
                ) : Array.from({ length: 8 }, (_, id) => ({ id })).map(
                    (_, i) => (<EmptyRow key={i} />)
                )
            }
        </div>
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
        <h2>{t("group.owners.main")}</h2>
        <h5>{t("group.owners.description0")}<br />{t("group.owners.description1")}</h5>
        {
            (isSelected) ? (<h5><b>{t("group.owners.selected", { number: selected.length })}</b></h5>) : (<h5>{t("group.owners.select")}</h5>)
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


    var hasRights = false;

    if (props.group && props.user) hasRights = props.group.isOwner || props.user.auth.isDeveloper;
    // const queryClient = useQueryClient();

    // const [sid, setSid] = useState("");
    // const [remid, setRemid] = useState("");
    // const [applyStatus, setApplyStatus] = useState(null);
    const { t } = useTranslation();
    const modal = useModal();


    // useEffect(() => {
    //     if (props.group) {
    //         if (remid !== props.group.cookie.remid)
    //             setRemid(props.group.cookie.remid);
    //         if (sid !== props.group.cookie.sid)
    //             setSid(props.group.cookie.sid);
    //     }
    // }, [props.group]);

    // const editCookies = useMutation(
    //     variables => OperationsApi.editGroup(variables),
    //     {
    //         onMutate: async () => {
    //             setApplyStatus(true);
    //         },
    //         onSuccess: async () => {
    //             setApplyStatus(null);
    //         },
    //         onError: async () => {
    //             setApplyStatus(false);
    //             setTimeout(_ => setApplyStatus(null), 2000);
    //         },
    //         onSettled: async () => {
    //             queryClient.invalidateQueries('groupId' + props.gid);
    //         }
    //     }
    // );

    return (
        <>
            <h2>
                {t("group.name")} - {(!!props.group) ? props.group.groupName : t("pending")}
            </h2>
            <h5>
                {t("group.id")}<span className={styles.GroupIdentity}>{props.gid}</span>
            </h5>

            <h2>Accounts used for group</h2>
            <h5 style={{ marginTop: "0px" }}>
                {t("createGroup.cookieDescription2")}
            </h5>
            {(props.group) ? (
                <ScrollRow>
                    {props.group.cookies.map((cookie, index) => {
                        return <div key={index}><AccountInfo {...props} cookie={cookie} /></div>
                    })}
                </ScrollRow>
            ) : (
                <></>
            )}

            <ButtonRow>
                {
                    (hasRights) ? (
                        <Button name={t("cookie.add")} callback={_ => modal.show(<AddAccountModal gid={props.gid} group={props.group} user={props.user} callback={modal.close} />)} />
                    ) : (
                        <Button disabled={true} name={t("denied")} content={t("cookie.add")} />
                    )
                }
            </ButtonRow>
        </>
    );
}

function AccountInfo({ group, gid, user, cookie }) {
    const { t } = useTranslation();
    const modal = useModal();
    return (
        <>
            <div className={styles.AccountInfo} onClick={_ => modal.show(<ChangeAccountModal gid={gid} group={group} cookie={cookie} user={user} callback={modal.close} />)}>
                {(!!group && !cookie.validCookie) ? (
                    <h2 style={{ color: "#FF7575" }}>
                        {t("cookie.invalid")}
                    </h2>
                ) : <h2>
                    {(!group) ? t("cookie.status.loading") : (!cookie.username) ? t("cookie.status.pending") : cookie.username}
                </h2>}
                <h5 style={{ marginTop: "0px" }}>
                    {t("group.account.description0")}<br />{t("group.account.description1")}<i>accounts.ea.com</i>
                </h5>
                <h5 style={{ marginTop: "0px" }}>
                    {(group && group.defaultCookie === cookie.id) ? t("cookie.accountType.default") : t("cookie.accountType.extra")}
                </h5>
            </div>
        </>

    )
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
                <TextInput disabled={!allowedTo} callback={(e) => setAdminId(e.target.value)} defaultValue={adminId} name={t("discord.adminId")} />
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


function GroupSettings(props) {
    var allowedTo = false;
    if (props.group && props.user) allowedTo = props.group.isOwner || props.user.auth.isDeveloper;

    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const [tokenDisabled, setTokenDisabled] = useState(props.group ? props.group.tokenUsed : false);
    const [groupState, setGroupState] = useState(null);
    const [canApply, setCanApply] = useState(false);
    const [applyStatus, setApplyStatus] = useState(null);

    useEffect(() => {

        if (props.group) {
            const { visableBans, cookieLocale, token } = props.group;
            const originalGroupState = { visableBans, cookieLocale, token: props.group.tokenUsed ? "-" : "" };
            if (groupState === null) {
                setGroupState(originalGroupState);
                setTokenDisabled(token !== "");
            } else {
                let newCanApply = false;
                for (var i in originalGroupState) {
                    newCanApply |= groupState[i] !== originalGroupState[i];
                }
                if (groupState.token === "") setTokenDisabled(false);
                setCanApply(newCanApply);
            }

        }


    }, [props.group, groupState]);

    const changeGroupState = (v) => {
        setGroupState(s => ({ ...s, ...v }));
    }

    const editGroupSettings = useMutation(
        variables => OperationsApi.editGroup({ value: variables, gid: props.gid }),
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

    const getGroupValue = (key) => {
        if (props.group && key in props.group) {
            return props.group[key]
        }
        return "";
    };

    return (
        <>
            <h5>
                {t("group.settings.visableBansDesc")}
            </h5>
            <Switch checked={getGroupValue("visableBans")} name={t("group.settings.visableBans")} callback={(v) => changeGroupState({ visableBans: v })} />
            <h5 style={{ marginTop: "8px" }}>
                {t("group.settings.localeDescription0")}<br />{t("group.settings.localeDescription1")}<a href="https://www.oracle.com/java/technologies/javase/jdk8-jre8-suported-locales.html" target="_blank" rel="noopener noreferrer">Oracle.com</a>
            </h5>
            <Row>
                <TextInput type="text" disabled={!allowedTo} callback={(e) => changeGroupState({ cookieLocale: e.target.value })} defaultValue={getGroupValue("cookieLocale")} name={t("cookie.locale")} />
                <p style={{ margin: "0 0 0 20px", alignSelf: "center" }}>
                    {t("cookie.locale")}
                </p>
            </Row>
            <h5 style={{ paddingTop: '1rem' }}>
                {t("group.settings.tokenDescription0")}<br />{t("group.settings.tokenDescription1")}
            </h5>
            <Switch checked={tokenDisabled} name={t("group.settings.tokenEnable")} callback={(v) => {
                let token = ""
                setTokenDisabled(v); (!v)
                    ? token = ""
                    : token = cryptoRandomString({ length: 40 });
                document.getElementsByTagName('input')[1].value = token;
                changeGroupState({ token: token })
            }} />
            <Row>
                <TextInput type="text" disabled={!allowedTo || !tokenDisabled} callback={(e) =>
                    changeGroupState({ token: e.target.value })} defaultValue={getGroupValue("token")}
                    name={t("group.settings.token")} />
                <Button name={t("group.settings.tokenGen")} callback={_ => {
                    const token = cryptoRandomString({ length: 40 });
                    changeGroupState({ token: token });
                    document.getElementsByTagName('input')[1].value = token;
                }} />
            </Row>
            <ButtonRow><ButtonUrl href={`https://manager-api.gametools.network/docs/`} name={t("ApiInfo.link")} /></ButtonRow>
            {
                (props.group && canApply) ? (
                    <ButtonRow>
                        <Button name={t("apply")} disabled={!allowedTo || applyStatus !== null} callback={
                            _ => editGroupSettings.mutate(
                                groupState
                            )
                        } status={applyStatus} />
                    </ButtonRow>
                ) : ""
            }
        </>
    );
}

function GroupStatus(props) {
    const [statusRef, { width }] = useMeasure();
    const { t } = useTranslation();
    const [serverNum, setServerNum] = useState(0);
    let groupId = ""
    let serverId = ""
    if (props.group) {
        groupId = props.group.id
        if (props.group.servers.length !== 0) {
            serverId = props.group.servers[serverNum].id
        }
    }
    const { error, data: groupStats } = useQuery('groupStats' + groupId, () => OperationsApi.getStats(groupId), { staleTime: Infinity, refetchOnWindowFocus: false });
    const { serverError, data: serverStats } = useQuery('serverStats' + serverId, () => OperationsApi.getServerStats(serverId), { staleTime: Infinity, refetchOnWindowFocus: false });

    return (
        <div ref={statusRef}>
            {
                (props.group) ? (
                    <>
                        <h5 style={{ marginTop: "0px" }}>
                            {t("group.status.worker.main")}
                        </h5>
                        <WorkerStatus worker={props.group.inWorker} lastUpdate={props.group.lastUpdate} />
                        <h5>
                            {t("group.status.cookiecheck.main")}
                        </h5>
                        {props.group.lastCookieCheck !== null ? (
                            <h5>{t("time", { date: new Date(props.group.lastCookieCheck) })}</h5>
                        ) : (
                            <h5>{t("group.status.cookiecheck.never")}</h5>
                        )}
                    </>
                ) : ""
            }
            <h5 style={{ marginTop: "15px", marginBottom: "0px" }}>
                {t("group.status.stats.main")}
            </h5>
            {
                (groupStats) ? (
                    <div style={{ paddingLeft: "10px" }}>
                        <h5 style={{ margin: "3px 20px" }}>{t("group.status.stats.autoKickPingAmount", { amount: groupStats.autoKickPingAmount })}</h5>
                        <h5 style={{ margin: "3px 20px" }}>{t("group.status.stats.bfbanAmount", { amount: groupStats.bfbanAmount })}</h5>
                        <h5 style={{ margin: "3px 20px" }}>{t("group.status.stats.moveAmount", { amount: groupStats.moveAmount })}</h5>
                        <h5 style={{ margin: "3px 20px" }}>{t("group.status.stats.kickAmount", { amount: groupStats.kickAmount })}</h5>
                        <h5 style={{ margin: "3px 20px" }}>{t("group.status.stats.banAmount", { amount: groupStats.banAmount })}</h5>
                        <h5 style={{ margin: "3px 20px" }}>{t("group.status.stats.globalBanKickAmount", { amount: groupStats.globalBanKickAmount })}</h5>
                    </div>
                ) : (
                    <h5 style={{ margin: "3px 20px" }}>{t("loading")}</h5>
                )
            }

            <h5 style={{ marginTop: "15px", marginBottom: "5px" }}>
                {t("group.status.stats.servers.main")}
            </h5>
            <ButtonRow>
                <select className={styles.SmallSwitch} style={{ marginLeft: "20px", marginBottom: "10px" }} value={serverNum} onChange={e => setServerNum(e.target.value)}>
                    {props.group.servers.map((element, index) => {
                        return (
                            <option value={index}>{element.name}</option>
                        )
                    })}
                </select>
            </ButtonRow>
            {
                (serverStats) ? (
                    <div style={{ paddingLeft: "10px" }}>
                        {serverStats.data.playerAmounts.length !== 0 ? (
                            <>
                                {width < 760 ? (
                                    <>
                                        <StatsPieChart stats={serverStats.data} />
                                        <PlayerInfo stats={serverStats.data} />
                                    </>
                                ) : (
                                    <div style={{ display: "flex" }}>
                                        <StatsPieChart stats={serverStats.data} />
                                        <PlayerInfo stats={serverStats.data} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <h5 style={{ marginBottom: "5px" }}>{serverStats.serverName}</h5>
                                <h5 style={{ margin: "0px 25px" }}>{t("group.status.stats.servers.none")}</h5>
                                <br />
                            </>
                        )}
                    </div>
                ) : (
                    <h5 style={{ margin: "3px 20px" }}>{t("loading")}</h5>
                )
            }
        </div>
    );
}

function GroupDangerZone(props) {

    var allowedTo = false;
    var canSetUpOps = false;

    if (props.group && props.user) allowedTo = props.group.isOwner || props.user.auth.isDeveloper;
    if (props.group && props.user) canSetUpOps = props.group.makeOperations && props.group.isOwner;

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
                <ButtonLink style={{ color: "#FF7575" }} name={t("group.danger.delete")} to={`/group/${props.gid}/delete/`} disabled={!allowedTo} />
                <ButtonLink name={t("sidebar.makeOperations")} to={`/makeops/${props.gid}/`} disabled={!canSetUpOps} />
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
            <TextInput name={t("group.addMenu.nickname")} callback={(e) => setNickname(e.target.value)} />
            <TextInput name={t("group.addMenu.id")} callback={(e) => setUid(e.target.value)} />
            <ButtonRow>
                <Button name={t("group.owners.add")} callback={() => { AddGroupOwnerExecute.mutate({ gid, uid, nickname }); props.callback(); }} />
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
            <TextInput name={t("group.addMenu.nickname")} callback={(e) => updateState({ nickname: e.target.value })} />
            <TextInput name={t("group.addMenu.id")} callback={(e) => updateState({ uid: e.target.value })} />
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
                <Card>
                    <h2>{t("createGroup.main")}</h2>
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
                    <ButtonUrl href={`/cookieinfo`} name={t("cookieInfo.link")} />
                    <h5 style={{ marginTop: "8px" }}>
                        {t("cookie.sidDescription")}<i>accounts.ea.com</i>
                    </h5>
                    <TextInput name={t("cookie.sid")} autocomplete="new-password" autocomplete="off" callback={(e) => { checkInputVariables({ sid: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        {t("cookie.remidDescription")}<i>accounts.ea.com</i>
                    </h5>
                    <TextInput name={t("cookie.remid")} autocomplete="new-password" autocomplete="off" callback={(e) => { checkInputVariables({ remid: e.target.value }) }} />
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
    const { error: groupError, data: groups } = useQuery('groupId' + thisGid, () => OperationsApi.getGroup(thisGid), { staleTime: 30000 });
    var group = (groups && groups.data && groups.data.length > 0) ? groups.data[0] : null;

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
                    {group ? (
                        <p>{t("group.danger.checkWithName", { name: group.groupName })}</p>
                    ) : (
                        <p>{t("group.danger.check")}</p>
                    )}
                    <ButtonRow>
                        <ButtonLink name={t("group.danger.back")} to={"/group/" + thisGid} />
                        <Button name={t("group.danger.confirm")} callback={() => { DeleteGroupExecute.mutate({ gid: thisGid }); history.push("/account/"); }} />
                    </ButtonRow>
                </Card>
            </Column>
        </Row>
    );
}

export function AddGroupServer(props) {
    var gid = props.match.params.gid;

    const [game, setGame] = useState("bf1");
    var name = "", alias = "";

    const queryClient = useQueryClient();
    const { t } = useTranslation();


    const AddGroupServerExecute = useMutation(
        variables => OperationsApi.addGroupServer(variables),
        {
            // When mutate is called:
            onMutate: async ({ gid, name, alias, game }) => {

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
                        "name": name,
                        "game": game
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
                <Card>
                    <h2>{t("group.serverAddMenu.main")}</h2>
                    <TextInput name={t("group.serverAddMenu.name")} callback={(e) => { name = e.target.value }} />
                    <TextInput name={t("group.serverAddMenu.alias")} callback={(e) => { alias = e.target.value; }} />
                    <ButtonRow>
                        <select style={{ marginLeft: "5px" }} className={styles.SwitchTitle} value={game} onChange={e => setGame(e.target.value)}>
                            {statusOnlyGames.map((key, index) => {
                                return (
                                    <option key={index} value={key}>{t(`games.${key}`)}</option>
                                );
                            })}
                        </select>
                    </ButtonRow>
                    <ButtonRow>
                        <Button name={t("group.servers.add")} callback={() => { AddGroupServerExecute.mutate({ gid, alias, name, game }); history.push("/group/" + gid); }} />
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

    var gid = props.match.params.gid;

    const [addGroupState, changeState] = useState({
        variables: {
            server: "",
            remid: "",
            sid: "",
            gid: gid,
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
                <Card>
                    <h2>{t("operations.main")}</h2>
                    <h5>
                        {t("operations.description0")}<br />
                        {t("operations.description1")}<br />
                        {t("operations.description2")}
                    </h5>
                    <TextInput name="Server name" callback={(e) => { checkInputVariables({ server: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        {t("operations.server")}<b>{t("operations.owner")}</b>{t("operations.cookies")}
                    </h5>
                    <ButtonRow><ButtonUrl href={`/cookieinfo`} name={t("cookieInfo.link")} /></ButtonRow>
                    <h5 style={{ marginTop: "8px" }}>
                        {t("cookie.sidDescription")}<i>accounts.ea.com</i>
                    </h5>
                    <TextInput name={t("cookie.sid")} type="password" autocomplete="new-password" callback={(e) => { checkInputVariables({ sid: e.target.value }) }} />
                    <h5 style={{ marginTop: "8px" }}>
                        {t("cookie.remidDescription")}<i>accounts.ea.com</i>
                    </h5>
                    <TextInput name={t("cookie.remid")} type="password" autocomplete="new-password" callback={(e) => { checkInputVariables({ remid: e.target.value }) }} />
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

export function LeaveServer(props) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const AddGroupAdminExecute = useMutation(
        variables => OperationsApi.setSeeding(variables),
        {
            onSettled: () => {
                queryClient.invalidateQueries('seeding' + props.gid)
            },
        }
    );

    return (
        <>
            <h2>{t("group.seeding.main")}</h2>
            <h2>{t("group.seeding.popup.confirmInfo", { option: t(`group.seeding.actions.${props.textItem}`) })}</h2>
            <ButtonRow>
                <Button name={t(`group.seeding.popup.confirm`)} callback={() => {
                    AddGroupAdminExecute.mutate({ serverName: "", serverId: "0", action: props.option, groupId: props.gid, rejoin: props.rejoin, message: "" });
                    props.callback();
                }} />
            </ButtonRow>
        </>
    );
}

export function AddKeepAlive(props) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [hostname, setHostname] = useState("");

    const AddGroupAdminExecute = useMutation(
        variables => OperationsApi.addKeepAlive(variables),
        {
            onSettled: () => {
                queryClient.invalidateQueries('seeding' + props.gid)
            },
        }
    );

    return (
        <>
            <h2>{t("group.seeding.keepalive.add")}</h2>
            <h2>{t("group.seeding.keepalive.hostname")}</h2>
            <TextInput style={{ height: "32px" }} name={t("group.seeding.keepalive.sethostname")} callback={(e) => setHostname(e.target.value)} />
            <ButtonRow>
                <Button name={t(`group.seeding.popup.confirm`)} callback={() => {
                    AddGroupAdminExecute.mutate({ serverId: props.sid, hostname: hostname });
                    props.callback();
                }} />
            </ButtonRow>
        </>
    );
}


export function SeederBroadcast(props) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const AddGroupAdminExecute = useMutation(
        variables => OperationsApi.setSeeding(variables),
        {
            onSettled: () => {
                queryClient.invalidateQueries('seeding' + props.gid)
            },
        }
    );

    return (
        <>
            <h2>{t("group.seeding.main")}</h2>
            <h2>{t("group.seeding.popup.broadcastInfo", { message: props.message })}</h2>
            <ButtonRow>
                <Button name={t(`group.seeding.popup.confirm`)} callback={() => {
                    AddGroupAdminExecute.mutate({ serverName: "", serverId: "0", action: "broadcastMessage", groupId: props.gid, rejoin: props.rejoin, message: props.message });
                    props.callback();
                }} />
            </ButtonRow>
        </>
    );
}

export function UnscheduleSeed(props) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const AddGroupAdminExecute = useMutation(
        variables => OperationsApi.undoScheduleSeeding(variables),
        {
            onSettled: () => {
                queryClient.invalidateQueries('seeding' + props.gid)
            },
        }
    );
    return (
        <>
            <h2>{t("group.seeding.main")}</h2>
            <h2>{t("group.seeding.confirmInfo", { option: t("group.seeding.undoSchedule") })}</h2>
            <ButtonRow>
                <Button name={t(`group.seeding.confirm`)} callback={() => { AddGroupAdminExecute.mutate({ groupId: props.gid }); props.callback(); }} />
            </ButtonRow>
        </>
    );
}