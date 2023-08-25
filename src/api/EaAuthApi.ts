import JsonClient from "./JsonApi";

interface ICredentials {
  email: string;
  password: string;
}

interface IOtpCredentials {
  email: string;
  otp: string;
}

export class ApiProvider extends JsonClient {
  constructor() {
    super();
  }

  async login({ email, password }: ICredentials): Promise<ICredentialsReturn> {
    return await fetch("https://auth.gametools.network/ea/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    }).then((r) => r.json());
  }

  async otpLogin({ email, otp }: IOtpCredentials): Promise<ICredentialsReturn> {
    return await fetch("https://auth.gametools.network/ea/otp/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: otp,
      }),
    }).then((r) => r.json());
  }
}

export type ICredentialsReturn = {
  errors: string[];
  type: string;
  sid: string;
  rmid: string;
  code: string;
};

export const EaAuthApi = new ApiProvider();
