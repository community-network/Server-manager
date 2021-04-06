import React, { useState } from "react";
import { useQuery } from 'react-query';
import { Redirect } from 'react-router-dom';
import { OperationsApi } from "../api";
import { Column, Card, Header, Button, ButtonRow, Row } from "../components";

import { MainPageComponent } from "../components";

export default function Main() {

    const { isError, data: user, isLoading } = useQuery('user', () => OperationsApi.user);

    if (!isLoading && !isError && user && user.auth.signedIn) {
        return <Redirect to="/account/" />
    }

    return (
        <MainPageComponent />
    );
}