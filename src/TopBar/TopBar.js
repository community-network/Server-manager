import React, { Component } from 'react';
import "./TopBar.css";

import { Link } from 'react-router-dom';
import { OperationsApi } from "../api";

export default class TopBar extends Component {
  static contextType = OperationsApi;
  state = { ready: false };
  render() {
    let api = this.context;
    api.user.then((u) => (!this.state.ready) ? this.setState({ready: true, user: u}) : null);
    if (!this.state.ready) {
      return (
        <div className="topbar">
          <h1 className="title">Community Network</h1>
        </div>
      )
    } else if(this.state.user.auth.is_signed_in) {
      return (
        <div className="topbar">
          <h1 className="title">Community Network</h1>
          {(this.state.user.auth.region == "EU" || this.state.user.auth.region == "ALL") ? <Link to="/s1/" className="link">Server #1</Link> : ""}
          {(this.state.user.auth.region == "NA" || this.state.user.auth.region == "ALL") ? <Link to="/s2/" className="link">Server #2</Link> : ""}
        </div>
      )
    } else {
      return (<div className="topbar">
        <h1 className="title">Community Network</h1>
        <Link to="/login/" className="link">Login</Link>
      </div>);
    }
  }

}
