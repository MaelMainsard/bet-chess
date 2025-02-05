import { Body, Controller, Post } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.config';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly firebaseService: FirebaseService) {}

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  @Post()
  async createNotification(@Body() data: any) {
    const firestore = this.firebaseService.getFirestore();
    const docRef = await firestore.collection('notifications').add(data);

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'symrb26@gmail.com',
      subject: 'New Notification Created',
      text: `A new notification was added: ${JSON.stringify(data)}`,
    };

    await this.transporter.sendMail(mailOptions);

    return { id: docRef.id, ...data };
  }
}
