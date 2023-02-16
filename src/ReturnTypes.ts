export interface IUserInfo {
  auth: {
    isAdmin: boolean;
    isDeveloper: boolean;
    isManager: boolean;
    isOwner: boolean;
    signedIn: boolean;
  };
  discord: IUserDiscord;
  permissions: {
    isAdminOf: IUserServer[];
  };
}

export interface IDefaultMessage {
  id: string;
  jsonrpc: string;
  message: string;
}

export interface IDefaultMessageWithGid {
  id: string;
  jsonrpc: string;
  message: string;
  groupId: string;
}

export interface IUserDiscord {
  avatar: string;
  discriminator: string;
  name: string;
}

export interface IUserServer {
  createdAt?: string;
  groupName: string;
  id: string;
  servers?: string[];
}

export interface IGroupsInfo {
  data: IGroupInfo[];
}

export interface IGroupInfo {
  cookieLocale: string;
  cookies: IGroupCookie[];
  defaultCookie: string;
  discordAdminRoleId: string;
  discordGroupId: string;
  discordModRoleId: string;
  groupName: string;
  id: string;
  inWorker: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  lastCookieCheck: null;
  lastUpdate: string;
  makeOperations: boolean;
  servers: IGroupServer[];
  tokenUsed: boolean;
  visableBans: boolean;
  webhookUrl: string;
  workerEnabled: boolean;
  seederServers: ISeederServer[];
}

export interface ISeederServer {
  name: string;
  game: string;
}

export interface IGroupServer {
  addedAt?: string;
  game?: string;
  id?: string;
  index?: number;
  name?: string;
  serverAlias?: string;
  serverPlayers?: IGroupPlayerInfo;
  status?: string;
}

interface IGroupPlayerInfo {
  inQue: number;
  maxPlayerAmount: number;
  playerAmount: number;
}

export interface IGroupCookie {
  id: string;
  playerId: number;
  remid: string;
  sid: string;
  supportedGames: string[];
  username: string;
  validCookie: boolean;
}

export interface IGroupUser {
  addedAt: string;
  id: number;
  index: number;
  name: string;
}

export interface IGroupUsers {
  data: {
    admins: IGroupUser;
    owners: IGroupUser;
  };
}

export interface IGroupStats {
  autoKickPingAmount: number;
  banAmount: number;
  bfbanAmount: number;
  globalBanKickAmount: number;
  kickAmount: number;
  moveAmount: number;
  servers: string[]; //TODO remove...
}

export interface IServerStats {
  data: IServerStat;
}

export interface IServerStat {
  adminAmounts: number[];
  id: string;
  ingameBanAmounts: number[];
  mapAmount: { [string: string]: number };
  maps: string[];
  modeAmount: { [string: string]: number };
  modes: string[];
  playerAmounts: number[];
  serverName: string;
  timeStamps: string[];
  vipAmounts: number[];
  worstMap: { [string: string]: number };
}

export interface IGlobalGroupPlayer {
  data: IGlobalGroupPlayerInfo[];
}

export interface IGlobalGroupPlayerInfo {
  admin?: string;
  adminId?: number;
  bannedUntil?: string;
  id?: number | string;
  playerName: string;
  reason?: string;
  timeStamp?: string;
  unixTimeStamp?: number;
}

export interface IReasonList {
  data: IReason[];
}

export interface IReason {
  id?: string;
  item?: string;
}

export interface ISeederInfo {
  action: string;
  gameId: number;
  groupId: string;
  keepAliveSeeders: IKeepAliveSeeder;
  rejoin: boolean;
  seederArr: string[];
  serverName: string;
  startServer: null;
  startTime: null;
  timeStamp: number;
}

export interface IKeepAliveSeeder {
  [string: string]: {
    gameId: number;
    serverName: string;
  };
}

export interface ISeederList {
  seeders: ISeeder[];
}

export interface ISeeder {
  currentServer: string;
  gameId: number;
  groupId: string;
  isRunning: boolean;
  seederName: string;
  timeStamp: string;
}

export interface ISeederServerAliasName {
  [string: string]: string;
}

export interface ITailUserLog {
  logs: ITailUserLogInfo[];
}

