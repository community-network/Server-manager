import * as React from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { IUserInfo } from "../ReturnTypes";
import { OperationsApi } from "../api";
import { useTranslation } from "react-i18next";

// Pages
const Main = React.lazy(() => import("./Main"));
const LoggedIn = React.lazy(() => import("./LoggedIn"));

export default function ViewHandler() {
  const { isError, isLoading, data: user } = useCorruentUserHook();
  const history = useNavigate();

  const location = useLocation();
  const { t } = useTranslation();
  const redirector =
    isError ||
    (!isLoading && user && !user.auth.signedIn && location.pathname !== "/")
      ? history("/")
      : null;
  return (
    <React.Suspense fallback={<div>{t("loading")}</div>}>
      <Routes>
        <>
          {redirector}
          <Route path="/" element={<Main />} />
          <Route path="/*" element={<LoggedIn />} />
        </>
      </Routes>
    </React.Suspense>
  );
}

function useCorruentUserHook(): UseQueryResult<IUserInfo> {
  return useQuery(["user"], () => OperationsApi.user, { retry: 0 });
}
