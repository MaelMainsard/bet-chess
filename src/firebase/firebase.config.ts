import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

import { ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private firebaseApp: admin.app.App;

  constructor() {
    const serviceAccount = require('../../firebase-service-account.json');
    const isDev:boolean = process.env.NODE_ENV === 'development';
    if(isDev) {
      process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';
      process.env['FIREBASE_AUTH_EMULATOR_HOST'] = 'localhost:9099';
    }

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
