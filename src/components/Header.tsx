import * as React from "react";
import styles from "./Header.module.css";
import { IDefaultInterface } from "./SharedInterfaces";

export function Header(props: IDefaultInterface): React.ReactElement {
  return <div className={styles.Header}>{props.children}</div>;
}

export function SlimHeader(props: IDefaultInterface): React.ReactElement {
  return <div className={styles.SlimHeader}>{props.children}</div>;
}
