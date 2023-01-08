import * as React from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import Account from "./Account";
import { Developer } from "../Developer/View";
import { Manager } from "../Manager/View";
import { Server, DeleteServer } from "../Server/View";
import { StatusOnlyServer } from "../Server/StatusOnly";
import {
  Group,
  AddGroupOwner,
  EditGroup,
  AddGroupAdmin,
  AddGroup,
  DeleteGroup,
  AddGroupServer,
  MakeOps,
} from "../Group/View";
import { PageContainer, PageColumn } from "../components";
import { CookieInfo } from "./CookieInfo";
import { WebSocketTest } from "./WebSocketTest";

import { OperationsApi } from "../api";
import Main from "./Main";
import { Sidebar, TopBar } from "../components";
import { StatusBotInfo } from "./StatusBotInfo";
import { IUserInfo } from "../ReturnTypes";

export function PageLayout(): React.ReactElement {
  let defaultSidebarVisible: boolean | string =
    localStorage.getItem("isSideBarVisible");
  defaultSidebarVisible = !!defaultSidebarVisible
    ? defaultSidebarVisible === "1"
      ? true
      : false
    : true;

  const [sidebarVisible, hideSidebar] = React.useState(defaultSidebarVisible);
  const { innerWidth: width } = window;

  const mobileHideSidebar = () => {
    if (width < 900) {
      setHideSidebar();
    }
  };

  const setHideSidebar = () => {
    const isVisible = !sidebarVisible;
    localStorage.setItem("isSideBarVisible", isVisible ? "1" : "0");
    hideSidebar(isVisible);
  };
  return (
    <>
      <TopBar hideSidebar={setHideSidebar} />
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Sidebar callback={mobileHideSidebar} visible={sidebarVisible} />
        <AnimatedViews />
      </div>
    </>
  );
}

export default function ViewHandler() {
  const { isError, isLoading, data: user } = useCorruentUserHook();
  const history = useNavigate();

  const location = useLocation();
  const redirector =
    isError ||
    (!isLoading && user && !user.auth.signedIn && location.pathname !== "/")
      ? history("/")
      : null;
  return (
    <Routes>
      <>
        {redirector}
        <Route path="/" element={<Main />} />
        <Route path="/*" element={<PageLayout />} />
      </>
    </Routes>
  );
}

function useCorruentUserHook(): UseQueryResult<IUserInfo> {
  return useQuery(["user"], () => OperationsApi.user, { retry: 0 });
}

function AnimatedViews(): React.ReactElement {
  const location = useLocation();

  return (
    <TransitionGroup component={PageContainer}>
      <CSSTransition key={location.key} classNames="fade" timeout={200}>
        <PageColumn>
          <Routes>
            <Route path="/websocket/:sid/" element={<WebSocketTest />} />
            <Route path="/account/" element={<Account />} />

            <Route path="/makeops/:gid/" element={<MakeOps />} />

            <Route path="/server/:sid/" element={<Server />} />
            <Route path="/server/:sid/delete" element={<DeleteServer />} />
            <Route path="/server/:sid/:tab/" element={<Server />} />

            <Route path="/statusserver/:sid/" element={<StatusOnlyServer />} />
            <Route
              path="/statusserver/:sid/:tab/"
              element={<StatusOnlyServer />}
            />

            <Route path="/group/new/" element={<AddGroup />} />
            <Route path="/group/:gid/" element={<Group />} />
            <Route path="/cookieinfo/" element={<CookieInfo />} />
            <Route path="/statusbotinfo/" element={<StatusBotInfo />} />

            <Route path="/group/:gid/add/server" element={<AddGroupServer />} />
            <Route path="/group/:gid/add/admin/" element={<AddGroupAdmin />} />
            <Route path="/group/:gid/add/owner/" element={<AddGroupOwner />} />

            <Route path="/group/:gid/edit/" element={<EditGroup />} />
            <Route path="/group/:gid/delete" element={<DeleteGroup />} />

            <Route path="/dev/" element={<Developer />} />
            <Route path="/man/" element={<Manager />} />
          </Routes>
        </PageColumn>
      </CSSTransition>
    </TransitionGroup>
  );
}
