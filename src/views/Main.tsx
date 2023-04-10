import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { UseQueryResult } from "@tanstack/react-query/build/lib/types";
import { Navigate } from "react-router-dom";
import { OperationsApi } from "../api/api";

import { MainPageComponent } from "../components";
import { IUserInfo } from "../api/ReturnTypes";

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
