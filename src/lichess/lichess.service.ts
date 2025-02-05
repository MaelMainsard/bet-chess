import { Injectable, OnModuleInit } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.config';
import axios from 'axios';
import {
  Match,
  Cote,
  matchResultFromString,
  MatchStatus,
  MatchResult,
} from 'src/match/match';
import { Player } from 'src/player/player';
import { MatchService } from 'src/match/match.service';
import { isNullOrUndefined } from 'util';
import { MatchModule } from 'src/match/match.module';

@Injectable()
export class LichessService implements OnModuleInit {
  private readonly channelsUrl = 'https://lichess.org/api/tv/channels';
  private readonly streamUrl =
    'https://lichess.org/api/stream/games/bet-chess-stream';
  private currentStream: any = null;

  constructor(private readonly matchService: MatchService) {}

  onModuleInit() {
    setTimeout(() => this.checkOngoingGames(), 100);
    setTimeout(() => this.startWatchingBulletGames(), 4000);
  }

  private async checkOngoingGames() {
    console.log('Fetching ongoing matches...');
    const matches = await this.matchService.findAllOngoing();

    for (const match of matches) {
      const response = await axios.get(
        'https://lichess.org/game/export/' + match.id,
      );
      const game = response.data;
      if (!game) continue;
      if (game.status <= 20) continue;

      console.log('Match ended : ' + match.id);

      this.updateMatch(match.id, game);
    }
  }

  private async startWatchingBulletGames() {
    console.log('Fetching Bullet game ID...');

    try {
      // Step 1: Fetch Lichess TV Channels to get the Bullet game ID
      const response = await axios.get(this.channelsUrl);
      const gameId = response.data?.bullet?.gameId;

      if (!gameId) {
        console.error('Bullet game ID not found!');
        setTimeout(() => this.startWatchingBulletGames(), 10000); // Retry after 5 sec
        return;
      }

      console.log(`Watching game: ${gameId}`);

      // Step 2: Stream the game using the gameId
      this.streamGame(gameId);
    } catch (error) {
      console.error('Error fetching Bullet game ID:', error);
      setTimeout(() => this.startWatchingBulletGames(), 10000); // Retry after 5 sec
    }
  }

  private async streamGame(gameId: string) {
    try {
      console.log(`Streaming game ${gameId}...`);

      // Close the previous stream if it exists
      if (this.currentStream) {
        this.currentStream.destroy();
      }

      const response = await axios({
        method: 'post',
        url: this.streamUrl,
        headers: {
          'Content-Type': 'text/plain',
        },
        data: gameId,
        responseType: 'stream',
      });

      this.currentStream = response.data;

      response.data.on('data', async (chunk: Buffer) => {
        const jsonString = chunk.toString().trim();
        if (!jsonString) return;

        try {
          const match = await this.updateMatch(gameId, JSON.parse(jsonString));

          // Check if the game is finished
          if (match.status == MatchStatus.ENDED) {
            console.log(`Game ${gameId} finished, starting a new game...`);
            this.currentStream.destroy(); // Close current stream before restarting
            setTimeout(() => this.startWatchingBulletGames(), 10000); // Start watching a new game in 5 sec
          }
        } catch (error) {
          console.error('Error parsing game stream data:', error);
        }
      });

      response.data.on('error', (error) => {
        console.error('Stream error:', error);
        setTimeout(() => this.startWatchingBulletGames(), 10000); // Restart
      });
    } catch (error) {
      console.error('Error connecting to game stream:', error);
      setTimeout(() => this.startWatchingBulletGames(), 10000); // Retry
    }
  }

  private async updateMatch(gameId: string, game): Promise<Match> {
    const match = new Match({
      id: gameId,
      whitePlayer: new Player({
        id: game.players.white.userId ?? game.players.white.user.id,
        rating: game.players.white.rating,
      }),
      blackPlayer: new Player({
        id: game.players.black.userId ?? game.players.black.user.id,
        rating: game.players.black.rating,
      }),
      status: game.status <= 20 ? MatchStatus.ONGOING : MatchStatus.ENDED,
      result:
        game.status == 34
          ? MatchResult.DRAW
          : matchResultFromString(game.winner),
    });

    await this.matchService.setMatch(match);

    return match;
  }
}
