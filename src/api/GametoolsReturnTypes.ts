export type IPlatoonSearchResult = {
  cache: boolean;
  platoons: IPlatoonResult[];
};

export type IPlatoonResult = {
  currentSize: number;
  emblem: string;
  id: string;
  name: string;
  description: string;
  tag: string;
};

export type IPlatoonStats = {
  cache: boolean;
  canApplyToJoin: boolean;
  canJoinWithoutApply: boolean;
  currentSize: number;
  description: string;
  emblem: string;
  id: string;
  members: IPlatoonPlayer[];
  name: string;
  tag: string;
  servers: IServerList[];
};

export type IPlatoonPlayer = {
  // for mapping platoon in platoon playerlist
  [x: string]: string;
  id: string;
  name: string;
  role: string;
  avatar: string;
};

export type IServerList = {
  currentMap: string;
  inQue: number;
  inQueue?: number;
  mode: string;
  official: boolean;
  ownerId: number;
  platform: string;
  playerAmount: number;
  region: string;
  serverInfo: string;
  smallMode: string;

  url?: string;
  mapImage?: string;

  gameId?: string;
  serverId?: string;
  blazeGameId?: number;

  teams?: TeamList;
  prefix?: string;
  maxPlayerAmount?: number;

  map?: string;
  server?: string;
  maxPlayers?: number;
  mapName?: string;

  ip?: string;
  port?: string;
  hasPassword?: boolean;
};

export type TeamList = {
  teamOne: ServerTeams;
  teamTwo: ServerTeams;
};

export type ServerTeams = {
  image: string;
  key: string;
  name: string;
};

export interface IMainStats {
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

export interface IBfbanPlayers {
  personaId?: string;
  url: string;
  status: number;
  hacker: boolean;
  originId: string;
  originPersonaId: string;
  originUserId: string;
  cheatMethods: string;
}

export interface IManagerPlayers {
  vban: {
    [name: string]: { [name: string]: { bannedUntil: string; reason: string } };
  };
  otherNames: {
    [name: string]: {
      updateTimestamp: string;
      usedNames: string[];
    };
  };
  bfban: { [name: string]: IBfbanPlayers };
  bfeac: number[];
}

export interface IPlatoonApplicant {
  id: string;
  oid: string;
  name: string;
  avatar: string;
  timeStamp: number;
}

export interface IPlatoonApplicants {
  result: IPlatoonApplicant[];
}

export interface ICurrentServerInfo {
  name: string;
  gameId?: string;
}

export interface ICurrentServer {
  [name: string]: ICurrentServerInfo;
}
