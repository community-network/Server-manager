import React, { useState } from "react";
import styles from "./Group.module.css";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { OperationsApi } from "../api";
import { TextInput } from "./Buttons";
import { Tag } from "./Card";

export function GroupRow(props) {
    var group = props.group;
    return (
        <Link className={styles.GroupRow} to={"/group/" + group.id}>
            <span className={styles.GroupName}>{group.groupName}</span>
            Manage group
        </Link>
    );
}

export function ServerRow(props) {
    var server = props.server;

    // If not yet setteled
    if (server.id === null) {
        return (
            <div className={styles.GroupRow}>
                <span className={styles.GroupName}>{server.name}</span>
                {props.button}
            </div>
        );
    }

    return (
        <div className={styles.GroupRow}>
            <Link className={styles.GroupName} to={"/server/" + server.id}>
                {server.name}
            </Link>
            {props.button}
        </div>
    );
}

export function GroupAdminAccount(props) {

    var { remid, sid } = props.cookie;

    return (
        <div className={styles.AdminAccount}>
        </div>
    );

}

export function GameStatsAd(props) {
    return (
        <a target="_blank" rel="noopener noreferrer" className={styles.gameStatsAd} href="https://discord.com/oauth2/authorize?client_id=714524944783900794&scope=bot&permissions=83968">
            <img src="./game-stats.png" />
            <span>Add Game Stats bot on your Discord server, in order to control BF1 servers with commands.</span>
        </a>
    );
}


export function VBanList(props) {
    const gid = props.gid;
    const { isError, data: banList, error } = useQuery('globalBanList' + gid, () => OperationsApi.getAutoBanList({ gid }));

    const queryClient = useQueryClient();

    const [searchWord, setSearchWord] = useState("");

    const unbanVGlobalBan = useMutation(
        variables => OperationsApi.globalUnbanPlayer(variables),
        {
            // When mutate is called:
            onMutate: async ({ gid, name }) => {
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('globalBanList' + gid)
                // Snapshot the previous value
                const previousBanList = queryClient.getQueryData('globalBanList' + gid)
                // Optimistically update to the new value
                queryClient.setQueryData('globalBanList' + gid, old => {
                    old.data= old.data.filter(player => player.playerName !== name);
                    return old;
                })
                // Return a context object with the snapshotted value
                return { previousBanList, gid }
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, newTodo, context) => {
                queryClient.setQueryData('globalBanList' + context.gid, context.previousBanList)
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('globalBanList' + context.gid)
            },
        }
    );

    if (!banList) {
        // TODO: add fake item list on loading
        return "Loading..";
    }

    if (isError) {
        return `Error ${error.code}: {error.message}`
    }

    return (
        <div>
            <h5>
                List of banned players on this group. Used <b>{banList.data.length} slots</b>. <Tag>Early beta</Tag>
            </h5>
            <TextInput name={"Search.."} callback={(v) => setSearchWord(v.target.value)} />
            <div className={styles.BanListing}>
                {
                    banList.data.filter(p => p.playerName.includes(searchWord)).map(
                        (player, i) => (<GlobalBanRow player={player} key={i} callback={() => unbanVGlobalBan.mutate({gid, name: player.playerName})}/>)
                    )
                }
            </div>
        </div>
    );
}


function GlobalBanRow(props) {
    const player = props.player;
    return (
        <div className={styles.BanRow}>
            <span className={styles.BanDisplayName}>{player.playerName}</span>
            <span className={styles.banReason}>{
                ((player.reason === "") ? "without any reason" : "with reason")
            }</span>
            <span className={styles.banReasonDetailed}>{player.reason}</span>
            <span className={styles.globalUnban} onClick={props.callback}>Unban</span>
        </div>
    );
}

export function GroupLogs(props) {
    const gid = props.gid;
    const { isError, data: logList, error } = useQuery('groupogList' + gid, () => OperationsApi.getGroupLogs({ gid }));

    if (isError) {
        return `Error ${error.code}: {error.message}`
    }

    if (logList) {
        logList.logs.sort((a, b) => (
            Date.parse(b.timeStamp) - Date.parse(a.timeStamp)
        ));
    }


    return (
        <div>
            <h5>Group log list</h5>
            <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "8px" }}>
                {
                    (logList) ? logList.logs.map(
                        (log, i) => (<LogRow log={log} key={i} />)
                    ) : Array.from({ length: 8 }, (_, id) => ({ id })).map(
                        (_, i) => (<EmptyLogRow key={i} />)
                    )
            }
            </div>
        </div>
    );
}

function LogRow(props) {
    const log = props.log;

    const actionIcon = (() => {
        switch (log.action) {
            case "editGroup":
                return "";
            case "addUser":
                return "";
            case "addOwner":
                return ""
            case "addGroup":
                return "";
            case "removeOwner":
                return "";
            case "removeUser":
                return ""
            default:
                return "";
        }
    })();

    var datetime = new Date(log.timeStamp);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Local time
    datetime = `${datetime.getUTCDate()} ${months[datetime.getMonth()]} ${datetime.getFullYear()} ${datetime.getHours()}:${datetime.getMinutes()}`;

    return (
        <div className={styles.logRow}>
            <span className={styles.logAdmin}>{log.adminName}</span>
            <span className={styles.logReason}>{
                log.reason
            }</span>
            <span className={styles.logTime}>{datetime}</span>
        </div>
    );
}

function EmptyLogRow() {
    return (
        <div className={styles.logRow}></div>
    );
}