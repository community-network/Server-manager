import * as React from "react";

/* eslint-disable @typescript-eslint/naming-convention */
declare module "react" {
  interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string;
    disabled?: boolean;
  }

  interface HTMLAttributes<T> {
    checked?: boolean;
    value?: string;
  }
}
