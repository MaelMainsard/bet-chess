import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/config/firebase.config';

@Injectable()
export class MatchService {
    private db: FirebaseFirestore.Firestore

    constructor(private readonly firebaseService: FirebaseService) {
        this.db = firebaseService.getFirestore();
    }

    async findAll() {
        const snapshot = await this.db.collection('match').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    async findById(id: string) {
        const doc = await this.db.collection('matches').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }

    async createMatch(data: any) {
        const docRef = await this.db.collection('match').add(data);
    
        return { id: docRef.id, ...data };
    }
}
