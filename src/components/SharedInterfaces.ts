import * as React from "react";

export interface IDefaultInterface {
  children?:
    | React.ReactElement
    | boolean
    | React.ReactFragment
    | React.ReactPortal;
}

export interface IDefaultWithStyleInterface {
  children?:
    | React.ReactElement
    | boolean
    | React.ReactFragment
    | React.ReactPortal;
  style?: React.CSSProperties;
}
