import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { OperationsApi } from "../api/api";

import { IUserInfo } from "../api/ReturnTypes";
import { MainPageComponent } from "../components";

export default function Main() {
  const {
    isError,
    data: user,
    isLoading,
  }: UseQueryResult<IUserInfo, { code: number; message: string }> = useQuery({
    queryKey: ["user"],
    queryFn: () => OperationsApi.user
  });

  if (!isLoading && !isError && user && user.auth.signedIn) {
    return <Navigate to="/account/" />;
  }

  return <MainPageComponent />;
}
