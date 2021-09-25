import React, { useState } from "react";
import { Route, Switch, useLocation, Redirect } from 'react-router-dom';
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

export default function ViewHandler(props) {

    let defaultSidebarVisible = localStorage.getItem('isSideBarVisible');
    defaultSidebarVisible = (!!defaultSidebarVisible) ? (defaultSidebarVisible === "1") ? true: false : true;

    const [sidebarVisible, hideSidebar] = useState(defaultSidebarVisible);
    const { isError, isLoading, data: user } = useCorruentUserHook();
    const location = useLocation();

    const setHideSidebar = () => {
        let isVisible = !sidebarVisible;
        localStorage.setItem('isSideBarVisible', isVisible ? "1" : "0");
        hideSidebar(isVisible);
    };

    let redirector = (isError || (!isLoading  && !user.auth.signedIn && location.pathname !== "/")) ? <Redirect to="/" /> : null;

    return (
        <Switch>
            {redirector}
            <Route exact path="/" component={Main} />
            <Route>
                <TopBar hideSidebar={setHideSidebar}/>
                <div style={{display: "flex", flexDirection: "row"}}>
                    <Sidebar visible={sidebarVisible} />
                    <AnimatedViews location={location} />
                </div>
            </Route>
        </Switch>
    );
}

function useCorruentUserHook() {
    return useQuery('user', () => OperationsApi.user, { retry: 0, })
}

function AnimatedViews({ location }) {

    return (
        <TransitionGroup component={PageContainer}>
            <CSSTransition key={location.key} classNames="fade" timeout={200}>
                <PageColumn>
                    <Views />
                </PageColumn>
            </CSSTransition>
        </TransitionGroup>
    );
    
}

function Views() {

    return (

        <Switch>
            <Route exact path="/websocket/:sid/" component={WebSocketTest} />
            <Route exact path="/account/" component={Account} />

            <Route exact path="/makeops/:gid/" component={MakeOps} />

            <Route exact path="/server/:sid/" component={Server} />
            <Route exact path="/server/:sid/delete" component={DeleteServer} />
            <Route exact path="/server/:sid/:tab/" component={Server} />

            <Route exact path="/statusserver/:sid/" component={StatusOnlyServer} />
            <Route exact path="/statusserver/:sid/:tab/" component={StatusOnlyServer} />

            <Route exact path="/group/new/" component={AddGroup} />
            <Route exact path="/group/:gid/" component={Group} />
            <Route exact path="/cookieinfo/" component={CookieInfo} />
            <Route exact path="/statusbotinfo/" component={StatusBotInfo} />

            <Route exact path="/group/:gid/add/server" component={AddGroupServer} />
            <Route exact path="/group/:gid/add/admin/" component={AddGroupAdmin} />
            <Route exact path="/group/:gid/add/owner/" component={AddGroupOwner} />

            <Route exact path="/group/:gid/edit/" component={EditGroup} />
            <Route exact path="/group/:gid/delete" component={DeleteGroup} />

            <Route exact path="/dev/" component={Developer} />
            <Route exact path="/man/" component={Manager} />

        </Switch>
    );

}