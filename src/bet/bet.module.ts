import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { BetService } from './bet.service';
import { BetController } from './bet.controller';

@Module({
  imports: [FirebaseModule,],
  controllers: [BetController],
  providers: [BetService],
  exports: [BetService],
})
export class BetModule {}