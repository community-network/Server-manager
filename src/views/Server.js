import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from 'react-query';
import { Redirect, useHistory } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, ServerRotation, ServerInfoHolder, ButtonLink, ButtonRow, Button, UserStRow, Row, ServerRow, Grow, TextInput, SmallButton, ServerInfo } from "../components";


export function Server(props) {
    var sid = props.match.params.sid;

    const { error: serverError, data: server } = useQuery('server' + sid, () => OperationsApi.getServer(sid), { staleTime: 60000 });
    //const { error: gameError, data: runningGame } = useQuery('serverGame' + sid, () => OperationsApi.getServerGame(sid), { staleTime: 60000 });

    var serverCard = "";

    // runningGame["servers"][0]

    if (!serverError && server) {
        serverCard = (
            <>
                <Column>
                    <Header>
                        <h2>Dashboard</h2>
                    </Header>
                    <Card>
                        <h2>Server info</h2>
                        <p>Server info</p>
                        <ServerInfoHolder>
                            <ServerRotation game={{}} /> 
                        </ServerInfoHolder>
                    </Card>
                </Column>
                <Column>
                    <Header />
                    <Card>
                        <h2>Discord Integration</h2>
                        <p>Servers can be attached to Discord bots. <br /> Main bot settings for current server.</p>
                        <ServerInfoHolder>
                            <ServerInfo server={server} />
                        </ServerInfoHolder>
                    </Card>
                </Column>
            </>
        );
    }

    return (
        <Row>
            {serverCard}
        </Row>
    );

}