import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { NotificationService } from './notification.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [FirebaseModule, UserModule],
  exports: [NotificationService],
  providers: [NotificationService],
})
export class NotificationsModule {}
