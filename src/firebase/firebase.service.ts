import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

import { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;
  private db: FirebaseFirestore.Firestore;

  constructor() {
    const serviceAccount = require('../../firebase-service-account.json');
    console.log(serviceAccount);
    const isDev: boolean = process.env.NODE_ENV === 'development';
    const isTest: boolean = process.env.NODE_ENV === 'test';
    if (isDev || isTest) {
      process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
      process.env['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099';
    }

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
