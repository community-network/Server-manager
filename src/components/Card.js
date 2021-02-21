import React from "react";
import styles from "./Card.module.css";

export function Card(props) {
    return (
        <div className={styles.card} style={props.style}>
            {props.children}
        </div>
    );
}

export function CardRow(props) {
    return <span className={styles.CardRow}>{props.children}</span>;
}