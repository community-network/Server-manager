import React, { useState } from "react";
import { useQuery } from 'react-query';
import { Redirect } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, ButtonLink, ButtonRow, GroupRow, Row } from "../components";


export function Developer() {

    const { isLoading, error, data } = useQuery('devGroups', () => OperationsApi.getDevGroups())
    
    var groups = [];

    if (!isLoading && !error && data) {
        data.data.map((g, i) => {
            groups.push(<GroupRow key={i} group={g} />);
        });
    } else if (error) {
        return <Redirect to="/" />;
    }

    return (
        <Row>
            <Column>
                <Header>
                    <h2>Developer Options</h2>
                </Header>
                <Card>
                    <h2>List of Groups</h2>
                    {groups}
                    <ButtonRow>
                        <ButtonLink name="Add new Group" to="/group/new/" />
                    </ButtonRow>
                </Card>
            </Column>
            <Column>

            </Column>
        </Row>
    );

}