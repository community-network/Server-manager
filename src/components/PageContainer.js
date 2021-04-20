import React from "react";
import styles from "./PageContainer.module.css";


export function PageContainer(props) {
    return (
        <div className={styles.PageContainer}>
            {props.children}
        </div>
    );

}

export function PageColumn(props) {
    return (
        <div className={styles.PageColumn}>
            {props.children}
        </div>
    );
}
