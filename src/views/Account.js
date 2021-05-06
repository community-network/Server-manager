import React from "react";
import { useQuery } from 'react-query';
import { Redirect } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, CardRow, UserRow, Row } from "../components";
import '../locales/config';
import { useTranslation } from 'react-i18next';

export default function Account() {
    const { t } = useTranslation();
    const { error: userError, data: user, isLoading } = useQuery('user', () => OperationsApi.user);
    var userLine = "";

    if (!userError && !isLoading && user) {
        if (!user.auth.signedIn) {
            return <Redirect to="/" />;
        } else {
            userLine = <UserRow discord={user.discord} />;
        }
    } else if (userError && !isLoading) {
        return <Redirect to="/" />;
    }

    return (
        <Row>
            <Column>
                <Header>
                    <h2>{t("account.main")}</h2>
                </Header>
                <Card>
                    <h2>{t("account.discordProfile")}</h2>
                    {userLine}
                </Card>
            </Column>
            <Column>
                <Header />
                <Card>
                    <h2>{t("account.permissions.main")}</h2>
                    <CardRow>{t("account.permissions.admin")}</CardRow>
                    <CardRow>{t("account.permissions.server")}</CardRow>
                    <CardRow>{t("account.permissions.system")}</CardRow>
                </Card>
            </Column>
        </Row>
    );

}