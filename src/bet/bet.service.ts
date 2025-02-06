import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.config';
import * as dotenv from 'dotenv';
import { AddBetDto } from './dto/add-bet.dto';
import { User } from '../auth/interfaces/user.interface';
import { Bet } from './interfaces/bet.interface';
import { Match, MatchResult, MatchStatus } from '../match/match';
import { firestore } from 'firebase-admin';
import QuerySnapshot = firestore.QuerySnapshot;
import FieldValue = firestore.FieldValue;
import { NotificationService } from 'src/notifications/notification.service';
import { ErrorCode } from './constant/errors.code';
import { MatchService } from 'src/match/match.service';

dotenv.config();

@Injectable()
export class BetService {
  private readonly BET_COLLECTION = 'bet';
  private readonly USER_COLLECTION = 'users';

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly matchService: MatchService,
    private readonly notificationService: NotificationService,
  ) {}

  async newBet(credentials: AddBetDto, user: User): Promise<Bet> {
    try {
      const match = await this.matchService.findById(credentials.matchId);
      if (!match) throw new Error(ErrorCode.MATCH_NOT_FOUND);
      if (match.status == MatchStatus.ENDED)
        throw new Error(ErrorCode.MATCH_ENDED);

      const query: QuerySnapshot = await this.firebaseService
        .getFirestore()
        .collection(this.BET_COLLECTION)
        .where('matchId', '==', credentials.matchId)
        .get();

      if (!query.empty) {
        throw new Error(ErrorCode.MULTIPLE_BET_FORBIDDEN);
      }

      if (user.point < credentials.betAmount) {
        throw new Error(ErrorCode.BET_AMOUNT_NOT_VALID);
      }

      await this.firebaseService
        .getFirestore()
        .collection(this.USER_COLLECTION)
        .doc(user.uid!)
        .update({
          point: FieldValue.increment(-credentials.betAmount),
        });

      const newBet: Bet = {
        matchId: credentials.matchId,
        userId: user.uid!,
        bet: credentials.result,
        bet_amount: credentials.betAmount,
      };

      await this.firebaseService
        .getFirestore()
        .collection(this.BET_COLLECTION)
        .doc()
        .set(newBet);

      return newBet;
    } catch (error) {
      switch (error.message) {
        case ErrorCode.MATCH_NOT_FOUND:
          throw new HttpException(error.message, HttpStatus.NO_CONTENT);
        case ErrorCode.MATCH_ENDED:
          throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
        case ErrorCode.MULTIPLE_BET_FORBIDDEN:
          throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
        case ErrorCode.BET_AMOUNT_NOT_VALID:
          throw new HttpException(error.message, HttpStatus.NOT_ACCEPTABLE);
        default:
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async onMatchEnded(match: Match) {
    try {
      const query: QuerySnapshot = await this.firebaseService
        .getFirestore()
        .collection(this.BET_COLLECTION)
        .where('matchId', '==', match.id)
        .get();

      const bets: Bet[] = query.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            uid: doc.id,
          }) as Bet,
      );

      for (const bet of bets) {
        const coteMap = {
          [MatchResult.WHITE]: match.cote.whiteWin,
          [MatchResult.BLACK]: match.cote.blackWin,
          [MatchResult.DRAW]: match.cote.draw,
        };

        bet.isResultWin = bet.bet === match.result;
        bet.result_amount = bet.isResultWin
          ? bet.bet_amount * coteMap[match.result!]
          : 0;

        const { uid, ...betWithoutUid } = bet;

        await this.firebaseService
          .getFirestore()
          .collection(this.BET_COLLECTION)
          .doc(uid!)
          .set(betWithoutUid);

        if (bet.isResultWin) {
          await this.firebaseService
            .getFirestore()
            .collection(this.USER_COLLECTION)
            .doc(bet.userId)
            .update({
              point: FieldValue.increment(bet.result_amount),
            });
        }

        await this.notificationService.sendBetNotification(match, bet);
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