export interface ITailUserLogInfo {
  action: string;
  adminName: string;
  inGroup: string;
  reason: string;
  timeStamp: string;
  toPlayer: string;
  toPlayerId: number;
  userLog: boolean;
  serverName: string;
}

export interface ITailServerLog {
  logs: ITailServerLogItem[];
}

export interface ITailServerLogItem {
  action: string;
  adminName: string;
  inServer: string;
  reason: string;
  timeStamp: string;
  toPlayer: string;
  toPlayerId: number;
}

export interface IServerInfo {
  addedAt: string;
  autoBanKick: boolean;
  autoBfBanMessage: string;
  autoBfbanKick: true;
  autoGlobalBanMessage: string;
  autoPingKick: number;
  autoPingKickMessage: string;
  botInfo: {
    currentNode: string;
    serviceId: string;
    serviceName: string;
    state: string;
    taskCreationDate: string;
  };
  cookie: string;
  discordBotChannel: number;
  discordBotMinPlayerAmount: number;
  discordBotOwnerId: number;
  discordBotPrevReqCount: number;
  discordBotStartedAmount: number;
  discordBotToken: string;
  editPerms: boolean;
  game: string;
  id: string;
  kickMaxRank: number;
  kickMinRank: number;
  minAutoPingKick: number;
  rankKickReason: string;
  serverAlias: number;
  serverName: string;
}

export interface IInGameServerInfo {
  data: {
    game: string;
    info: {
      createdDate: number;
      expirationDate: number;
      inQue: number;
      map: string;
      maxPlayerAmount: number;
      mode: string;
      persistentId: string;
      playerAmount: number;
      prefix: string;
      rotation: IServerRotation[];
      rotationId: number;
      serverInfo: string;
      smallmode: string;
      url: string;
    };
    ingameServerId: string;
    isAdmin: boolean;
    players: IServerTeam[];
    serverStatus: string;
    spectators: IServerPlayer[];
    update_timestamp: string;
    worker_timestamp: string;
  }[];
}

export interface IServerRotation {
  image: string;
  index: number;
  mapname: string;
  mode: string;
}

export interface IServerTeam {
  faction: string;
  players: IServerPlayer[];
  teamid: number;
}

export interface IServerPlayer {
  joinTime?: number;
  localization?: string;
  name: string;
  ping?: number;
  platformId?: string;
  platoon?: string;
  playerId?: number;
  position?: number;
  rank?: number;
  userId?: number;
}

export interface ICookieList {
  data: ICookie[];
}

export interface ICookie {
  id: string;
  name: string;
  pid: string;
}

export interface IBanList {
  data: IBan[];
}

export interface IBan {
  admin: string;
  avatar: string;
  ban_timestamp: string;
  banned_until: string;
  displayName: string;
  id: string;
  reason: string;
  unixBanTimeStamp: number;
  unixBanUntilTimeStamp: number;
  platform?: string;
  oid?: string;
}

export interface IInfoList {
  data: IInfo[];
}

export interface IInfo {
  avatar: string;
  displayName: string;
  id: string;
}

export interface IFirestarterList {
  data: IFireStarter[];
}

export interface IFireStarter {
  amount: number;
  platoon: string;
  playerId: number;
  playerName: string;
}

export interface IPlayingScoreboard {
  data: IPlayingScoreboardPlayer[];
}

export interface IPlayingScoreboardPlayer {
  localization: string;
  name: string;
  platoon: string;
  playerId: number;
  position: number;
  rank: number;
  timePlayed: number;
  userId: number;
}

export interface IPlayerLog {
  currentDate: string[];
  data: IPlayerLogPlayer[];
  dates: string[];
  intDates: number[];
}

export interface IPlayerLogPlayer {
  joinTime: number;
  localization: string;
  name: string;
  ping: number;
  platformId: string;
  platoon: string;
  playerId: number;
  position: number;
  rank: number;
  userId: number;
  role?: string;
}

export interface IDevGroups {
  data: IDevGroup[];
}

export interface IDevGroup {
  groupName: string;
  id: string;
}

export interface IManGroups {
  data: IManGroup[];
}

export interface IManGroup {
  cookieInfo: IManGroupCookie[];
  createdAt: string;
  groupName: string;
  id: string;
  makeOperations: boolean;
  owners: IManGroupOwner[];
  servers: IManGroupServer[];
}

