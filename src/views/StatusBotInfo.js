import React from "react";
import { Column, Card, Header, Row } from "../components";
import '../locales/config';
import { useTranslation } from 'react-i18next';

export function StatusBotInfo() {
    const { t } = useTranslation();
    
    return (
        <Row>
            <Column>
                <Header>
                    <h2>{t("statusBotInfo.main")}</h2>
                </Header>
                <Card>
                    <h4 style={{ margin: 0 }}>
                        {t("statusBotInfo.0")}
                    </h4>
                    <h5 style={{paddingTop: '.5rem'}}>
                        {t("statusBotInfo.1")}<a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer">discord.com/developers/applications</a>
                    </h5>
                    <img style={{maxWidth: '20rem'}} src="/img/statusBotInfo/1.png"/>
                    <h5 style={{paddingTop: '.5rem'}}>
                        {t("statusBotInfo.2")}
                    </h5>
                    <img style={{maxWidth: '20rem'}} src="/img/statusBotInfo/2.png"/>
                    <h5 style={{paddingTop: '.5rem'}}>
                        {t("statusBotInfo.3")}
                    </h5>
                    <img style={{maxWidth: '20rem'}} src="/img/statusBotInfo/3.png"/>
                    <h5 style={{paddingTop: '.5rem'}}>
                        {t("statusBotInfo.4")}
                    </h5>
                    <div style={{ display: "flex" }}>
                        <img style={{maxWidth: '20rem', marginRight: "1rem"}} src="/img/statusBotInfo/4.png"/>
                        <img style={{maxWidth: '20rem'}} src="/img/statusBotInfo/5.png"/>
                    </div>
                    <h4 style={{ margin: 0, marginTop: "1.5rem" }}>
                        {t("statusBotInfo.5")}
                    </h4>
                    <h5 style={{paddingTop: '.5rem'}}>
                        {t("statusBotInfo.6")}
                    </h5>
                    <img style={{maxWidth: '20rem'}} src="/img/statusBotInfo/6.png"/>
                    <h5 style={{paddingTop: '.5rem'}}>
                        {t("statusBotInfo.7")}
                    </h5>
                    <img style={{maxWidth: '20rem'}} src="/img/statusBotInfo/7.png"/>
                    <h5 style={{paddingTop: '.5rem'}}>
                        {t("statusBotInfo.8")}
                    </h5>
                    <img style={{maxWidth: '20rem'}} src="/img/statusBotInfo/8.png"/>
                    <h5 style={{paddingTop: '.5rem'}}>
                        {t("statusBotInfo.9")}
                    </h5>
                </Card>
            </Column>
        </Row>
    );

}