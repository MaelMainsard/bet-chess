import { Module } from '@nestjs/common';
import { LichessService } from './lichess.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [LichessService],
  exports: [LichessService],
})
export class LichessModule {}
