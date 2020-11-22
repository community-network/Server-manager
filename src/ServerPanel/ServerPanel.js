import React, { Component, useState } from 'react';
import "./ServerPanel.css";

import { OperationsApi } from "../api";

class AdminTools extends Component {
  static contextType = OperationsApi;

  state = { ready: false, status: { msg: "Servers are working.", type: "ok" }, popup: { is: false }, choose: { is: false } };
  nickname = "";

  kickPlayer = this.kickPlayer.bind(this);
  banPlayer = this.banPlayer.bind(this);
  giveVip = this.giveVip.bind(this);
  inputNickname = this.inputNickname.bind(this);
  movePlayer = this.movePlayer.bind(this);

  kickPlayer() {
    // Load API
    let api = this.context;
    // If no nickname, return
    if (this.nickname === "") return;

    var promise = new Promise((resolve, reject) => {
      var submit = (reason, time) => {
        resolve(reason);
      };
      var chancel = (ev) => {
        ev.preventDefault();
        reject("Chanceled");
      };
      this.setState(
        s => ({
          ...s,
          status: { msg: "Executing", type: "warn" },
          popup: { is: true, description: "Enter a reason to kick.", title: "Kick " + this.nickname, submit: submit, chancel: chancel }
        })
      );
    });

    promise.then(
      (reason) => api.kickPlayer(this.nickname, reason || "")
        .then(result => this.checkError(result)),
      (e) => {}
    ).finally(_ => this.setState(
      s => ({
        ...s,
        popup: { is: false }
      })
    ));

  }
  banPlayer() {
    let api = this.context;
    if (this.nickname === "") return;

    var promise = new Promise((resolve, reject) => {
      var submit = (reason, time) => {
        console.log(time);
        resolve({reason, time});
      };
      var chancel = (ev) => {
        ev.preventDefault();
        reject("Chanceled");
      };
      this.setState(
        s => ({
          ...s,
          status: { msg: "Executing", type: "warn" },
          popup: { is: true, description: "Enter a reason to ban.", title: "Ban " + this.nickname, submit: submit, chancel: chancel, time: true }
        })
      );
    });

    promise.then(
      ({reason, time}) => api.banPlayer(this.nickname, reason, time)
        .then(result => this.checkError(result)),
      (e) => {}
    ).finally(_ => this.setState(
      s => ({
        ...s,
        popup: { is: false }
      })
    ));

  }
  movePlayer() {
    let api = this.context;
    if (this.nickname === "") return;

    var promise = new Promise((resolve, reject) => {
      var attack = _ => {
        resolve(2);
      };
      var defend = _ => {
        resolve(1);
      };
      var chancel = (ev) => {
        ev.preventDefault();
        reject("Chanceled");
      };
      this.setState(
        s => ({
          ...s,
          status: { msg: "Executing", type: "warn" },
          choose: { is: true, title: "Move player " + this.nickname + " ?", attack: attack, chancel: chancel, defend: defend }
        })
      );
    });

    promise.then(
      (side) => api.movePlayer(side, this.nickname)
        .then(result => this.checkError(result)),
      (e) => this.setState(
        s => ({
          ...s,
          status: { msg: "Servers are working.", type: "ok" },
        })
      )
    ).finally(_ => this.setState(
      s => ({
        ...s,
        choose: { is: false }
      })
    ));
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
        this.updateStatus({ msg: JSON.stringify(result,null,'\t'), type: "ok" });
    }
  }
  updateStatus(status) {
    this.setState(
      s => ({ ...s, status: status })
    );
  }
  render() {
    let api = this.context;


    if (!this.state.ready) {
        api.switchServer(this.props.server);
        api.user.then(
          u => (!this.state.ready) ? this.setState(
            s => ({ ...s, ready: true, user: u })
          ) : null
        );
        return "Loading..";
    }
    if (this.state.user.auth.is_admin) {
        return (
        <React.Fragment>
          <div className="sectiontitle">
            Admin tools - Server #{this.props.server}
          </div>
          <div className="serverpanel">
            <input type="text" placeholder="Nickname" onChange={this.inputNickname} />
            <input type="button" value="Ban" onClick={this.banPlayer} />
            <input type="button" value="Kick" onClick={this.kickPlayer} />
            <input type="button" value="Move" onClick={this.movePlayer} />
            <input type="button" value="Give Vip" onClick={this.giveVip} title="Function is disabled as it may cause issues." disabled />
          </div>
          <div className="statusbar">
            <Status text={this.state.status.msg.toString()} type={this.state.status.type} />
          </div>
          {(this.state.popup.is) ? <PopUp title={this.state.popup.title} description={this.state.popup.description} time={this.state.popup.time} submit={this.state.popup.submit} chancel={this.state.popup.chancel} />  : ""}
          {(this.state.choose.is) ? <ChooseSide title={this.state.choose.title} chancel={this.state.choose.chancel} attack={this.state.choose.attack} defend={this.state.choose.defend} /> : ""}
         </React.Fragment>
        )
    } else if(!this.state.user.is_signed_in) {
        api.openLoginPage();
    } else {
      return "No premissions.";
    }
  }
}
export default class ServerPanel extends Component {
  static contextType = OperationsApi;
  render() {
    return (
      <React.Fragment>
        <AdminTools server={this.props.server} />
        <BanList />
      </React.Fragment>
    );
  }

}
class BanList extends Component {
  static contextType = OperationsApi;
  state = {ready: false, list: []}
  render() {
    let api = this.context;
    if(!this.state.ready){
      console.log("loading..");
      api.getBanList().then(l => this.setState({ ready: true, list: l}));
      return "Loading..";
    } else {
      console.log(this.state);
      return (
        <table className="banlist">
        <thead>
          <th>Nickname</th>
          <th>Reason</th>
          <th>Admin</th>
          <th>Period</th>
          <th>Ban time</th>
        </thead>
        <tbody>
        {
          this.state.list.players.map(
            (j, i) => (
              <BannedPlayer key={i} player={j} />
            )
          )
        }
        </tbody></table>
      );
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

 function PopUp(props) {
  const [reason, setReason] = React.useState("");
  var time = "0";

  return (
    <div className="popup">
      <form onSubmit={ (ev) => { ev.preventDefault(); console.log(time); props.submit(reason, time); } }>
        <h3>{props.title}</h3>
        <p>{props.description}</p>
        <label for="reason">Enter reason:</label>
        <input type="text" id="reason" name="reason" onChange={(e) => setReason(e.target.value)} />
        {(props.time) ? <BanTime change={(e) => {time = e.target.value;} } /> : "" }
        <input type="button" value="Chancel" onClick={props.chancel} />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
 }

 function ChooseSide(props) {
  return (
    <div className="popup">
      <form>
        <h3>{props.title}</h3>
        <p>Choose where to move the player: Attack or Defend forces</p>
        <input type="button" value="Attack" onClick={props.attack} />
        <input type="button" value="Defend" onClick={props.defend} />
        <input type="button" value="Chancel"  onClick={props.chancel}/>
      </form>
    </div>
  );
 }

 function BanTime(props) {
  return (
    <div>
      <label for="time">Choose a ban time:</label>
      <select id="time" name="time" onChange={props.change}>
        <option value="0" selected>Perm</option>
        <option value="1">1 day</option>
        <option value="2">2 days</option>
        <option value="7">1 week</option>
      </select>
    </div>
  );
 }

function BannedPlayer(props) {
  return (
    <tr>
      <td>{props.player.displayName}</td>
      <td>{props.player.reason}</td>
      <td>{props.player.admin}</td>
      <td>{props.player.banned_until}</td>
      <td>{props.player.ban_timestamp}</td>
    </tr>
  );
}