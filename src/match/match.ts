import { Player } from 'src/player/player';

export class Match {
  id: string;
  whitePlayer: Player;
  blackPlayer: Player;
  status: MatchStatus;
  cote: Cote;
  result: MatchResult | null;

  constructor(data: Partial<Match>) {
    Object.assign(this, data);
  }

  toJSON() {
    try {
      return {
        id: this.id,
        whitePlayer: this.whitePlayer.toJSON(),
        blackPlayer: this.blackPlayer.toJSON(),
        status: this.status,
        cote: this.cote,
        result: this.result,
      };
    } catch (e) {
      console.log(this);
      throw e;
    }
  }

  static fromJSON(data: any): Match {
    return new Match({
      id: data.id,
      whitePlayer: Player.fromJSON(data.whitePlayer),
      blackPlayer: Player.fromJSON(data.blackPlayer),
      status: data.status,
      cote: data.cote,
      result: data.result || null,
    });
  }
}

export type Cote = {
  whiteWin: number;
  blackWin: number;
  draw: number;
};

export enum MatchStatus {
  ONGOING = 'ONGOING',
  ENDED = 'ENDED',
}

export enum MatchResult {
  WHITE = 'WHITE',
  BLACK = 'BLACK',
  DRAW = 'DRAW',
}

export function matchResultFromString(result: string): MatchResult | null {
  switch (result) {
    case 'white':
      return MatchResult.WHITE;
    case 'black':
      return MatchResult.BLACK;
    case 'draw':
      return MatchResult.DRAW;
    default:
      return null;
  }
}
