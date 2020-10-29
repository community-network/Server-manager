import React from "react";
import JsonClient from "./JsonApi";

export class ApiProvider extends JsonClient {
  constructor() {
    super();
    this.server = "Community Operations #1";
  }
  logout() {
    return this.fetchMethod("logout");
  }
  kickPlayer(name, reason) {
    return this.postJsonMethod("changeplayer", { "request": "kickPlayer", "playername": name, "servername": this.server, "reason": reason });
  }
  banPlayer(name) {
    return this.postJsonMethod("changeserver", { "request": "addServerBan", "playername": name, "servername": this.server });
  }
  addVip(name) {
    return this.postJsonMethod("changeserver", { "request": "addServerVip", "playername": name, "servername": this.server });
  }
  getBanList() {

  }
}

export const OperationsApi = React.createContext();
