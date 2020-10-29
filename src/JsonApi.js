
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
    const apiEP = "https://operations.bandofbrothers.site/api/";
    return apiEP + method + "?" + paramStr;
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
  async getJsonMethod(method, params) {
    return await this.fetchMethod(method, params).then(result => {
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
        is_signed_in: false,
        is_admin: false
      }
    };
    let response = await this.getJsonMethod("getinfo");
    if (!response.hasOwnProperty("error")) {
      return response;
    }
    alert(response.error);
    return defaultUser;
  }
}