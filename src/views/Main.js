import React from "react";
import { useQuery } from 'react-query';
import { Navigate } from 'react-router-dom';
import { OperationsApi } from "../api";

import { MainPageComponent } from "../components";

export default function Main() {

    const { isError, data: user, isLoading } = useQuery('user', () => OperationsApi.user);

    if (!isLoading && !isError && user && user.auth.signedIn) {
        return <Navigate to="/account/" />
    }

    return (
        <MainPageComponent />
    );
}