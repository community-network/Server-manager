import React, { useState } from "react";
import { useQuery } from 'react-query';
import { Redirect } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, Button, CardRow, UserRow, Row } from "../components";

export default function Account() {

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
                    <h2>Account</h2>
                </Header>
                <Card>
                    <h2>Discord Profile</h2>
                    {userLine}
                </Card>
            </Column>
            <Column>
                <Header />
                <Card>
                    <h2>Permissions</h2>
                    <CardRow>Administrator</CardRow>
                    <CardRow>Server owner</CardRow>
                    <CardRow>System administrator</CardRow>
                </Card>
            </Column>
        </Row>
    );

}