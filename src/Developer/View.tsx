import * as React from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { OperationsApi } from "../api";
import {
  Column,
  Card,
  ButtonLink,
  ButtonRow,
  Row,
  TextInput,
} from "../components";
import "../locales/config";
import { useTranslation } from "react-i18next";

import { GroupRow } from "../Group/Group";
import { IDevGroups } from "../ReturnTypes";

export default function Developer() {
  const { t } = useTranslation();
  const [searchWord, setSearchWord] = React.useState("");
  const {
    isLoading,
    isError,
    data,
  }: UseQueryResult<IDevGroups, { code: number; message: string }> = useQuery(
    ["devGroups"],
    () => OperationsApi.getDevGroups(),
  );

  const groups = [];

  if (!isLoading && !isError && data) {
    data.data
      .filter((p) =>
        p.groupName.toLowerCase().includes(searchWord.toLowerCase()),
      )
      .forEach((g, i) => {
        groups.push(<GroupRow key={i} group={g} />);
      });
  } else if (isError) {
    return <Navigate to="/" />;
  }

  return (
    <Row>
      <Column>
        <Card style={{ paddingTop: "5px" }}>
          <h2>{t("dev.main")}</h2>
          <h5>{t("dev.listGroups")}</h5>

          <TextInput
            name={t("search")}
            callback={(v) => setSearchWord(v.target.value)}
          />

          <ButtonRow>
            <ButtonLink name={t("dev.addGroup")} to="/group/new/" />
          </ButtonRow>

          {groups}
        </Card>
      </Column>
    </Row>
  );
}
