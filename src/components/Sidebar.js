import React from "react";
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { NavLink, Link, useHistory } from 'react-router-dom';
import ABSwitch, { getChannel } from "../testing/ABtesting";
import styles from "./Sidebar.module.css";

import { OperationsApi } from "../api";

import { APP_VERSION } from "../App";


function TopSidebar() {
    return (
        <div className={styles.TopSidebar}>
            <Link to="/" title="Main page">
                <img src="/release-logo.png" className={styles.Logo} />
            </Link>
        </div>
    );
}

function PageLink(props) {
    return (
        <div className={styles.PageLink}>
            <NavLink to={props.to} activeClassName={styles.PageLinkActive} title={props.name}>{props.content || props.name}</NavLink>
        </div>
    );
}

function PageButton(props) {
    return (
        <a className={styles.PageButton} target="_blank" rel="noopener noreferrer" href={props.href} title={props.name}>
            <span onClick={props.onClick}>{props.name}</span>
        </a>
    );
}

function AddIcon() {
    return (<svg viewBox="0 0 24 24" className={styles.sideIcon}>
        <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
    </svg>);
}

function WrenchIcon() {
    return (<svg viewBox="0 0 24 24" className={styles.sideIcon}>
        <path fill="currentColor" d="M13.78 15.3L19.78 21.3L21.89 19.14L15.89 13.14L13.78 15.3M17.5 10.1C17.11 10.1 16.69 10.05 16.36 9.91L4.97 21.25L2.86 19.14L10.27 11.74L8.5 9.96L7.78 10.66L6.33 9.25V12.11L5.63 12.81L2.11 9.25L2.81 8.55H5.62L4.22 7.14L7.78 3.58C8.95 2.41 10.83 2.41 12 3.58L9.89 5.74L11.3 7.14L10.59 7.85L12.38 9.63L14.2 7.75C14.06 7.42 14 7 14 6.63C14 4.66 15.56 3.11 17.5 3.11C18.09 3.11 18.61 3.25 19.08 3.53L16.41 6.2L17.91 7.7L20.58 5.03C20.86 5.5 21 6 21 6.63C21 8.55 19.45 10.1 17.5 10.1Z" />
    </svg>);
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
                });
                history.push('/');
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

            const devOptionsContent = (
                <>
                    <span>Developer Options</span>
                    <WrenchIcon />
                </>
            );

            const addGroupContent = (
                <>
                    <span>Create Group</span>
                    <AddIcon />
                </>
            );

            if (user.auth.isDeveloper) {
                devLink = <PageLink to="/dev/" name="Developer Options" content={devOptionsContent} />;
            }

            accountLink = [
                ABSwitch("", <PageLink key={0} to="/home/" name="Home page" />, "homePage"),
                <PageLink key={1} to="/account/" name="Account" />,
                <PageLink key={2} to="/group/new/" name="Create Group" content={addGroupContent} />,
                <PageLink key={3} to="/makeops/" name="Make Operations" />,
            ];
            logoutLink = <PageButton onClick={() => { logoutExecutor.mutate({}); }} name="Logout" />;
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
            <div style={{ display: "flex", flexGrow: 2, flexDirection: "column", overflowY: "auto", marginBottom: "50px" }}>
                {accountLink}
                {devLink}
                <div className={styles.GroupLinks}>
                    {groupLinks}
                </div>
                <PageButton href="https://discord.gametools.network/" name="Need help?" />
                {logoutLink}
                
            </div>
            <p style={{ paddingLeft: "48px", fontSize: "12px" }}>v{APP_VERSION} channel {(getChannel() === 0) ? "A" : "B"}</p>
        </div>
    );

}