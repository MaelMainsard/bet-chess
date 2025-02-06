import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
