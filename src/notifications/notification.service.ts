import { Body, Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.config';
import * as nodemailer from 'nodemailer';
import { Match } from 'src/match/match';
import { Bet } from 'src/bet/interfaces/bet.interface';

@Injectable()
export class NotificationService {
  private readonly NOTIFICATIONS_COLLECTION = 'notifications';
  private readonly USERS_COLLECTION = 'users';

  private db: FirebaseFirestore.Firestore;

  constructor(private readonly firebaseService: FirebaseService) {
    this.db = firebaseService.getFirestore();
  }

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendBetNotification(match: Match, bet: Bet) {
    const userDoc = await this.firebaseService
      .getFirestore()
      .collection(this.USERS_COLLECTION)
      .doc(bet.userId)
      .get();
    if (!userDoc.exists) return;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userDoc.data()!.email,
      subject: bet.result
        ? 'Vous avez gagné votre pari !'
        : 'Vous avez perdu votre pari !',
      text: bet.result
        ? `Gains : ${bet.result_amount}`
        : `Pertes : ${bet.bet_amount}`,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
