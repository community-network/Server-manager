import React, { Component } from 'react';
import "./styles.css";

import { OperationsApi } from "../api";

export default class LogPanel extends Component {
    static contextType = OperationsApi;
    state = { logs: [], ready: false, user: null };
    async getLogs(user) {
        let api = this.context;
        let result = await api.getLogs();
        let logs = [];
        if (result.logs)
            logs = result.logs;
        this.setState(s => ({ ...s, logs: logs, user: user, ready: true }));
    }
    render() {
        let api = this.context;
        if (!this.state.ready) {
            api.user.then(u => this.getLogs(u));
            return "Loading..";
        }
        if (this.state.user && this.state.user.auth.is_admin && this.state.logs) {
            return (
                <table className="logs">
                    <thead>
                        <th>Action</th>
                        <th>Admin</th>
                        <th>Server</th>
                        <th>Reason</th>
                        <th>Player</th>
                    </thead>
                    <tbody>
                        {this.state.logs.map((log, i) => (<LogItem log={log} key={i} />))}
                    </tbody>
                </table>
            );
        } else {
            window.location = "/";
            return "";
        }
    }
}

function LogItem(props) {
    let server = (props.log.inServer === "Community Operations #1") ? "Europe" : "North America";
    let action = props.log.action;

    switch (props.log.action) {
        case "movePlayer":
            action = "Move";
            break;
        case "addServerBan":
            action = "Ban";
            break;
        case "kickPlayer":
            action = "Kick";
            break;
        default:
            break;
    }

    return <tr>
        <td>{action}</td>
        <td>{props.log.adminName}</td>
        <td>{server}</td>
        <td>{props.log.reason}</td>
        <td>{props.log.toPlayer}</td>
    </tr>;
}