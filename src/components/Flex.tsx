import * as React from "react";

import * as styles from "./Flex.module.css";
import { IDefaultInterface } from "./SharedInterfaces";

export function Column(props: IDefaultInterface): React.ReactElement {
  return <div className={styles.Column}>{props.children}</div>;
}

export function Row(props: IDefaultInterface): React.ReactElement {
  return <div className={styles.Row}>{props.children}</div>;
}

export function ScrollRow(props: IDefaultInterface): React.ReactElement {
  return <div className={styles.scrollRow}>{props.children}</div>;
}

export function TopRow(props: IDefaultInterface): React.ReactElement {
  return <div className={styles.topRow}>{props.children}</div>;
}

export function Grow(props: IDefaultInterface): React.ReactElement {
  return <div className={styles.Grow}>{props.children}</div>;
}
