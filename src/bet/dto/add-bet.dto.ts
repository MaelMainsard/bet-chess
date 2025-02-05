import { IsNumber, IsPositive, IsString } from 'class-validator';
import { MatchResult } from '../../match/match';
import { IsResultValid } from '../validator/result-valid.validator';

export class AddBetDto {
  @IsString()
  matchId: string;

  @IsString()
  @IsResultValid()
  result: MatchResult;

  @IsNumber()
  @IsPositive()
  betAmount: number;
}
