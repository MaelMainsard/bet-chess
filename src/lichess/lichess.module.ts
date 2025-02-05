import { Module } from '@nestjs/common';
import { LichessService } from './lichess.service';
import { MatchModule } from 'src/match/match.module';

@Module({
  imports: [MatchModule],
  providers: [LichessService],
  exports: [LichessService],
})
export class LichessModule {}
