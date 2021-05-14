import React from "react";
import { useQuery } from 'react-query';
import { Redirect } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, ButtonLink, ButtonRow, GroupRow, Row } from "../components";
import '../locales/config';
import { useTranslation } from 'react-i18next';

export function Developer() {
    const { t } = useTranslation();
    const { isLoading, isError, data } = useQuery('devGroups', () => OperationsApi.getDevGroups())
    
    var groups = [];

    if (!isLoading && !isError && data) {
        data.data.map((g, i) => {
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
                <Card>
                    <h2>{t("dev.listGroups")}</h2>
                    {groups}
                    <ButtonRow>
                        <ButtonLink name={t("dev.addGroup")} to="/group/new/" />
                    </ButtonRow>
                </Card>
            </Column>
            <Column>

            </Column>
        </Row>
    );

}