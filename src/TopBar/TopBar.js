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


    return (
      <div className="topbar">
        <h1 className="title">Community Network</h1>
        {
          (this.state.ready && this.state.user.auth.is_signed_in) ?
          (
            <React.Fragment>
              {(this.state.user.auth.region == "EU" || this.state.user.auth.region == "ALL") ? <Link to="/s1/" className="link">Server #1</Link> : ""}
              {(this.state.user.auth.region == "NA" || this.state.user.auth.region == "ALL") ? <Link to="/s2/" className="link">Server #2</Link> : ""}
              <a href="#logout-attempt" className="link" onClick={
                (e) => {
                  e.preventDefault();
                  api.logout().then(_ => {
                    window.location = "/";
                  });
                }
              }>Logout</a>
            </React.Fragment>
          ) : (
            <a href="#login-attempt" className="link" onClick={
              (e) => {
                e.preventDefault();
                api.openLoginPage();
              }
            }>Login</a>
          )
        }
      </div>
    );


  }

}
