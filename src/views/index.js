import React from "react";
import { Route, Switch } from 'react-router-dom';

import Home from "./Home";
import Account from "./Account";
import { Developer } from "./Developer";
import { Server } from "./Server";
import { Group, AddGroupOwner, EditGroup, AddGroupAdmin, AddGroup, DeleteGroup } from "./Group";



export default function Views(props) {
    return (
        <Switch location={props.location}>

            <Route exact path="/" component={Home} />

            <Route exact path="/account/" component={Account} />

            <Route exact path="/server/:sid/" component={Server} />
            <Route exact path="/server/:sid/manage/" />
            <Route exact path="/server/:sid/:action/:eaid/" />

            <Route exact path="/group/new/" component={AddGroup} />
            <Route exact path="/group/:gid/" component={Group} />

            <Route exact path="/group/:gid/add/server" />
            <Route exact path="/group/:gid/add/admin/" component={AddGroupAdmin} />
            <Route exact path="/group/:gid/add/owner/" component={AddGroupOwner} />

            <Route exact path="/group/:gid/edit/" component={EditGroup} />
            <Route exact path="/group/:gid/logs/" />
            <Route exact path="/group/:gid/delete" component={DeleteGroup} />

            <Route exact path="/dev/" component={Developer} />

        </Switch>
    );
}