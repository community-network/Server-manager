import { IUserInfo } from "./ReturnTypes";

const MODE = "prod";

const endPoints = {
  local: "https://localhost:5051/api/",
  dev: "https://homedev.gametools.network/api/",
  prod: "https://manager-api.gametools.network/api/",
};

export const endPointName = endPoints[MODE].replace("https://", "").replace(
  "/api/",
  "",
);

export default class JsonClient {
  isWorking: boolean;
  user: Promise<IUserInfo>;
  constructor() {
    this.isWorking = true;
    this.user = this.getUserInfo();
  }
  openLoginPage() {
    window.location.replace(this.constructApiUrl("login", {}));
  }
  constructApiUrl(method: string, params: { [name: string]: string }): string {
    params = params || {};
    let paramStr = "";
    for (const s in params) {
      paramStr += s + "=" + params[s] + "&";
    }
    if (paramStr !== "") paramStr = "?" + paramStr;
    const apiEP = endPoints[MODE];
    return apiEP + method + paramStr;
  }
  async fetchMethod(
    method: string,
    params: { [name: string]: string },
  ): Promise<Response> {
    return fetch(this.constructApiUrl(method, params), {
      credentials: "include",
    });
  }
  async postMethod(
    method: string,
    params: { [name: string]: any },
  ): Promise<Response> {
    return fetch(this.constructApiUrl(method, {}), params);
  }
  postJsonMethod(method: string, params: any): Promise<any> {
    const options = {
      method: "POST",
      body: JSON.stringify(params),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    };
    return this.errorHandler(this.postMethod(method, options));
  }
  getJsonMethod(
    method: string,
    params: { [name: string]: string },
  ): Promise<any> {
    return this.errorHandler(this.fetchMethod(method, params));
  }
  async errorHandler(
    response: Promise<Response>,
  ): Promise<{ [name: string]: string }> {
    return response.then(
      (result) => {
        return result.json().then(
          (json) => {
            if ("error" in json) {
              throw json.error;
            }
            if (!result.ok) {
              throw json.error;
            }
            if ("data" in json) {
              if (json.data.length > 0) {
                if ("error" in json.data[0]) {
                  throw json.data[0].error;
                }
              }
            }
            return json;
          },
          (error) => this.spawnError(error, 600),
        );
      },
      (error) => this.spawnError(error, response),
    );
  }
  spawnError(error: string, code: number | Promise<Response>): void {
    throw {
      error: {
        message: error,
        code: code,
      },
    };
  }
  async getUserInfo(): Promise<IUserInfo> {
    const defaultUser = {
      discord: {
        name: "",
        discriminator: 0,
        avatar: "",
      },
      auth: {
        inGuild: false,
        isAdmin: false,
        isDeveloper: false,
        isOwner: false,
        signedIn: false,
      },
    };

    return this.getJsonMethod("getinfo", {}).then(
      (r) => r,
      () => defaultUser,
    );
  }
}
