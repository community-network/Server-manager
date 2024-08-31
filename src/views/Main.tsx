import { useQuery, UseQueryResult } from "@tanstack/react-query";
import * as React from "react";
import { Navigate } from "react-router-dom";
import { OperationsApi } from "../api/api";

import { IUserInfo } from "../api/ReturnTypes";
import { MainPageComponent } from "../components";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _: React.div;

export default function Main() {
  const {
    isError,
    data: user,
    isLoading,
  }: UseQueryResult<IUserInfo, { code: number; message: string }> = useQuery({
    queryKey: ["user"],
    queryFn: () => OperationsApi.user,
  });

  if (!isLoading && !isError && user && user.auth.signedIn) {
    return <Navigate to="/account/" />;
  }

  return <MainPageComponent />;
}
