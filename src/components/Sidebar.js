import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { NavLink, Link, useHistory } from 'react-router-dom';

import styles from "./Sidebar.module.css";

import { OperationsApi } from "../api";

function TopSidebar() {
    return (
        <div className={styles.TopSidebar}>
            <Link to="/" title="Main page">
                <img src="/Comnet-logo.png" className={styles.Logo} />
            </Link>
        </div>
    );
}

function PageLink(props) {
    return (
        <div className={styles.PageLink}>
            <NavLink to={props.to} activeClassName={styles.PageLinkActive} title={props.name}>{props.name}</NavLink>
        </div>
    );
}

function PageButton(props) {
    return (
        <div className={styles.PageButton}>
            <span onClick={props.onClick}>{props.name}</span>
        </div>
    );
}

export function Sidebar(props) {

    const { error: userError, data: user, isLoading } = useQuery('user', () => OperationsApi.user);

    var devLink = "", accountLink = "", logoutLink = "", groupLinks = "";

    var history = useHistory();
    const queryClient = useQueryClient();

    const logoutExecutor = useMutation(
        v => OperationsApi.logout(),
        {
            // When mutate is called:
            onMutate: async (v) => {
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries('user');
                // Snapshot the previous value
                const prevUser = queryClient.getQueryData('user');
                // Optimistically update to the new value
                queryClient.setQueryData('user', old => {
                    return {
                        discord: {
                            name: "",
                            discriminator: 0,
                            avatar: ""
                        },
                        auth: {
                            inGuild: false,
                            isAdmin: false,
                            isDeveloper: false,
                            isOwner: false,
                            signedIn: false
                        }
                    };
                })
                // Return a context object with the snapshotted value
                return { prevUser }
            },
            // Always refetch after error or success:
            onSettled: (data, error, variables, context) => {
                queryClient.invalidateQueries('user')
            },
        }
    );


    if (!userError && !isLoading && user) {
        if (user.auth.signedIn) {
            if (user.auth.isDeveloper) {
                devLink = <PageLink to="/dev/" name="Developer Options" />;
            }
            accountLink = <PageLink to="/account/" name="Account" />;
            logoutLink = <PageButton onClick={() => { logoutExecutor.mutate({}); history.push('/'); }} name="Logout" />;
            groupLinks = [];
            for (let i in user.permissions.isAdminOf) {
                let group = user.permissions.isAdminOf[i];
                groupLinks.push(<PageLink to={ "/group/" + group.id } name={group.groupName} key={i} />);
            }

        }
    }

    

    return (
        <div className={styles.Sidebar}>
            <TopSidebar />
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", flexGrow: 2, flexDirection: "column" }}>
                    {accountLink}
                    {devLink}
                    {groupLinks}
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "30px"}}>
                    <PageButton onClick={() => { window.location = "https://discord.gametools.network/" }} name="Need help?" />
                    {logoutLink}
                </div>
            </div>
        </div>
    );

}