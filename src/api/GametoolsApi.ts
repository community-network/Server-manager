import JsonClient from "./JsonApi";
import {
  IPlatoonStats,
  IPlatoonSearchResult,
  IMainStats,
  IManagerStats,
  ISeederServerInfo,
  IPlatoonApplicants,
} from "./GametoolsReturnTypes";

interface IPlatoonSearch {
  name: string;
  platform: string;
  lang: string;
}

interface IServerPlayerlist {
  gameId: string;
}

interface IPlayerInfo {
  game: string;
  type: string;
  getter: string;
  userName: string;
  lang: string;
  platform?: string;
}

interface IPlatoonInfo {
  id: string;
  platform: string;
  lang: string;
}

interface IPlatoonAppl {
  groupId: string;
  platoonId: string;
}

export class ApiProvider extends JsonClient {
  constructor() {
    super();
  }

  async platoonSearch({
    name,
    platform,
    lang,
  }: IPlatoonSearch): Promise<IPlatoonSearchResult> {
    return await fetch(
      `https://api.gametools.network/bfglobal/platoons/?name=${encodeURIComponent(
        name,
      )}&platform=${platform}&lang=${lang}`,
    ).then((r) => r.json());
  }

  async platoon({ id, platform, lang }: IPlatoonInfo): Promise<IPlatoonStats> {
    return await fetch(
      `https://api.gametools.network/bfglobal/detailedplatoon/?id=${id}&platform=${platform}&lang=${lang}`,
    ).then((r) => r.json());
  }

  async stats({
    game,
    type,
    getter,
    userName,
    lang,
    platform = "pc",
  }: IPlayerInfo): Promise<IMainStats> {
    if (getter == "playerid") {
      return await fetch(
        `https://api.gametools.network/${game}/${type}/?format_values=false&playerid=${userName}&lang=${lang}&platform=${platform}`,
      ).then((r) => r.json());
    }
    return await fetch(
      `https://api.gametools.network/${game}/${type}/?format_values=false&name=${encodeURIComponent(
        userName,
      )}&lang=${lang}&platform=${platform}`,
    ).then((r) => r.json());
  }

  async managerStats(): Promise<IManagerStats> {
    return await fetch(`https://api.gametools.network/manager/info/`).then(
      (r) => r.json(),
    );
  }

  async platoonApplicants({
    groupId,
    platoonId,
  }: IPlatoonAppl): Promise<IPlatoonApplicants> {
    return await fetch(
      `https://api.gametools.network/bfglobal/platoonapplicants/?platoonid=${platoonId}&groupid=${groupId}`,
    ).then((r) => r.json());
  }

  async seederPlayerList({
    gameId,
  }: IServerPlayerlist): Promise<ISeederServerInfo> {
    if (parseInt(gameId)) {
      const result: Promise<ISeederServerInfo> = fetch(
        `https://api.gametools.network/bf1/seederplayers/?gameid=${encodeURIComponent(
          gameId,
        )}`,
      ).then((r) => r.json());
      return result;
    } else {
      return null;
    }
  }
}

export const GametoolsApi = new ApiProvider();
