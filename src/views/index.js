import React from "react";
import { Route, Switch, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from "react-transition-group";

import Account from "./Account";
import { ApiInfo } from "./ApiInfo"
import { Developer } from "./Developer";
import { Server } from "../Server/View";
import { Group, AddGroupOwner, EditGroup, AddGroupAdmin, AddGroup, DeleteGroup, AddGroupServer, MakeOps } from "./Group";
import { PageContainer, PageColumn } from "../components";
import { CookieInfo } from "./CookieInfo";


//import ABSwitch from "../testing/ABtesting";

export default function Views(props) {
    const location = useLocation();

    return (
        <TransitionGroup component={PageContainer}>
            <CSSTransition key={location.key} classNames="fade" timeout={200}>
                <PageColumn>

                    <Switch>

                        <Route exact path="/account/" component={Account} />

                        <Route exact path="/server/:sid/" component={Server} />
                        <Route exact path="/server/:sid/:tab/" component={Server} />

                        <Route exact path="/group/new/" component={AddGroup} />
                        <Route exact path="/group/:gid/" component={Group} />
                        <Route exact path="/cookieinfo/" component={CookieInfo} />
                        <Route exact path="/apiinfo/" component={ApiInfo} />

                        <Route exact path="/group/:gid/add/server" component={AddGroupServer} />
                        <Route exact path="/group/:gid/add/admin/" component={AddGroupAdmin} />
                        <Route exact path="/group/:gid/add/owner/" component={AddGroupOwner} />

                        <Route exact path="/group/:gid/edit/" component={EditGroup} />
                        <Route exact path="/group/:gid/delete" component={DeleteGroup} />

                        <Route exact path="/dev/" component={Developer} />

                        <Route exact path="/makeops/" component={MakeOps} />

                    </Switch>
                </PageColumn>
            </CSSTransition>
        </TransitionGroup>
    );
}