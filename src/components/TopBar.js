import React from "react";
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { NavLink, Link, useHistory } from 'react-router-dom';
import ABSwitch, { getChannel } from "../testing/ABtesting";
import styles from "./TopBar.module.css";
import { useTranslation } from 'react-i18next';

import { OperationsApi } from "../api";

import { APP_VERSION } from "../App";

export function TopBar(props) {
    const { t } = useTranslation();

    const { error: userError, data: user, isLoading } = useQuery('user', () => OperationsApi.user);
    var accountPage = "";
    
    if (!userError && !isLoading && user && user.auth.signedIn) {
        accountPage = (
            <Link to="/account/" title={user.discord.name} className={styles.accountPage}>
                {/*<span>{user.discord.name}</span>*/}
                <img src={user.discord.avatar} className={styles.Avatar} />
                <span className={styles.accountText}>{t("account.main")}</span>
            </Link>
        );
    }


    return (
        <>
            <div className={styles.bar}>



                <button className={styles.showBar} onClick={props.hideSidebar}>
                    <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
                    </svg>
                </button>
                <Link to="/" title="Main page" className={styles.mainPage}>
                    <img src="/logo-release.png" className={styles.logo} />
                </Link>
                <div className={styles.filler} ></div>

                {accountPage}

            </div>

        </>
    );
}