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