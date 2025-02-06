import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;
  private db: FirebaseFirestore.Firestore;

  constructor() {
    const serviceAccount = require('../../firebase-service-account.json');

    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as ServiceAccount),
    });
    this.db = this.firebaseApp.firestore();
  }

  getFirestore(): admin.firestore.Firestore {
    return this.db;
  }

  getAuth(): admin.auth.Auth {
    return this.firebaseApp.auth();
  }
}
