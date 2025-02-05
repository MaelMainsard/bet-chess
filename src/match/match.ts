import { Player } from 'src/player/player';

export class Match {
  id: string;
  whitePlayer: Player;
  blackPlayer: Player;
  status: MatchStatus;
  cote: Cote;
  result: MatchResult | null;

  private static readonly RATING_STEP = 20;
  private static readonly MAX_RATING_DIFF = 260;
  private static readonly DrawProbability: Record<number, number> = {
    0: 0.57,
    20: 0.54,
    40: 0.54,
    60: 0.52,
    80: 0.51,
    100: 0.5,
    120: 0.45,
    140: 0.42,
    160: 0.4,
    180: 0.37,
    200: 0.34,
    220: 0.31,
    240: 0.3,
    260: 0.28,
  };

  constructor(data: Partial<Match>) {
    Object.assign(this, data);
    if (!this.cote) this.computeCote();
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

  private computeCote(): void {
    console.log('coucouc');
    const whiteWinProb = Match.getWinProbability(
      this.whitePlayer.rating,
      this.blackPlayer.rating,
    );
    const blackWinProb = Match.getWinProbability(
      this.blackPlayer.rating,
      this.whitePlayer.rating,
    );
    const drawProb = Match.getDrawProbability(
      this.whitePlayer.rating,
      this.blackPlayer.rating,
    );

    this.cote = {
      whiteWin: Match.toOdds(whiteWinProb),
      blackWin: Match.toOdds(blackWinProb),
      draw: Match.toOdds(drawProb),
    };
  }

  private static getDrawProbability(ratingA: number, ratingB: number): number {
    const ratingDiff = Math.abs(ratingA - ratingB);
    const adjustedDiff = Math.min(
      Math.floor(ratingDiff / this.RATING_STEP) * this.RATING_STEP,
      this.MAX_RATING_DIFF,
    );
    return this.DrawProbability[adjustedDiff];
  }

  private static getWinProbability(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  private static toOdds(probability: number): number {
    return probability > 0 ? 1 / probability : Infinity;
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
