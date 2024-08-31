import * as React from "react";
import * as styles from "./PageContainer.module.css";
import { IDefaultInterface } from "./SharedInterfaces";

export function PageContainer(props: IDefaultInterface): React.ReactElement {
  return <div className={styles.PageContainer}>{props.children}</div>;
}

export function PageColumn(props: IDefaultInterface): React.ReactElement {
  return (
    <main role="main" className={styles.PageColumn}>
      {props.children}
    </main>
  );
}
