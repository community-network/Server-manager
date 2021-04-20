import React from "react";
import { Route, Switch } from 'react-router-dom';

import Account from "./Account";
import { Developer } from "./Developer";
import { Server, ServerAction } from "./Server";
import { Group, AddGroupOwner, EditGroup, AddGroupAdmin, AddGroup, DeleteGroup, AddGroupServer } from "./Group";

//import ABSwitch from "../testing/ABtesting";

export default function Views(props) {
    return (
        <Switch>

            <Route exact path="/account/" component={Account} />

            <Route exact path="/server/:sid/" component={Server} />
            <Route exact path="/server/:sid/:action/:eaid/" component={ServerAction} />

            <Route exact path="/group/new/" component={AddGroup} />
            <Route exact path="/group/:gid/" component={Group} />

            <Route exact path="/group/:gid/add/server" component={AddGroupServer} />
            <Route exact path="/group/:gid/add/admin/" component={AddGroupAdmin} />
            <Route exact path="/group/:gid/add/owner/" component={AddGroupOwner} />

            <Route exact path="/group/:gid/edit/" component={EditGroup} />
            <Route exact path="/group/:gid/delete" component={DeleteGroup} />

            <Route exact path="/dev/" component={Developer} />

        </Switch>
    );
}