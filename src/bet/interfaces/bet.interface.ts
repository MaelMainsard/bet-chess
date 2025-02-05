import { MatchResult } from '../../match/match';

export interface Bet {
  uid?: string;
  matchId: string;
  userId: string;
  bet: MatchResult;
  result?: boolean; // WIN / LOSE boolean
  bet_amount: number; //Le montant parié,
  result_amount?: number; // Le montant reçu ou perdu
}