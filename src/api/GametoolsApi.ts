import {
  ICurrentServer,
  IMainStats,
  IManagerPlayer,
  IManagerPlayers,
  IManagerStats,
  IPlatoonApplicants,
  IPlatoonSearchResult,
  IPlatoonStats,
  ISeederServerInfo,
} from "./GametoolsReturnTypes";
import JsonClient from "./JsonApi";

interface IPlatoonSearch {
  name: string;
  platform: string;
  lang: string;
}

interface IServerPlayerlist {
  gameId: string;
}

interface IManagerPlayersInfo {
  playerIds: number[];
}

interface IManagerPlayerInfo {
  playerId: number;
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

interface IPlatoonsInfo {
  ids: string[];
  platform: string;
  lang: string;
}

interface IPlatoonAppl {
  groupId: string;
  platoonId: string;
}

interface IPlayerServer {
  playerIds: string[];
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

  async platoons({
    ids,
    platform,
    lang,
  }: IPlatoonsInfo): Promise<{ [name: string]: IPlatoonStats }> {
    const platoonDict: { [name: string]: IPlatoonStats } = {};
    for (const id of ids) {
      const result = await fetch(
        `https://api.gametools.network/bfglobal/detailedplatoon/?id=${id}&platform=${platform}&lang=${lang}`,
      ).then((r) => r.json());
      platoonDict[id] = result;
    }
    return platoonDict;
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

  async currentServer({ playerIds }: IPlayerServer): Promise<ICurrentServer> {
    return await fetch(
      `https://api.gametools.network/manager/currentserver/bf1?player_ids=${playerIds.join(
        ",",
      )}`,
    ).then((r) => r.json());
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

  async managerCheckPlayers({
    playerIds,
  }: IManagerPlayersInfo): Promise<IManagerPlayers> {
    if (playerIds?.length <= 0) {
      return { vban: {}, otherNames: {}, bfban: {}, bfeac: [] };
    }
    return await fetch(
      `https://api.gametools.network/manager/checkbans/?personaids=${playerIds.toString()}`,
    ).then((r) => r.json());
  }

  async managerCheckPlayer({
    playerId,
  }: IManagerPlayerInfo): Promise<IManagerPlayer> {
    return await fetch(
      `https://api.gametools.network/manager/checkban/?playerid=${playerId}`,
    ).then((r) => r.json());
  }
}

export const GametoolsApi = new ApiProvider();
