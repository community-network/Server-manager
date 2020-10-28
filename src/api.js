import React from "react";

const defaultUser = {
  discord: {
    name: "",
    discriminator: 0,
    id: 0,
    avatar: ""
  },
  bob: {
    role: "",
    role_color: "",
    in_server: false,
    nickname: ""
  },
  auth: {
    is_signed_in: false,
    is_admin: false
  },
  origin: {
    name: "",
    id: 0,
    platoon: 0,
    is_in_platoon: false
  }
};

export class ApiProvider {
  constructor() {
    this.isWorking = true;
    this.user = this.getUserInfo();
    this.server = "Operations";
  }
  tryToLogin() {
    this.getUserInfo();
  }
  openLoginPage() {
    window.location = this.constructApiUrl("login");
  }
  async logout() {
    await this.fetchMethod("logout");
  }
  constructApiUrl(method, params) {
    params = params || {};
    let paramStr = "";
    for (let s in params) {
      paramStr += s + "=" + params[s] + "&";
    }
    const apiEP = "//bandofbrothers.site/api/";
    return apiEP + method + "?" + paramStr;
  }
  async fetchMethod(method, params) {
    let result = await fetch(this.constructApiUrl(method, params), {
      credentials: "include"
    });
    return result;
  }
  async kickPlayer(name, reason) {
    let result = await this.fetchMethod("changeplayer", { "request": "kickPlayer", "playername": name, "servername": this.server, "reason": reason });
    return await result.json();
  }
  async banPlayer(name) {
    let result = await this.fetchMethod("changeserver", { "request": "addServerBan", "playername": name, "servername": this.server });
    return await result.json();
  }
  async addVip(name) {
    let result = await this.fetchMethod("changeserver", { "request": "addServerVip", "playername": name, "servername": this.server });
    return await result.json();
  }
  userSetInfo(a) {
    if (!a.hasOwnProperty("error")) {
      return a;
    } else {
      return defaultUser;
    }
  }
  async getUserInfo() {
    let response = await this.fetchMethod("getinfo");
    if (response !== undefined) {
      let json = await response.json().catch((e) => console.log(e));
      if (json !== undefined) {
        return this.userSetInfo(json);
      }
    }
    this.isWorking = false;
    return defaultUser;
  }
}

export const OperationsApi = React.createContext();
