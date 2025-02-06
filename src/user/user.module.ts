import { Module } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { UserService } from './user.service';

@Module({
  imports: [FirebaseService],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
