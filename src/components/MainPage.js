import React from "react";
import styles from "./MainPage.module.css";
import { OperationsApi } from "../api";

function ListItem(props) {
    return (
        <div className={styles.ListItem}>
            <h2>{props.header}</h2>
            <p>{props.children}</p>
        </div>
    );
}

function LoginButton() {
    return (
        <a className={styles.LoginButton} href={OperationsApi.constructApiUrl("login")}>Log in</a>
    );
}

export function MainPageComponent(props) {
    return (
        <div className={styles.MainPage}>
            <div className={styles.MainPageCard}>
                <div className={styles.titleBlock}>
                    <div className={styles.titleContent}>
                        <h1>A new way to manage your Battlefield 1 servers</h1>
                        <p>Server Manager is a new Gametools & BFBan service created by Community Network</p>
                        <LoginButton />
                    </div>
                </div>
                <div className={styles.listing}>
                    <h2>Features</h2>
                    <ListItem header="BFBan Anti Cheat">Protect your servers against hackers confirmed on www.bfban.com</ListItem>
                    <ListItem header="Unlimited Global V-Ban list">Ban as many players as you want to on all your servers with virtal ban list.</ListItem>
                    <ListItem header="High ping players kick">Automaticaly kick players from your servers based on ping threshold.</ListItem>
                    <ListItem header="Discord tools to maintain server">Contoll your servers right in the Discord based on roles.</ListItem>
                    <ListItem header="Server action logging">See full logs on every actions made on your servers and groups.</ListItem>
                    <ListItem header="Full controll over your servers">Admins can controll server with same functions as in game.</ListItem>
                </div>
            </div>
        </div>
    );
}
