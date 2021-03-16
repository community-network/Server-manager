
const MODE = "prod";

const endPoints = {
    dev: "https://homedev.gametools.network/api/",
    prod: "https://manager-api.gametools.network/api/"
}

export default class JsonClient {
  constructor() {
    this.isWorking = true;
    this.user = this.getUserInfo();
  }
  openLoginPage() {
    window.location = this.constructApiUrl("login");
  }
    constructApiUrl(method, params) {
        params = params || {};
        let paramStr = "";
        for (let s in params) {
            paramStr += s + "=" + params[s] + "&";
        }
        if (paramStr !== "") paramStr = "?" + paramStr;
        const apiEP = endPoints[MODE];
        return apiEP + method + paramStr;
    }
    async fetchMethod(method, params) {
        let result = await fetch(this.constructApiUrl(method, params), {
            credentials: "include"
        });
        return result;
    }
    async postMethod(method, params) {
        let result = await fetch(this.constructApiUrl(method, {}), params);
        return result;
    }
  async postJsonMethod(method, params) {
    const options = {
      method: 'POST',
      body: JSON.stringify(params),
      credentials: "include",
      headers: {
          'Content-Type': 'application/json'
      }
    };
    return await this.postMethod(method, options).then(result => {
      return result.json().then(json => json, error => ({ "error": error }));
    }, error => ({ "error": error }));
  }
  getJsonMethod(method, params) {
    return this.fetchMethod(method, params).then(result => {
      return result.json().then(json => json, error => ({ "error": error }));
    }, error => ({ "error": error }));
  }
  async getUserInfo() {
    const defaultUser = {
      discord: {
        name: "",
        discriminator: 0,
        avatar: ""
      },
      auth: {
          inGuild: false,
          isAdmin: false,
          isDeveloper: false,
          isOwner: false,
          signedIn: false
      }
    };
    let response = await this.getJsonMethod("getinfo");
    if (!response.hasOwnProperty("error")) {
      return response;
    }
    return defaultUser;
  }
}