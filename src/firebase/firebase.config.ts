import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor() {
    const serviceAccount = require('../../firebase-service-account.json');

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as ServiceAccount),
    });
  }

  getFirestore(): admin.firestore.Firestore {
    return this.firebaseApp.firestore();
  }

  getAuth(): admin.auth.Auth {
    return this.firebaseApp.auth();
  }
}
