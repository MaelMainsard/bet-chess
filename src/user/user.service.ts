import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { User } from './user';
import { firestore } from 'firebase-admin';

@Injectable()
export class UserService {
  private readonly USER_COLLECTION = 'users';

  constructor(private readonly firebaseService: FirebaseService) {}

  // Find a user by id
  async findById(id: string): Promise<User | null> {
    const doc = await this.firebaseService
      .getFirestore()
      .collection(this.USER_COLLECTION)
      .doc(id)
      .get();
    return doc.exists ? new User({ uid: doc.id, ...doc.data() }) : null;
  }

  // Update the field point
  async incrementPoints(userId: string, points: number) {
    this.firebaseService
      .getFirestore()
      .collection(this.USER_COLLECTION)
      .doc(userId)
      .update({
        point: firestore.FieldValue.increment(points),
        updatedAt: new Date(),
      });
  }

  // Create or update a user
  async setUser(user: User) {
    await this.firebaseService
      .getFirestore()
      .collection(this.USER_COLLECTION)
      .doc(user.uid)
      .set(user.toJSON());
  }

  // Update the field lastLogin
  async updateLastLogin(userId: string) {
    await this.firebaseService
      .getFirestore()
      .collection(this.USER_COLLECTION)
      .doc(userId)
      .update({
        lastLogin: new Date(),
        updatedAt: new Date(),
      });
  }

  // Find a user by id
  async usernameExists(username: string): Promise<boolean> {
    const query = await this.firebaseService
      .getFirestore()
      .collection(this.USER_COLLECTION)
      .where('username', '==', username)
      .get();
    return !query.empty;
  }

  // Find a user by id
  async emailExists(email: string): Promise<boolean> {
    const query = await this.firebaseService
      .getFirestore()
      .collection(this.USER_COLLECTION)
      .where('email', '==', email)
      .get();
    return !query.empty;
  }
}
