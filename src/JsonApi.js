
const MODE = "dev";

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
        return fetch(this.constructApiUrl(method, params), {
            credentials: "include"
        });
    }
    async postMethod(method, params) {
        return fetch(this.constructApiUrl(method, {}), params);
    }
    /// Returns Promise
    postJsonMethod(method, params) {
        const options = {
            method: 'POST',
            body: JSON.stringify(params),
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        return this.errorHandler(this.postMethod(method, options));
    }
    /// Returns Promise
    getJsonMethod(method, params) {
        return this.errorHandler(this.fetchMethod(method, params));
    }
    async errorHandler(response) {
        return response.then(
            result => {
                return result.json().then(
                    json => {
                        if ("error" in json) {
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
                    error => this.spawnError(error, 600)
                );
            },
            error => this.spawnError(error, response.code)
        );
    }
    spawnError(error, code) {
        throw {
            "error": {
                "message": error,
                "code": code,
            }
        };
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