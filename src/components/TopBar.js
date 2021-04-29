import React from "react";
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { NavLink, Link, useHistory } from 'react-router-dom';
import ABSwitch, { getChannel } from "../testing/ABtesting";
import styles from "./TopBar.module.css";

import { OperationsApi } from "../api";

import { APP_VERSION } from "../App";

export function TopBar() {
    return (
        <>
            <div className={styles.bar}>
                <Link to="/" title="Main page" className={styles.mainPage}>
                    <img src="/logo-release.png" className={styles.logo} />
                </Link>

            </div>
            <div className={styles.barWrap}></div>
        </>
    );
}