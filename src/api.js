import React from "react";
import JsonClient from "./JsonApi";

export class ApiProvider extends JsonClient {
  constructor() {
    super();
    this.switchServer("1");
  }
  switchServer(number) {
    this.server = "Community Operations #" + number;
    this._server = "Community Operations %23" + number;
  }
  logout() {
    return this.fetchMethod("logout");
  }
  kickPlayer(name, reason) {
    return this.postJsonMethod("changeplayer", { "request": "kickPlayer", "playername": name, "servername": this.server, "reason": reason });
  }
  banPlayer(name, reason, time) {
    return this.postJsonMethod("changeserver", { "request": "addServerBan", "playername": name, "servername": this.server, "bantime": time.toString(), "reason": reason });
  }
  addVip(name) {
    return this.postJsonMethod("changeserver", { "request": "addServerVip", "playername": name, "servername": this.server });
  }
  movePlayer(team, name) {
    return this.postJsonMethod("moveplayer", { "teamid": team, "playername": name, "servername": this.server });
  }
  getBanList() {
    return this.getJsonMethod("infolist", { "type": "bannedList", "name": encodeURIComponent(this.server) });
  }
  getLogs() {
    return this.getJsonMethod("taillog");
  }
}

export const OperationsApi = React.createContext();
