import React from "react";
import { useQuery } from 'react-query';
import { Redirect } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, ButtonLink, ButtonRow, GroupRow, Row } from "../components";
import '../locales/config';
import { useTranslation } from 'react-i18next';

export function CookieInfo() {
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
                    <h2>{t("cookieInfo.main")}</h2>
                </Header>
                <Card>
                    <h5 style={{paddingTop: '.5rem'}}>
                        {t("cookieInfo.0")}<a href="https://www.origin.com/" target="_blank" rel="noopener noreferrer">Origin.com</a>{t("cookieInfo.1")}
                    </h5>
                    <h5 style={{paddingTop: '.5rem'}}>
                        {t("cookieInfo.2")}
                    </h5>
                    <h5 style={{paddingTop: '.5rem'}}>
                        {t("cookieInfo.3")}
                    </h5>
                    <img style={{maxWidth: '20rem'}} src="/img/cookieInfo/1.png"/>
                    <h5 style={{paddingTop: '1.5rem'}}>
                        {t("cookieInfo.4")}
                    </h5>
                    <img style={{maxWidth: '20rem'}} src="/img/cookieInfo/2.png"/>
                    <h5 style={{paddingTop: '1.5rem'}}>
                        {t("cookieInfo.5")}
                    </h5>
                    <img style={{maxWidth: '20rem'}} src="/img/cookieInfo/3.png"/>
                    <h5 style={{paddingTop: '1.5rem'}}>
                        {t("cookieInfo.6")}<br />{t("cookieInfo.7")}
                    </h5>
                </Card>
            </Column>
        </Row>
    );

}