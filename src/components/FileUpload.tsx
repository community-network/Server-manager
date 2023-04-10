import styles from "./FileUpload.module.css";

import * as React from "react";
import { utils, read } from "xlsx";

export function FileToJson(props: {
  callback?: { (data: unknown[]): void };
}): React.ReactElement {
  return (
    <input
      className={styles.FileUpload}
      type="file"
      accept=".csv,.xlsx,.xls"
      onChange={(e) => {
        const files = e.target.files,
          f = files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
          const data = e.target.result;
          const readedData = read(data, { type: "binary" });
          const sheetName = readedData.SheetNames[0];
          const worksheet = readedData.Sheets[sheetName];
          const dataParse = utils.sheet_to_json(worksheet);
          props.callback(dataParse);
        };
        reader.readAsBinaryString(f);
      }}
    />
  );
}
