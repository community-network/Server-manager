import React from "react";
import { useQuery } from 'react-query';
import { Redirect } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, ButtonLink, ButtonRow, Row, TextInput } from "../components";
import '../locales/config';
import { useTranslation } from 'react-i18next';


import { GroupRow } from "../Group/Group";

export function Developer() {
    const { t } = useTranslation();
    const [searchWord, setSearchWord] = React.useState("");
    const { isLoading, isError, data } = useQuery('devGroups', () => OperationsApi.getDevGroups())
    
    var groups = [];

    if (!isLoading && !isError && data) {
        data.data.filter(p => p.groupName.toLowerCase().includes(searchWord.toLowerCase())).map((g, i) => {
            groups.push(<GroupRow key={i} group={g} />);
        });
    } else if (isError) {
        return <Redirect to="/" />;
    }

    return (
        <Row>
            <Column>
                <Header>
                    <h2>{t("dev.main")}</h2>
                </Header>
                <Card style={{ paddingTop: "5px" }}>
                    <ButtonRow>
                        <h2 style={{ marginTop: "8px", marginRight: "10px" }}>{t("dev.listGroups")}</h2>
                        <TextInput name={t("search")} callback={(v) => setSearchWord(v.target.value)} />
                    </ButtonRow>
                    
                    <ButtonRow>
                        <ButtonLink name={t("dev.addGroup")} to="/group/new/" />
                    </ButtonRow>

                    {groups}
                </Card>
            </Column>
            <Column>

            </Column>
        </Row>
    );

}