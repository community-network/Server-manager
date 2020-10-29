import React, { Component } from 'react';
import "./ServerPanel.css";

import { OperationsApi } from "../api";

export default class ServerPanel extends Component {
  static contextType = OperationsApi;
  state = { ready: false };
  nickname = "";
  kickPlayer = this.kickPlayer.bind(this);
  banPlayer = this.banPlayer.bind(this);
  giveVip = this.giveVip.bind(this);
  inputNickname = this.inputNickname.bind(this);

  kickPlayer() {
    let api = this.context;
    if (this.nickname === "") return;
    var reason = window.prompt("Please enter reason to kick", "Kicked by admin.");
    api.kickPlayer(this.nickname, reason || "").then(result => this.checkError(result));
  }
  banPlayer() {
    let api = this.context;
    if (this.nickname === "") return;
    let state = window.confirm("Are you sure you want to ban " + this.nickname + "?");
    if (state) {
        api.banPlayer(this.nickname).then(result => this.checkError(result));
    }
  }
  giveVip() {
    let api = this.context;
    if (this.nickname === "") return;
    let state = window.confirm("Give Vip to " + this.nickname + "?");
    if (state) {
        let result = api.addVip(this.nickname).then(result => this.checkError(result));
    }
  }
  inputNickname(ev) {
    this.nickname = ev.target.value;
  }
  checkError(result) {
    if (!result) {
        alert("Api currently not working.");
    } else if (result.hasOwnProperty("error")) {
        alert(result.error);
    } else {
        alert(JSON.stringify(result,null,'\t'));
    }
  }
  render() {
    let api = this.context;
    api.user.then((u) => (!this.state.ready) ? this.setState({ready: true, user: u}) : null);
    if (!this.state.ready) {
        return "Loading..";
    }
    if (this.state.user.auth.is_admin) {
        return (
          <div className="serverpanel">
            <input type="text" placeholder="Nickname" onChange={this.inputNickname} />
            <input type="button" value="Ban" onClick={this.banPlayer} />
            <input type="button" value="Kick" onClick={this.kickPlayer} />
            <input type="button" value="Give Vip" onClick={this.giveVip} title="Function is disabled as it may cause issues." disabled />
          </div>
        )
    } else {
        api.openLoginPage();
        return "Not an admin.";
    }
  }
}
