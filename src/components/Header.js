import React from "react";
import styles from "./Header.module.css";


export function Header(props) {
    return (
        <div className={styles.Header}>
            {props.children}
        </div>
    );
}

export function SlimHeader(props) {
    return (
        <div className={styles.SlimHeader}>
            {props.children}
        </div>
    );
}