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
    return (
        <Link className={styles.GroupRow} to={"/server/" + server.id}>
            <span className={styles.GroupName}>{server.name}</span>
            Open Console
        </Link>
    );
}