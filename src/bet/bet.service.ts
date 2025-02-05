import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.config';
import * as dotenv from 'dotenv';
import { AddBetDto } from './dto/add-bet.dto';
import { User } from '../auth/interfaces/user.interface';
import { Bet } from './interfaces/bet.interface';
import { Match } from '../match/match';
import { firestore } from 'firebase-admin';
import QuerySnapshot = firestore.QuerySnapshot;
import { ErrorCode } from '../auth/constant/errors.code';
dotenv.config();

@Injectable()
export class BetService {
  private readonly BET_COLLECTION = 'bet';
  private readonly MATCH_COLLECTION = 'match';

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



    } catch (error){
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
