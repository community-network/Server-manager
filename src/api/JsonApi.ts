import { IUserInfo } from "./ReturnTypes";

export const endPointName = process.env.gametools_manager_endpoint.replace("https://", "").replace(
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
  constructApiUrl(
    method: string,
    params: { [name: string]: string | number },
  ): string {
    params = params || {};
    let paramStr = "";
    for (const s in params) {
      paramStr += s + "=" + params[s] + "&";
    }
    if (paramStr !== "") paramStr = "?" + paramStr;
    const apiEP = process.env.gametools_manager_endpoint;
    return apiEP + method + paramStr;
  }
  async fetchMethod(
    method: string,
    params: { [name: string]: string | number },
  ): Promise<Response> {
    return fetch(this.constructApiUrl(method, params), {
      credentials: "include",
    });
  }
  async postMethod(
    method: string,
    params: { [name: string]: unknown },
  ): Promise<Response> {
    return fetch(this.constructApiUrl(method, {}), params);
  }
  postJsonMethod(
    method: string,
    params: { [name: string]: unknown },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
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
    params: { [name: string]: string | number },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
