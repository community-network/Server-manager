import React from "react";

import styles from "./Flex.module.css";


export function Column(props) {
    return (
        <div className={styles.Column}>{props.children}</div>
    );
}

export function Row(props) {
    return (
        <div className={styles.Row}>{props.children}</div>
    );
}

export function TopRow(props) {
    return (
        <div className={styles.topRow}>{props.children}</div>
    );
}

export function Grow(props) {
    return (
        <div className={styles.Grow}>{props.children}</div>
    );
}