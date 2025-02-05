import { Player } from "src/player/player";

export class Match {
    id: string;
    whitePlayer: Player;
    blackPlayer: Player;
    status: MatchStatus;
    cote: Cote;
    result?: MatchResult;
  
    constructor(data: Partial<Match>) {
      Object.assign(this, data);
    }
  }
  
export type Cote = {
    whiteWin: number,
    blackWin: number,
    draw: number
}

export enum MatchStatus {
    ONGOING = "ONGOING",
    ENDED = "ENDED"
}

export enum MatchResult {
    WHITE = "WHITE",
    BLACK = "BLACK",
    DRAW = "DRAW"
}