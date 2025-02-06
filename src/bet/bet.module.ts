import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { BetService } from './bet.service';
import { BetController } from './bet.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MatchModule } from 'src/match/match.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [FirebaseModule, MatchModule, UserModule, NotificationsModule],
  controllers: [BetController],
  providers: [BetService],
  exports: [BetService],
})
export class BetModule {}
