import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MatchModule } from './match/match.module';
import { LichessModule } from './lichess/lichess.module';
import { BetModule } from './bet/bet.module';

@Module({
  imports: [
    MatchModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LichessModule,
    FirebaseModule,
    AuthModule,
    NotificationsModule,
    BetModule,
  ],
})
export class AppModule {}
