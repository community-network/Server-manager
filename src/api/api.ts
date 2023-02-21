import JsonClient from "./JsonApi";
import {
  IBanList,
  IBfvCreateServer,
  IBfvPlaygrounds,
  ICookieList,
  IDefaultMessage,
  IDefaultMessageWithGid,
  IDevGroups,
  IEditPlatoon,
  IFirestarterList,
  IGlobalGroupPlayer,
  IGroupsInfo,
  IGroupStats,
  IGroupUsers,
  IInfoList,
  IInGameServerInfo,
  IKickResult,
  IManGroups,
  IMoveResult,
  IPlayerLog,
  IPlayingScoreboard,
  IReasonList,
  ISeederInfo,
  ISeederList,
  ISeederServerAliasName,
  IServerActionResult,
  IServerChangeRotation,
  IServerInfo,
  IServerOperationSuccess,
  IServerRotation,
  IServerStats,
  ITailServerLog,
  ITailUserLog,
  IUserInfo,
} from "./ReturnTypes";

export interface IServerGet {
  sid: string;
}

export interface IGroupGet {
  gid: string;
}

export class ApiProvider extends JsonClient {
  logout(): void {
    const asyncUser = this.logoutAndChangeUser();
    this.user = asyncUser;
  }

  async logoutAndChangeUser(): Promise<IUserInfo> {
    await this.fetchMethod("logout/", {});
    const user = await this.getUserInfo();
    return user;
  }

  async kickPlayer({
    sid,
    playername,
    reason,
    playerId,
    userId,
  }: {
    sid: string;
    playername: string;
    reason: string;
    playerId: number | string;
    userId: number;
  }): Promise<IKickResult> {
    if (playerId !== undefined && playerId !== "") {
      return await this.postJsonMethod("changeplayer", {
        request: "kickPlayer",
        playername: playername,
        playerid: playerId,
        userid: userId,
        serverid: sid,
        reason: reason,
      });
    }
    return await this.postJsonMethod("changeplayer", {
      request: "kickPlayer",
      playername: playername,
      serverid: sid,
      reason: reason,
    });
  }

  async globalBanPlayer({
    name,
    reason,
    gid,
    playerId,
    banTime,
  }: {
    name: string;
    reason: string;
    gid: string;
    playerId: number | string;
    banTime: string;
  }): Promise<IDefaultMessage> {
    if (playerId !== undefined && playerId !== "") {
      return await this.postJsonMethod("addautoban", {
        playername: name,
        playerid: playerId,
        groupid: gid,
        reason: reason,
        time: banTime,
      });
    }
    return await this.postJsonMethod("addautoban", {
      playername: name,
      groupid: gid,
      reason: reason,
      time: banTime,
    });
  }

  async globalUnbanPlayer({
    name,
    gid,
    playerId,
    reason,
  }: {
    name: string;
    gid: string;
    playerId: string;
    reason: string;
  }): Promise<IDefaultMessage> {
    if (reason !== undefined && reason !== "") {
      return await this.postJsonMethod("delautoban", {
        playerid: playerId,
        playername: name,
        groupid: gid,
        reason: reason,
      });
    }
    return await this.postJsonMethod("delautoban", {
      playerid: playerId,
      playername: name,
      groupid: gid,
      reason: "",
    });
  }

  async globalExcludePlayer({
    name,
    reason,
    gid,
    playerId,
    excludeTime,
  }: {
    name: string;
    reason: string;
    gid: string;
    playerId: string;
    excludeTime: number;
  }): Promise<IDefaultMessage> {
    if (playerId !== undefined && playerId !== "") {
      return await this.postJsonMethod("addexcludedplayer", {
        playername: name,
        playerid: playerId,
        groupid: gid,
        reason: reason,
        time: excludeTime,
      });
    }
    return await this.postJsonMethod("addexcludedplayer", {
      playername: name,
      groupid: gid,
      reason: reason,
      time: excludeTime,
    });
  }

