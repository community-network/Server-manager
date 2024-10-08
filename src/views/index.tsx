import { useQuery, UseQueryResult } from "@tanstack/react-query";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { IUserInfo } from "../api/ReturnTypes";
import { OperationsApi } from "../api/api";
import { useExternalScript } from "../components/Functions";

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

  const externalScript =
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6546858755151450";
  useExternalScript(externalScript, true);

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
  return useQuery({
    queryKey: ["user"],
    queryFn: () => OperationsApi.user,
    retry: 0,
  });
}
