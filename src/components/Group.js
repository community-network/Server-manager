import React from "react";
import styles from "./Group.module.css";
import { Link } from "react-router-dom";

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
            <span>Add Game Stats bot on your Discord server, in order to control BF1 servers with cammands.</span>
        </a>
    );
}