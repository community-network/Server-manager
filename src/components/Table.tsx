import * as React from "react";
import styles from "./Table.module.css";

export function ClickableHead(props: {
  onClick: React.MouseEventHandler;
  children: React.ReactElement | React.ReactElement[] | string;
  current: boolean;
}): React.ReactElement {
  return (
    <th className={styles.Header} onClick={props.onClick}>
      {props.children}{" "}
      {props.current ? (
        <svg
          fill="white"
          height="12"
          viewBox="8 5 18 12"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M7 10l5 5 5-5z" />
          <path d="M0 0h24v24H0z" fill="none" />
        </svg>
      ) : (
        ""
      )}
    </th>
  );
}
