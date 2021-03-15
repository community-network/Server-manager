import React from "react";
import styles from "./Card.module.css";

import { ChoosePageButtons } from "./Buttons.js";

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

export function PageCard(props) {
    return (
        <>
            <ChoosePageButtons buttons={props.buttons} />
            <div className={styles.PageCard} style={props.style}>
                {props.children}
             </div>
        </>
    );
}