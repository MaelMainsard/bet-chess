import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { Match, MatchStatus } from './match';

@Injectable()
export class MatchService {
  private readonly MATCH_COLLECTION = 'match';

  constructor(private readonly firebaseService: FirebaseService) {}

  // Find a match by id
  async findById(id: string): Promise<Match | null> {
    const doc = await this.firebaseService
      .getFirestore()
      .collection(this.MATCH_COLLECTION)
      .doc(id)
      .get();
    return doc.exists ? Match.fromJSON({ id: doc.id, ...doc.data() }) : null;
  }

  // Find all ongoing matches
  async findAllOngoing(): Promise<Match[]> {
    const snapshot = await this.firebaseService
      .getFirestore()
      .collection(this.MATCH_COLLECTION)
      .where('status', '==', MatchStatus.ONGOING) // Filtre les matchs en cours
      .get();

    return snapshot.docs.map((doc) =>
      Match.fromJSON({ id: doc.id, ...doc.data() }),
    );
  }

  // Create or update a match
  async setMatch(match: Match) {
    await this.firebaseService
      .getFirestore()
      .collection(this.MATCH_COLLECTION)
      .doc(match.id)
      .set(match.toJSON());
  }
}
