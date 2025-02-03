import { Body, Controller, Post } from '@nestjs/common';
import { FirebaseService } from '../config/firebase.config';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post()
  async createNotification(@Body() data: any) {
    const firestore = this.firebaseService.getFirestore();
    const docRef = await firestore.collection('notifications').add(data);

    return { id: docRef.id, ...data };
  }
}
