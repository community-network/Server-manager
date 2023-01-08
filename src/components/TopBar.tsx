import * as React from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import styles from "./TopBar.module.css";
import { useTranslation } from "react-i18next";

import { OperationsApi } from "../api";
import { IUserInfo } from "../ReturnTypes";

export function TopBar(props: {
  hideSidebar: React.MouseEventHandler<HTMLButtonElement>;
}): React.ReactElement {
  const { t } = useTranslation();

  const {
    error: userError,
    data: user,
    isLoading,
  }: UseQueryResult<IUserInfo, { code: number; message: string }> = useQuery(
    ["user"],
    () => OperationsApi.user,
  );
  let accountPage = <></>;

  if (!userError && !isLoading && user && user.auth.signedIn) {
    accountPage = (
      <Link
        to="/account/"
        title={user.discord.name}
        className={styles.accountPage}
      >
        {/*<span>{user.discord.name}</span>*/}
        <img
          alt={t("imageAlts.userAvatar")}
          src={user.discord.avatar}
          className={styles.Avatar}
        />
        <span className={styles.accountText}>{t("account.main")}</span>
      </Link>
    );
  }

  return (
    <>
      <div className={styles.bar}>
        <button className={styles.showBar} onClick={props.hideSidebar}>
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"
            />
          </svg>
        </button>
        <Link to="/" title="Main page" className={styles.mainPage}>
          <img
            alt={t("imageAlts.main")}
            src="/img/logo-release.png"
            className={styles.logo}
          />
        </Link>
        <div className={styles.filler}></div>

        {accountPage}
      </div>
    </>
  );
}