export interface IManGroupCookie {
  cookieAcc: string;
  lastUpdate: string;
}

export interface IManGroupOwner {
  displayName: string;
  avatar: string;
  createdAt: string;
  id: number;
  nickName: string;
}

export interface IManGroupServer {
  autoBanKick: boolean;
  autoBfbanKick: boolean;
  autoPingKick: number;
  createdAt: string;
  id: string;
  isAdmin: boolean;
  lastUpdate: number;
  serverName: string;
  status: string;
}

export interface IStartsReturn {
  avatar: string;
  userName: string;
  id: number;
  rank: number;
  rankImg: string;
  rankName: string;
  skill: number;
  scorePerMinute: number;
  killsPerMinute: number;
  winPercent: string;
  bestClass: string;
  accuracy: string;
  headshots: string;
  timePlayed: string;
  secondsPlayed: number;
  killDeath: number;
  infantryKillDeath: number;
  infantryKillsPerMinute: number;
  kills: number;
  deaths: number;
  wins: number;
  loses: number;
  longestHeadShot: number;
  revives: number;
  dogtagsTaken: number;
  highestKillStreak: number;
  roundsPlayed: number;
  awardScore: number;
  bonusScore: number;
  squadScore: number;
  currentRankProgress: number;
  totalRankProgress: number;
  avengerKills: number;
  saviorKills: number;
  headShots: number;
  heals: number;
  repairs: number;
  killAssists: number;
}

export interface IManagerStats {
  amounts: {
    communities: number;
    servers: number;
    perWeek: {
      bfbanKicks: number;
      movedPlayers: number;
      kickedPlayers: number;
      bannedPlayers: number;
      globalbanKicks: number;
      pingKicks: number;
    };
  };
}

export interface IBfvPlaygrounds {
  playgrounds: IBfvPlayground[];
}

export interface IBfvPlayground {
  serverdesc?: {
    serverName: string;
  };
  playgroundId: string;
  configName: string;
  checksum: string;
}

export interface IKickResult {
  id: string;
  jsonrpc: string;
  result: {
    personaId: string;
    reason: string;
  };
}

export interface IMoveResult {
  id: string;
  jsonrpc: string;
  result: {
    personaId: string;
    success: boolean;
  };
}

export interface IServerActionResult {
  id: string;
  jsonrpc: string;
  result: {
    env: {
      blazeEnv: string;
      game: string;
      platform: string;
      rootEnv: string;
    };
  };
}

export interface IServerChangeRotation {
  id: string;
  jsonrpc: string;
  result: {
    env: {
      blazeEnv: string;
      game: string;
      platform: string;
      rootEnv: string;
    };
    levelIndex: string;
    persistedGameId: string;
    serverId: string;
  };
}

export interface IBfvCreateServer {
  gameId: number;
  pingSite: string;
}

export interface IServerOperationSuccess {
  info: string;
}

export interface ISeederGameItem {
  id?: string;
  name?: string;
  shortName?: string;
  image?: string;
  type?: string;
  subtype?: string;
  class?: string;
}

export interface ISeederServerPlayer {
  index?: number;
  teamId: number;
  mark: number;
  platoon?: {
    tag: string;
    name: string;
    icon: string;
  };
  squad_id?: number;
  squad_name?: string;
  rank: number;
  name: string;
  player_id: number;
  kills: number;
  deaths: number;
  score: number;
  player_class?: {
    id: string;
    name?: string;
    black?: string;
    white?: string;
  };
  Spectator?: 0;
  vehicle?: ISeederGameItem;
  weapons?: ISeederGameItem[];
}

export interface ISeederServerInfo {
  _id: string;
  gameId: number;
  ingameChat?: {
    timestamp: string;
    sender: string;
    content: string;
  }[];
  serverinfo: {
    country: string;
    description: string;
    level: string;
    maps: string[];
    mode: string;
    name: string;
    owner: string;
    region: string;
    servertype: string;
    settings: string[];
  };
  teams: {
    players: ISeederServerPlayer[];
    teamid: string;
    image: string;
    name: string;
    score: number;
    faction?: string;
    key?: string;
    scoreFromKills?: number;
    scoreFromFlags?: number;
  }[];
  timeStamp: string;
  update_timestamp: number;
}
