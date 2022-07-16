import React, { useState } from "react";
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { useQuery } from 'react-query';
import Account from "./Account";
import { Developer } from "../Developer/View";
import { Manager } from "../Manager/View";
import { Server, DeleteServer } from "../Server/View";
import { StatusOnlyServer } from "../Server/StatusOnly";
import { Group, AddGroupOwner, EditGroup, AddGroupAdmin, AddGroup, DeleteGroup, AddGroupServer, MakeOps } from "../Group/View";
import { PageContainer, PageColumn } from "../components";
import { CookieInfo } from "./CookieInfo";
import { WebSocketTest } from "./WebSocketTest";

import { OperationsApi } from "../api";
import Main from "./Main";
import { Sidebar, TopBar } from "../components";
import { StatusBotInfo } from "./StatusBotInfo";

export function PageLayout(props) {
    let defaultSidebarVisible = localStorage.getItem('isSideBarVisible');
    defaultSidebarVisible = (!!defaultSidebarVisible) ? (defaultSidebarVisible === "1") ? true: false : true;

    const [sidebarVisible, hideSidebar] = useState(defaultSidebarVisible);

    const setHideSidebar = () => {
        let isVisible = !sidebarVisible;
        localStorage.setItem('isSideBarVisible', isVisible ? "1" : "0");
        hideSidebar(isVisible);
    };
    return (
        <>
            <TopBar hideSidebar={setHideSidebar}/>
            <div style={{display: "flex", flexDirection: "row"}}>
                <Sidebar visible={sidebarVisible} />
                <AnimatedViews />
            </div>
        </>
    )
}

export default function ViewHandler(props) {
    const { isError, isLoading, data: user } = useCorruentUserHook();
    var history = useNavigate();

    const location = useLocation();
    let redirector = (isError || (!isLoading  && !user.auth.signedIn && location.pathname !== "/")) ? history("/") : null;
    return (
        <Routes>
            {redirector}
            <Route exact path="/" element={<Main/>} />
            <Route path="/*" element={<PageLayout/>} />
        </Routes>
    );
}

function useCorruentUserHook() {
    return useQuery('user', () => OperationsApi.user, { retry: 0, })
}

function AnimatedViews(props) {
    const location = useLocation();

    return (
        <TransitionGroup component={PageContainer}>
            <CSSTransition key={location.key} classNames="fade" timeout={200}>
                <PageColumn>
                    <Routes>
                        <Route exact path="/websocket/:sid/" element={<WebSocketTest/>} />
                        <Route exact path="/account/" element={<Account/>} />

                        <Route exact path="/makeops/:gid/" element={<MakeOps/>} />

                        <Route exact path="/server/:sid/" element={<Server/>} />
                        <Route exact path="/server/:sid/delete" element={<DeleteServer/>} />
                        <Route exact path="/server/:sid/:tab/" element={<Server/>} />

                        <Route exact path="/statusserver/:sid/" element={<StatusOnlyServer/>} />
                        <Route exact path="/statusserver/:sid/:tab/" element={<StatusOnlyServer/>} />

                        <Route exact path="/group/new/" element={<AddGroup/>} />
                        <Route exact path="/group/:gid/" element={<Group/>} />
                        <Route exact path="/cookieinfo/" element={<CookieInfo/>} />
                        <Route exact path="/statusbotinfo/" element={<StatusBotInfo/>} />
        
                        <Route exact path="/group/:gid/add/server" element={<AddGroupServer/>} />
                        <Route exact path="/group/:gid/add/admin/" element={<AddGroupAdmin/>} />
                        <Route exact path="/group/:gid/add/owner/" element={<AddGroupOwner/>} />

                        <Route exact path="/group/:gid/edit/" element={<EditGroup/>} />
                        <Route exact path="/group/:gid/delete" element={<DeleteGroup/>} />

                        <Route exact path="/dev/" element={<Developer/>} />
                        <Route exact path="/man/" element={<Manager/>} />
                    </Routes>
                </PageColumn>
            </CSSTransition>
        </TransitionGroup>
    );
    
}