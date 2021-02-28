import JsonClient from "./JsonApi";

export class ApiProvider extends JsonClient {

    constructor() {
        super();
    }

    logout() {
        var asyncUser = this.logoutAndChangeUser();
        this.user = asyncUser;
    }

    async logoutAndChangeUser() {
        await this.fetchMethod("logout/");
        var user = await this.getUserInfo();
        return user;
    }

    async kickPlayer({ sid, name, reason }) {
        return await this.postJsonMethod("changeplayer", {
            "request": "kickPlayer",
            "playername": name,
            "serverid": sid,
            "reason": reason
        });
    }

    async banPlayer({ name, reason, time, sid }) {
        return await this.postJsonMethod("changeserver", {
            "request": "addServerBan",
            "playername": name,
            "serverid": sid,
            "bantime": time.toString(),
            "reason": reason
        }); 
    }

    async addVip({ sid, name }) {
        return await this.postJsonMethod("changeserver", {
            "request": "addServerVip",
            "playername": name,
            "serverid": sid
        });
    }

    async movePlayer({ sid, team, name }) {
        return await this.postJsonMethod("moveplayer", {
            "teamid": team,
            "playername": name,
            "serverid": sid
        });
    }

    async getBanList( sid ) {
        return await this.getJsonMethod("infolist", {
            "type": "bannedList",
            "serverid": sid
        });
    }

    async getLogs() {
        return await this.getJsonMethod("taillog");
    }

    async getDevGroups() {
        return await this.getJsonMethod("devgroups");
    }

    async addGroup({ groupName, discordId, modRole, adminRole, sid, remid }) {
        return await this.postJsonMethod("addgroup", {
            "groupname": groupName,
            "adminroleid": adminRole,
            "discordid": discordId,
            "modroleid": modRole,
            "remid": remid,
            "sid": sid,
        });
    }

    async removeGroup({ gid }) {
        return await this.postJsonMethod("delgroup", {
            "groupId": gid,
        });
    }

    async getGroup(gid) {
        return await this.getJsonMethod("groups", { "groupid": gid });
    }

    async addGroupOwner({ gid, uid, nickname }) {
        return await this.postJsonMethod("addowner", {
            "userid": uid, // discord userid
            "nickname": nickname, // will change when the user signs in
            "groupid": gid,
        });
    }

    async addGroupAdmin({ gid, uid, nickname }) {
        return await this.postJsonMethod("addadmin", {
            "userid": uid, // discord userid
            "nickname": nickname, // will change when the user signs in
            "groupid": gid,
        });
    }

    async removeGroupAdmin({ gid, uid }) {
        return await this.postJsonMethod("deladmin", {
            "userid": uid,
            "groupid": gid,
        });
    }

    async removeGroupOwner({ gid, uid }) {
        return await this.postJsonMethod("delowner", {
            "userid": uid,
            "groupid": gid,
        });
    }

    async getServer(sid) {
        return await this.getJsonMethod("server", { "serverid": sid });
    }

    async getServerGame(sid) {
        return await this.getJsonMethod("servers", { "serverid": sid });
    }

    async removeServer({ gid, sid }) {
        return await this.postJsonMethod("delserver", {
            "serverid": sid,
            "groupid": gid,
        });
    }

    async renameServer({ name, sid }) {
        return await this.postJsonMethod("renameserver", {
            "serverid": sid,
            "servername": name,
        });
    }

    async changeServerAlias({ gid, alias, sid }) {
        return await this.postJsonMethod("serveralias", {
            "serverid": sid,
            "groupid": gid,
            "serveralias": alias,
        });
    }


}

export const OperationsApi = new ApiProvider();