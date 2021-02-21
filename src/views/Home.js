import React, { useState } from "react";
import { useQuery } from 'react-query';
import { Redirect } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, Button, ButtonRow, Row } from "../components";


export default function Home() {

    const { error: userError, data: user, isLoading } = useQuery('user', () => OperationsApi.user);
    var loginButton = <Button name="Loading.." />;

    if ((!isLoading && !userError && user && !user.auth.signedIn) || (userError && !isLoading)) {
        loginButton = <Button name="Login with Discord" callback={() => { OperationsApi.openLoginPage() }} />;
    } else if (!isLoading && !userError && user && user.auth.signedIn) {
        return <Redirect to="/account/" />
    }

    return (
        <Row>
            <Column>
                <Header>
                    <h2>Server Panel</h2>
                </Header>
                <Card style={{ maxWidth: '800px' }}>
                    <h2>Introducing new tools</h2>
                    <p>Community Network developed server panel to controll Battlefield 1 servers with our internal APIs. With server panel you can manage your servers and setup Discord integration. Instantly add and remove server admins, via the server panel or discord roles. Your admins can ban, kick, move players, add VIPs, revoke bans, watch ban list with more details, download ban and vip lists. As an owner you can access logs and see every action that was made via server panel. We integrating our tools tightly, providing Discord commands to administrate your servers.</p>
                    <p>Contact us to get unlimited free access!</p>
                    <ButtonRow>{loginButton}</ButtonRow>
                </Card>
            </Column>
        </Row>
    );

}