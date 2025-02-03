import { Global, Module } from '@nestjs/common';
import { FirebaseService } from '../config/firebase.config';

@Global()
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