  async addReason({
    gid,
    reason,
  }: {
    gid: string;
    reason: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("addreason", {
      groupid: gid,
      reason: reason,
    });
  }

  async globalRemoveExcludePlayer({
    name,
    gid,
    playerId,
    reason,
  }: {
    name: string;
    gid: string;
    playerId: string;
    reason: string;
  }): Promise<IDefaultMessage> {
    if (reason !== undefined && reason !== "") {
      return await this.postJsonMethod("delexcludedplayer", {
        playerid: playerId,
        playername: name,
        groupid: gid,
        reason: reason,
      });
    }
    return await this.postJsonMethod("delexcludedplayer", {
      playerid: playerId,
      playername: name,
      groupid: gid,
      reason: "",
    });
  }

  async delReason({
    gid,
    reasonId,
  }: {
    gid: string;
    reasonId: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("delreason", {
      groupid: gid,
      reasonid: reasonId,
    });
  }

  async changeRotation({
    sid,
    map,
  }: {
    sid: string;
    map: string;
  }): Promise<IServerChangeRotation> {
    return await this.postJsonMethod("changelevel", {
      mapnumber: map,
      serverid: sid,
    });
  }

  async banPlayer({
    name,
    reason,
    time,
    sid,
    playerId,
    oid,
    platformId,
  }: {
    name?: string;
    reason?: string;
    time?: number;
    sid?: string;
    playerId?: number | string;
    oid?: string;
    platformId?: string;
  }): Promise<IServerActionResult> {
    if (playerId !== undefined && playerId !== "") {
      return await this.postJsonMethod("changeserver", {
        request: "addServerBan",
        playername: name,
        playerid: playerId,
        serverid: sid,
        bantime: time.toString(),
        oid: oid,
        platformid: platformId,
        reason: reason,
      });
    }
    return await this.postJsonMethod("changeserver", {
      request: "addServerBan",
      playername: name,
      serverid: sid,
      bantime: time.toString(),
      reason: reason,
    });
  }

  async unbanPlayer({
    name,
    reason,
    sid,
    playerId,
    oid,
    platformId,
  }: {
    name: string;
    reason: string;
    sid: string;
    playerId: string;
    oid: string;
    platformId: number;
  }): Promise<IServerActionResult> {
    if (playerId !== undefined && playerId !== "") {
      return await this.postJsonMethod("changeserver", {
        request: "removeServerBan",
        playername: name,
        playerid: playerId,
        serverid: sid,
        oid: oid,
        platformid: platformId,
        reason: reason,
      });
    }
    return await this.postJsonMethod("changeserver", {
      request: "removeServerBan",
      playername: name,
      serverid: sid,
      reason: reason,
    });
  }

  async addVip({
    sid,
    name,
    reason,
  }: {
    sid: string;
    name: string;
    reason: string;
  }): Promise<IServerActionResult> {
    return await this.postJsonMethod("changeserver", {
      request: "addServerVip",
      playername: name,
      serverid: sid,
      reason,
    });
  }

  async removeVip({
    sid,
    name,
    reason,
    playerId,
  }: {
    sid: string;
    name: string;
    reason: string;
    playerId: string;
  }): Promise<IServerActionResult> {
    if (playerId !== undefined && playerId !== "") {
      return await this.postJsonMethod("changeserver", {
        request: "removeServerVip",
        playername: name,
        playerid: playerId,
        serverid: sid,
        reason,
      });
    }
    return await this.postJsonMethod("changeserver", {
      request: "removeServerVip",
      playername: name,
      serverid: sid,
      reason,
    });
  }

  async movePlayer({
    sid,
    team,
    name,
  }: {
    sid: string;
    team: string;
    name: string;
  }): Promise<IMoveResult> {
    return await this.postJsonMethod("moveplayer", {
      teamid: team,
      playername: name,
      serverid: sid,
    });
  }

  async getBanList({ sid }: IServerGet): Promise<IBanList> {
    return await this.getJsonMethod("infolist", {
      type: "bannedList",
      serverid: sid,
    });
  }

  async getBfvPlaygrounds({ sid }: IServerGet): Promise<IBfvPlaygrounds> {
    return await this.getJsonMethod("bfvplaygrounds", {
      serverid: sid,
    });
  }

  async getStarterList({ sid }: IServerGet): Promise<IFirestarterList> {
    return await this.getJsonMethod("firestarters", {
      serverid: sid,
    });
  }

  async getPlayTimeList({ sid }: IServerGet): Promise<IPlayingScoreboard> {
    return await this.getJsonMethod("playingscoreboard", {
      serverid: sid,
    });
  }

  async getSpectatorList({ sid }: IServerGet) {
    return await this.getJsonMethod("spectators", {
      serverid: sid,
    });
  }

  async getPlayerLogList({
    sid,
    date,
    searchPlayer,
  }: {
    sid: string;
    date: string;
    searchPlayer: string;
  }): Promise<IPlayerLog> {
    return await this.getJsonMethod("playerlog", {
      serverid: sid,
      date: date,
      playername: searchPlayer,
    });
  }

  async getAutoBanList({ gid }: IGroupGet): Promise<IGlobalGroupPlayer> {
    return await this.getJsonMethod("autoban", {
      groupid: gid,
    });
  }

  async getExcludedPlayers({ gid }: IGroupGet): Promise<IGlobalGroupPlayer> {
    return await this.getJsonMethod("excludedplayers", {
      groupid: gid,
    });
  }

  async getReasonList({
    gid,
    sid,
  }: {
    gid: string;
    sid: string;
  }): Promise<IReasonList> {
    return await this.getJsonMethod("reasonlist", {
      groupid: gid,
      serverid: sid,
    });
  }

  async getVipList({ sid }: IServerGet): Promise<IInfoList> {
    return await this.getJsonMethod("infolist", {
      type: "vipList",
      serverid: sid,
    });
  }

  async getCookieList({ sid }: IServerGet): Promise<ICookieList> {
    return await this.getJsonMethod("cookielist", {
      serverid: sid,
    });
  }

  async getAdminList({ sid }: IServerGet): Promise<IInfoList> {
    return await this.getJsonMethod("infolist", {
      type: "adminList",
      serverid: sid,
    });
  }

  async getServerLogs({ sid }: IServerGet): Promise<ITailServerLog> {
    return await this.getJsonMethod("tailserverlog", {
      serverid: sid,
    });
  }

  async getGroupLogs({ gid }: IGroupGet): Promise<ITailUserLog> {
    return await this.getJsonMethod("tailuserlog", {
      groupid: gid,
    });
  }

  async getDevGroups(): Promise<IDevGroups> {
    const devGroups = await this.getJsonMethod("devgroups", {});
    if ("error" in devGroups) {
      throw Error("Error on server.");
    }
    return devGroups;
  }

  async getManGroups(): Promise<IManGroups> {
    const devGroups = await this.getJsonMethod("mangroups", {});
    if ("error" in devGroups) {
      throw Error("Error on server.");
    }
    return devGroups;
  }

  async addGroup({
    groupName,
    discordId,
    modRole,
    adminRole,
    sid,
    remid,
  }: {
    groupName: string;
    discordId: string;
    modRole: string;
    adminRole: string;
    sid: string;
    remid: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("addgroup", {
      groupname: groupName,
      adminroleid: adminRole,
      discordid: discordId,
      modroleid: modRole,
      remid: remid,
      sid: sid,
    });
  }

  async removeGroup({ gid }: IGroupGet): Promise<IDefaultMessage> {
    return await this.postJsonMethod("delgroup", {
      groupId: gid,
    });
  }

  async addCookie({
    gid,
    sid,
    remid,
    defaultCookie,
  }: {
    gid: string;
    sid: string;
    remid: string;
    defaultCookie: boolean;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("addcookie", {
      sid: sid,
      remid: remid,
      groupid: gid,
      defaultcookie: defaultCookie,
    });
  }

  async editCookie({
    gid,
    sid,
    remid,
    id,
    defaultCookie,
  }: {
    gid: string;
    sid: string;
    remid: string;
    id: string;
    defaultCookie: boolean;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("editcookie", {
      cookieid: id,
      sid: sid,
      remid: remid,
      groupid: gid,
      defaultcookie: defaultCookie,
    });
  }

  async updateCookieGames({
    gid,
    id,
  }: {
    gid: string;
    id: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("updatecookiegames", {
      cookieid: id,
      groupid: gid,
    });
  }

  async bfvCreateServer({
    sid,
    playgroundId,
    checksum,
    serverRegion,
  }: {
    sid: string;
    playgroundId: string;
    checksum: string;
    serverRegion: string;
  }): Promise<IBfvCreateServer> {
    return await this.postJsonMethod("bfvcreateserver", {
      serverid: sid,
      playgroundid: playgroundId,
      checksum: checksum,
      serverregion: serverRegion,
    });
  }

  async removeCookie({
    gid,
    id,
  }: {
    gid: string;
    id: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("delcookie", {
      cookieid: id,
      groupid: gid,
    });
  }

  async editGroup({
    gid,
    value,
  }: {
    gid: string;
    type?: string;
    value: { [string: string]: string | number | boolean };
  }): Promise<void> {
    const answer = await this.postJsonMethod("editgroup", {
      groupid: gid,
      values: value,
    });
    if ("error" in answer) {
      throw new Error(answer.error.message);
    }
  }

  async getGroup(gid: string): Promise<IGroupsInfo> {
    return await this.getJsonMethod("groups", { groupid: gid });
  }

  async getUsers(gid: string): Promise<IGroupUsers> {
    return await this.getJsonMethod("users", { groupid: gid });
  }

  async getStats(gid: string): Promise<IGroupStats> {
    return await this.getJsonMethod("stats", { groupid: gid });
  }

  async getServerStats(sid: string): Promise<IServerStats> {
    return await this.getJsonMethod("serverstats", { serverid: sid });
  }

  async addGroupOwner({
    gid,
    uid,
    nickname,
  }: {
    gid: string;
    uid: string;
    nickname: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("addowner", {
      userid: uid, // discord userid
      nickname: nickname, // will change when the user signs in
      groupid: gid,
    });
  }

  async addGroupServer({
    gid,
    name,
    alias,
    game,
    cookieId,
    sid,
    remid,
  }: {
    gid: string;
    name: string;
    alias: string;
    game: string;
    cookieId: string;
    sid: string;
    remid: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("addserver", {
      servername: name,
      serveralias: alias,
      groupid: gid,
      game: game,
      cookieid: cookieId,
      sid: sid,
      remid: remid,
    });
  }

  async addGroupPlatoons({
    gid,
    platoonIds,
    cookieId,
    sid,
    remid,
  }: {
    gid: string;
    platoonIds: string[];
    cookieId: string;
    sid: string;
    remid: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("addplatoons", {
      platoonids: platoonIds,
      groupid: gid,
      cookieid: cookieId,
      sid: sid,
      remid: remid,
    });
  }

  async removeGroupPlatoons({
    gid,
    platoonIds,
  }: {
    gid: string;
    platoonIds: string[];
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("delplatoons", {
      platoonids: platoonIds,
      groupid: gid,
    });
  }

  async platoonActions({
    request,
    gid,
    platoonid,
    pid,
  }: {
    request: string;
    gid: string;
    platoonid: string;
    pid: string;
  }): Promise<IEditPlatoon> {
    return await this.postJsonMethod("platoonactions", {
      request,
      groupid: gid,
      platoonid,
      playerid: pid,
    });
  }

  async addGroupAdmin({
    gid,
    uid,
    nickname,
  }: {
    gid: string;
    uid: string;
    nickname: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("addadmin", {
      userid: uid, // discord userid
      nickname: nickname, // will change when the user signs in
      groupid: gid,
    });
  }

  async removeGroupAdmin({
    gid,
    uid,
  }: {
    gid: string;
    uid: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("deladmin", {
      userid: uid,
      groupid: gid,
    });
  }

  async removeGroupOwner({
    gid,
    uid,
  }: {
    gid: string;
    uid: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("delowner", {
      userid: uid,
      groupid: gid,
    });
  }

  async setupOps({
    server,
    sid,
    remid,
  }: {
    server: string;
    sid: string;
    remid: string;
  }): Promise<IServerOperationSuccess> {
    return await this.postJsonMethod("makeoperations", {
      serverid: server,
      sid: sid,
      remid: remid,
    });
  }

  async getServer(sid: string): Promise<IServerInfo> {
    return await this.getJsonMethod("server", { serverid: sid });
  }

  async getServerGame(sid: string): Promise<IInGameServerInfo> {
    const game = await this.getJsonMethod("servers", { serverid: sid });
    if ("error" in game.data[0]) {
      throw Error(game.data[0].error);
    } else {
      return game;
    }
  }

  async removeServer({ sid }: IServerGet): Promise<IDefaultMessageWithGid> {
    return await this.postJsonMethod("delserver", {
      serverid: sid,
    });
  }

  async renameServer({ name, sid }: { name: string; sid: string }) {
    return await this.postJsonMethod("renameserver", {
      serverid: sid,
      servername: name,
    });
  }

  async changeServerAlias({
    gid,
    alias,
    sid,
  }: {
    gid: string;
    alias: string;
    sid: string;
  }) {
    return await this.postJsonMethod("serveralias", {
      serverid: sid,
      groupid: gid,
      serveralias: alias,
    });
  }

  async editServer({
    sid,
    value,
  }: {
    sid: string;
    value: { [string: string]: string | number | boolean };
  }): Promise<void> {
    const answer = await this.postJsonMethod("editserver", {
      serverid: sid,
      values: value,
    });
    if ("error" in answer) {
      throw new Error(answer.error.message);
    }
  }

  async editOwnerSever({
    sid,
    remid,
    cookieid,
    serverid,
    maps,
  }: {
    sid: string;
    remid: string;
    cookieid: string;
    serverid: string;
    maps: IServerRotation[];
  }): Promise<void> {
    if (sid === "" || remid === "") {
      sid = undefined;
      remid = undefined;
    } else {
      cookieid = undefined;
    }
    const sendMaps = [];
    maps.forEach((element) => {
      sendMaps.push({ gameMode: element.mode, mapName: element.mapname });
    });
    const answer = await this.postJsonMethod("changeownerserver", {
      sid: sid,
      remid: remid,
      cookieid: cookieid,
      serverid: serverid,
      maps: sendMaps,
    });
    if ("error" in answer) {
      throw new Error(answer.error.message);
    }
  }

  async restartWorker({ sid }: IServerGet): Promise<void> {
    const answer = await this.postJsonMethod("restartworker", {
      serverid: sid,
    });
    if ("error" in answer) {
      throw new Error(answer.error.message);
    }
  }

  async manEditGroup({
    gid,
    value,
  }: {
    gid: string;
    value: string;
  }): Promise<void> {
    const answer = await this.postJsonMethod("maneditgroup", {
      groupid: gid,
      values: value,
    });
    if ("error" in answer) {
      throw new Error(answer.error.message);
    }
  }

  async getSeeding(gid: string, game: string): Promise<ISeederInfo> {
    return await this.getJsonMethod("getseeder", { groupid: gid, game: game });
  }

  async getSeeders(gid: string, game: string): Promise<ISeederList> {
    return await this.getJsonMethod("seeders", { groupid: gid, game: game });
  }

  async getServerAliases(
    gid: string,
    game: string,
  ): Promise<ISeederServerAliasName> {
    return await this.getJsonMethod("serveraliasname", {
      groupid: gid,
      game: game,
    });
  }

  async setSeeding({
    serverName,
    serverId,
    action,
    groupId,
    rejoin,
    message,
    game,
  }: {
    serverName: string;
    serverId: string;
    action: string;
    groupId: string;
    rejoin: boolean;
    message: string;
    game: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("seeder", {
      servername: serverName,
      serverid: serverId,
      action: action,
      groupid: groupId,
      rejoin: rejoin,
      message: message,
      game: game,
    });
  }

  async addSeederServer({
    groupId,
    game,
    servername,
  }: {
    groupId: string;
    game: string;
    servername: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("addseederserver", {
      groupid: groupId,
      servername: servername,
      game: game,
    });
  }

  async delSeederServer({
    groupId,
    game,
    servername,
  }: {
    groupId: string;
    game: string;
    servername: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("removeseederserver", {
      groupid: groupId,
      servername: servername,
      game: game,
    });
  }

  async addKeepAlive({
    serverId,
    hostname,
  }: {
    serverId: string;
    hostname: string;
  }) {
    return await this.postJsonMethod("addkeepalive", {
      serverid: serverId,
      hostname: hostname,
    });
  }

  async delKeepAlive({
    serverId,
    hostname,
  }: {
    serverId: string;
    hostname: string;
  }) {
    return await this.postJsonMethod("delkeepalive", {
      serverid: serverId,
      hostname: hostname,
    });
  }

  async scheduleSeeding({
    timeStamp,
    serverName,
    groupId,
  }: {
    timeStamp: string;
    serverName: string;
    groupId: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("seederschedule", {
      timestamp: timeStamp,
      servername: serverName,
      groupid: groupId,
    });
  }

  async undoScheduleSeeding({
    groupId,
  }: {
    groupId: string;
  }): Promise<IDefaultMessage> {
    return await this.postJsonMethod("undoseederschedule", {
      groupid: groupId,
    });
  }
}

export const OperationsApi = new ApiProvider();
