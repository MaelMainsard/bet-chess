import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { BetService } from './bet.service';
import { BetController } from './bet.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [FirebaseModule, NotificationsModule],
  controllers: [BetController],
  providers: [BetService],
  exports: [BetService],
})
export class BetModule {}
