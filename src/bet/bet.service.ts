import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.config';
import * as dotenv from 'dotenv';
import { AddBetDto } from './dto/add-bet.dto';
import { User } from '../auth/interfaces/user.interface';
import { Bet } from './interfaces/bet.interface';
import { Match, MatchResult } from '../match/match';
import { firestore } from 'firebase-admin';
import QuerySnapshot = firestore.QuerySnapshot;
import FieldValue = firestore.FieldValue;

dotenv.config();

@Injectable()
export class BetService {
  private readonly BET_COLLECTION = 'bet';
  private readonly MATCH_COLLECTION = 'match';
  private readonly USER_COLLECTION = 'users';

  constructor(
    private readonly firebaseService: FirebaseService,
  ) {}

  async newBet(credentials: AddBetDto, user: User): Promise<Bet> {
    try {

      const matchDoc = await this.firebaseService
        .getFirestore()
        .collection(this.MATCH_COLLECTION)
        .doc(credentials.matchId)
        .get();

      if (!matchDoc.exists) {
        throw new HttpException("Match not found", HttpStatus.NOT_FOUND);
      }

      const query: QuerySnapshot = await this.firebaseService
        .getFirestore()
        .collection(this.BET_COLLECTION)
        .where('matchId', '==', credentials.matchId)
        .get();

      if (!query.empty) {
        throw new HttpException("You can't bet in the same match multiple time !", HttpStatus.FORBIDDEN);
      }

      await this.firebaseService
        .getFirestore()
        .collection(this.USER_COLLECTION)
        .doc(user.uid!)
        .update({
          point: FieldValue.increment(-credentials.betAmount)
        })

      const newBet :Bet = {
        matchId: credentials.matchId,
        userId: user.uid!,
        bet: credentials.result,
        bet_amount: credentials.betAmount,
      }

      await this.firebaseService
        .getFirestore()
        .collection(this.BET_COLLECTION)
        .doc(credentials.matchId)
        .set(newBet)

      return newBet;

    } catch (error){
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async onMatchEnded(match: Match) {
    try {
      const query: QuerySnapshot = await this.firebaseService
        .getFirestore()
        .collection(this.BET_COLLECTION)
        .where('matchId', '==', match.id)
        .get();

      const bets: Bet[] = query.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      }) as Bet);

      for (const bet of bets) {

        const coteMap = {
          [MatchResult.WHITE]: match.cote.whiteWin,
          [MatchResult.BLACK]: match.cote.blackWin,
          [MatchResult.DRAW]: match.cote.draw,
        };

        bet.result = bet.bet === match.result;
        bet.result_amount = bet.result ? bet.bet_amount * coteMap[match.result!] : 0;

        const { uid, ...betWithoutUid } = bet;

        await this.firebaseService
          .getFirestore()
          .collection(this.BET_COLLECTION)
          .doc(uid!)
          .set(betWithoutUid);

        if(bet.result) {
          await this.firebaseService
            .getFirestore()
            .collection(this.USER_COLLECTION)
            .doc(bet.userId)
            .update({
              point: FieldValue.increment(bet.result_amount)
            })
        }
      }

    } catch (error){
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
