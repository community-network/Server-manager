import React, { Component } from 'react';
import "./ServerPanel.css";

import { OperationsApi } from "../api";

export default class ServerPanel extends Component {
  static contextType = OperationsApi;

  state = { ready: false, status: { msg: "", type: "" } };
  nickname = "";

  kickPlayer = this.kickPlayer.bind(this);
  banPlayer = this.banPlayer.bind(this);
  giveVip = this.giveVip.bind(this);
  inputNickname = this.inputNickname.bind(this);
  movePlayer = this.movePlayer.bind(this);

  kickPlayer() {
    let api = this.context;
    if (this.nickname === "") return;
    var reason = window.prompt("Please enter reason to kick", "Kicked by admin.");
    this.updateStatus({ msg: "Executing", type: "warn" });
    api.kickPlayer(this.nickname, reason || "").then(result => this.checkError(result));
  }
  banPlayer() {
    let api = this.context;
    if (this.nickname === "") return;
    let state = window.confirm("Are you sure you want to ban " + this.nickname + "?");
    if (state) {
        this.updateStatus({ msg: "Executing", type: "warn" });
        api.banPlayer(this.nickname).then(result => this.checkError(result));
    }
  }
  movePlayer() {
    let api = this.context;
    if (this.nickname === "") return;
    var side = window.prompt("Please, enter side (1 or 2)", "1");
    if (side === "1" || side === "2") {
        this.updateStatus({ msg: "Executing", type: "warn" });
        api.movePlayer(side, this.nickname).then(result => this.checkError(result));
    }
  }
  giveVip() {
    let api = this.context;
    if (this.nickname === "") return;
    let state = window.confirm("Give Vip to " + this.nickname + "?");
    if (state) {
        this.updateStatus({ msg: "Executing", type: "warn" });
        let result = api.addVip(this.nickname).then(result => this.checkError(result));
    }
  }
  inputNickname(ev) {
    this.nickname = ev.target.value;
  }
  checkError(result) {
    if (!result) {
        this.updateStatus("Api currently not working.");
    } else if (result.hasOwnProperty("error")) {
        this.updateStatus({ msg: result.error, type: "error" });
    } else {
        this.updateStatus(JSON.stringify(result,null,'\t'));
    }
  }
  updateStatus(status) {
    this.setState(s => ({ ready: s.ready, status: status, user: s.user }));
  }
  render() {
    let api = this.context;
    api.user.then((u) => (!this.state.ready) ? this.setState({ready: true, user: u}) : null);
    if (!this.state.ready) {
        return "Loading..";
    }
    if (this.state.user.auth.is_admin) {
        return (
        <React.Fragment>
          <div className="serverpanel">
            <input type="text" placeholder="Nickname" onChange={this.inputNickname} />
            <input type="button" value="Ban" onClick={this.banPlayer} />
            <input type="button" value="Kick" onClick={this.kickPlayer} />
            <input type="button" value="Move" onClick={this.movePlayer} />
            <input type="button" value="Give Vip" onClick={this.giveVip} title="Function is disabled as it may cause issues." disabled />
          </div>
          <div className="statusbar">
            <Status text={this.state.status.msg} type={this.state.status.type} />
          </div>
         </React.Fragment>
        )
    } else if(!this.state.user.is_signed_in) {
        api.openLoginPage();
    } else {
      return "No premissions.";
    }
  }
}

function Status(props) {
  return (
    <div className={"status " + props.type}>
    {props.text}
    </div>
  );
}