import { Injectable } from '@nestjs/common';
import { Match } from 'src/match/match';
import { Bet } from 'src/bet/interfaces/bet.interface';
import { UserService } from 'src/user/user.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  constructor(private readonly userService: UserService) {}

  // Send a notification about a bet result (by email)
  async sendBetNotification(match: Match, bet: Bet) {
    console.log('Sending email to ', bet.userId);

    const user = await this.userService.findById(bet.userId);
    if (!user) return;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: bet.isResultWin
        ? 'Vous avez gagné votre pari !'
        : 'Vous avez perdu votre pari !',
      text: bet.isResultWin
        ? `Gains : ${bet.result_amount}`
        : `Pertes : ${bet.bet_amount}`,
    };
    await this.transporter.sendMail(mailOptions);
  }
}
