import * as React from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { OperationsApi } from "../api";

import { MainPageComponent } from "../components";
import { IUserInfo } from "../ReturnTypes";

export default function Main() {
  const {
    isError,
    data: user,
    isLoading,
  }: UseQueryResult<IUserInfo, { code: number; message: string }> = useQuery(
    ["user"],
    () => OperationsApi.user,
  );

  if (!isLoading && !isError && user && user.auth.signedIn) {
    return <Navigate to="/account/" />;
  }

  return <MainPageComponent />;
}
