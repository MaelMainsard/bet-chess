import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.config';
import { Match, MatchStatus } from './match';

@Injectable()
export class MatchService {
    private db: FirebaseFirestore.Firestore

    constructor(private readonly firebaseService: FirebaseService) {
        this.db = firebaseService.getFirestore();
    }

    async findAll(): Promise<Match[]> {
        const snapshot = await this.db.collection('match').get();
        return snapshot.docs.map(doc => new Match({ id: doc.id, ...doc.data() }));
    }    

    async findById(id: string): Promise<Match | null> {
        const doc = await this.db.collection('match').doc(id).get();
        return doc.exists ? new Match({ id: doc.id, ...doc.data() }) : null;
    }    

    async findAllOngoing(): Promise<Match[]> {
        const snapshot = await this.db.collection('match')
            .where('status', '==', MatchStatus.ONGOING) // Filtre les matchs en cours
            .get();
    
        return snapshot.docs.map(doc => new Match({ id: doc.id, ...doc.data() }));
    }

    async createMatch(match: Match) {
        await this.db.collection('match').add(match);
    
        return { ...match };
    }
}
