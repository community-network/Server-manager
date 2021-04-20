import React from "react";
import styles from "./Status.module.css";


function LoadingIcon() {
    return (
        <svg viewBox="0 0 24 24" className={styles.loadingIcon}>
            <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
    );
}

function ErrorIcon(props) {
    return (
        <svg viewBox="0 0 24 24" className={styles.errorIcon}>
            <path fill="currentColor" d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" />
        </svg>
    );
}

export function Status(props) {
    return (
        <div className={styles.status}>
            {(props.status === undefined || props.status === null) ?  "" : (props.status) ? <LoadingIcon /> : <ErrorIcon />}
        </div>
    );
}