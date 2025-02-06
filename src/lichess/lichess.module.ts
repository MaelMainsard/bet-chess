import { Module } from '@nestjs/common';
import { LichessService } from './lichess.service';
import { MatchModule } from 'src/match/match.module';
import { BetModule } from 'src/bet/bet.module';

@Module({
  imports: [MatchModule, BetModule],
  providers: [LichessService],
  exports: [LichessService],
})
export class LichessModule {}
